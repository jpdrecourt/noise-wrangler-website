// bulk-update-og-tags.js
// ES Module to process multiple HTML files and add Open Graph tags

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { JSDOM } from 'jsdom'

// Get the directory name using ES module approach
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Base directory containing all article folders
const articlesDir = path.join(__dirname, 'docs', 'articles')

async function updateOpenGraphTags() {
  try {
    // Get all article directories
    const files = await fs.readdir(articlesDir)
    const articleDirs = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(articlesDir, file)
        const stats = await fs.stat(filePath)
        return stats.isDirectory() ? file : null
      })
    )

    // Filter out non-directories
    const validDirs = articleDirs.filter((dir) => dir !== null)

    // Process each article
    for (const articleDir of validDirs) {
      const articlePath = path.join(articlesDir, articleDir)
      const indexPath = path.join(articlePath, 'index.html')

      try {
        // Check if index.html exists
        await fs.access(indexPath)

        // Read the HTML file
        const html = await fs.readFile(indexPath, 'utf8')
        const dom = new JSDOM(html)
        const document = dom.window.document

        // Get article title
        const titleElement = document.querySelector('article h2')
        const title = titleElement ? titleElement.textContent.trim() : 'Article'

        // Get featured image
        const featuredImg = document.querySelector('.article-featured img')
        const imgSrc = featuredImg ? featuredImg.getAttribute('src') : ''

        // Get description from featured excerpt or meta description
        let description = ''
        const excerptElement = document.querySelector('.featured-excerpt')
        if (excerptElement) {
          description = excerptElement.textContent.trim()
        } else {
          const metaDesc = document.querySelector('meta[name="description"]')
          description = metaDesc ? metaDesc.getAttribute('content') : ''
        }

        // Extract the filename from the image path
        const imgFilename = imgSrc ? path.basename(imgSrc) : ''

        // Build absolute URL for image using the new path structure
        const absoluteImgUrl = imgFilename
          ? `https://noisewrangler.art/media/${imgFilename}`
          : 'https://noisewrangler.art/media/default-image.jpg'

        // Create or update Open Graph tags
        const head = document.querySelector('head')

        // Helper function to create/update meta tags
        function setMetaTag(property, content) {
          let meta = document.querySelector(`meta[property="${property}"]`)
          if (!meta) {
            meta = document.createElement('meta')
            meta.setAttribute('property', property)
            head.appendChild(meta)
          }
          meta.setAttribute('content', content)
        }

        // Set all required OG tags
        setMetaTag('og:title', `${title} - Noise Wrangler`)
        setMetaTag('og:description', description)
        setMetaTag('og:image', absoluteImgUrl)
        setMetaTag(
          'og:url',
          `https://noisewrangler.art/articles/${articleDir}/`
        )
        setMetaTag('og:type', 'article')
        setMetaTag('og:site_name', 'Noise Wrangler')

        // Write the updated HTML back to the file
        await fs.writeFile(indexPath, dom.serialize())
        console.log(`Updated Open Graph tags for: ${articleDir}`)
      } catch (err) {
        // Skip if index.html doesn't exist or other error
        console.error(`Error processing ${articleDir}:`, err.message)
      }
    }

    console.log('All articles updated with Open Graph tags')
  } catch (err) {
    console.error('Error updating Open Graph tags:', err)
  }
}

// Run the function
updateOpenGraphTags()

export default updateOpenGraphTags
