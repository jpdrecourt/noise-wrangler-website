#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the article lists
const articlesListPath = './docs/js/articles-list.js';
const blogListPath = './docs/js/blog-list.js';

function readArticleList(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/const articles = \[([\s\S]*?)\]/);
  if (match) {
    const arrayContent = match[1];
    const articles = arrayContent
      .split(/[,\n]/)
      .map(line => line.trim())
      .filter(line => line.startsWith("'") && line.includes("'"))
      .map(line => {
        const start = line.indexOf("'");
        const end = line.lastIndexOf("'");
        return line.substring(start + 1, end);
      })
      .filter(line => line.length > 0); // Remove empty strings
    return articles;
  }
  return [];
}

function readArticleMetadata(slug, type = 'article') {
  const indexPath = `./docs/articles/${slug}/index.html`;
  
  if (!fs.existsSync(indexPath)) {
    console.warn(`Warning: ${indexPath} does not exist`);
    return null;
  }

  const content = fs.readFileSync(indexPath, 'utf8');
  const stats = fs.statSync(indexPath);
  
  // Use Open Graph metadata for better consistency
  const ogTitleMatch = content.match(/<meta\s+property="og:title"\s+content="([^"]*?)"/);
  const ogDescMatch = content.match(/<meta\s+property="og:description"\s+content="([^"]*?)"/);
  const ogImageMatch = content.match(/<meta\s+property="og:image"\s+content="([^"]*?)"/);
  const publishedTimeMatch = content.match(/<meta\s+property="article:published_time"\s+content="([^"]*?)"/);
  
  // Extract title without the "- Noise Wrangler" suffix
  let title = ogTitleMatch ? ogTitleMatch[1] : slug;
  if (title.includes(' - Noise Wrangler')) {
    title = title.replace(' - Noise Wrangler', '').trim();
  }
  
  const description = ogDescMatch ? ogDescMatch[1] : '';
  const image = ogImageMatch ? ogImageMatch[1] : '';
  
  // Use published time if available, otherwise fall back to file modification time
  let publishedDate;
  if (publishedTimeMatch) {
    publishedDate = new Date(publishedTimeMatch[1]);
  } else {
    publishedDate = stats.mtime;
    console.warn(`Warning: No article:published_time found for ${slug}, using file modification time`);
  }
  
  return {
    slug,
    title,
    description,
    type,
    url: `https://noisewrangler.art/articles/${slug}/`,
    guid: `https://noisewrangler.art/articles/${slug}/`,
    publishedDate: publishedDate,
    image
  };
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

// Dated Now-page snapshots (now-YYYY-MM.html). Each is an immutable record of
// one quarter's Now page and becomes one feed item. Self-maintaining: globs the
// docs dir, so new snapshots are picked up without editing a list.
function readNowSnapshots() {
  const docsDir = './docs';
  const snapshots = [];
  for (const file of fs.readdirSync(docsDir)) {
    const m = file.match(/^now-(\d{4})-(\d{2})\.html$/);
    if (!m) continue;
    const year = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    const content = fs.readFileSync(path.join(docsDir, file), 'utf8');
    const ogDescMatch = content.match(/<meta\s+property="og:description"\s+content="([^"]*?)"/);
    const ogImageMatch = content.match(/<meta\s+property="og:image"\s+content="([^"]*?)"/);
    snapshots.push({
      slug: file.replace(/\.html$/, ''),
      title: `Now — ${MONTHS[month - 1]} ${year}`,
      description: ogDescMatch ? ogDescMatch[1] : '',
      type: 'now',
      url: `https://noisewrangler.art/${file}`,
      guid: `https://noisewrangler.art/${file}`,
      publishedDate: new Date(Date.UTC(year, month - 1, 1, 12, 0, 0)),
      image: ogImageMatch ? ogImageMatch[1] : ''
    });
  }
  return snapshots;
}

function generateRSSItem(article) {
  const category = article.type === 'blog' ? 'Presques Riens'
    : article.type === 'now' ? 'Now'
    : 'Music';
  const pubDate = article.publishedDate.toUTCString();
  
  let imageElement = '';
  if (article.image) {
    imageElement = `
        <enclosure url="${article.image}" type="image/jpeg" length="0" />`;
  }
  
  return `    <item>
        <title>${escapeXml(article.title)}</title>
        <description>${escapeXml(article.description)}</description>
        <link>${article.url}</link>
        <guid>${article.guid}</guid>
        <pubDate>${pubDate}</pubDate>
        <category>${category}</category>${imageElement}
    </item>`;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// This function is no longer needed since we use actual modification dates
// function generatePubDate(index) {
//   const now = new Date();
//   now.setDate(now.getDate() - (index * 30));
//   return now.toUTCString();
// }

function updateRSSFeed() {
  console.log('Updating RSS feed...');
  
  // Read article lists
  const mainArticles = readArticleList(articlesListPath);
  const blogArticles = readArticleList(blogListPath);
  
  console.log(`Found ${mainArticles.length} main articles`);
  console.log(`Found ${blogArticles.length} blog articles`);
  
  // Collect all articles with metadata
  const allArticles = [];
  
  // Add blog articles
  blogArticles.forEach(slug => {
    const metadata = readArticleMetadata(slug, 'blog');
    if (metadata) {
      allArticles.push(metadata);
    }
  });
  
  // Add main articles
  mainArticles.forEach(slug => {
    const metadata = readArticleMetadata(slug, 'article');
    if (metadata) {
      allArticles.push(metadata);
    }
  });

  // Add dated Now-page snapshots
  const nowSnapshots = readNowSnapshots();
  console.log(`Found ${nowSnapshots.length} Now snapshots`);
  nowSnapshots.forEach(snapshot => allArticles.push(snapshot));

  // Sort by published date (newest first)
  allArticles.sort((a, b) => b.publishedDate - a.publishedDate);
  
  console.log('Articles sorted by published date (newest first):');
  allArticles.forEach((article, index) => {
    console.log(`${index + 1}. ${article.title} (${article.publishedDate.toLocaleDateString()})`);
  });
  
  // Generate RSS items using actual modification dates
  const rssItems = allArticles.map(article => generateRSSItem(article)).join('\n\n');
  
  // Generate complete RSS feed
  const now = new Date();
  const rssContent = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
    <title>Noise Wrangler</title>
    <description>Sonic Explorations by Jean-Philippe Drecourt</description>
    <link>https://noisewrangler.art/</link>
    <atom:link href="https://noisewrangler.art/feed.xml" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <generator>Noise Wrangler RSS Generator</generator>

${rssItems}

</channel>
</rss>`;
  
  // Write RSS feed
  fs.writeFileSync('./docs/feed.xml', rssContent);
  console.log('RSS feed updated successfully!');
  console.log(`Generated ${allArticles.length} items in the feed`);
}

// Run the update
if (require.main === module) {
  updateRSSFeed();
}

module.exports = { updateRSSFeed };