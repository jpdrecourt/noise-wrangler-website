// Global variables
let loadedArticles = 0
const ARTICLES_PER_BATCH = 9
let loading = false
let hasMore = true
const articlesDirectory = 'articles/'
let articleFolders = []

// Initialize Intersection Observer for lazy loading
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !loading && hasMore) {
        loadNextBatch()
      }
    })
  },
  {
    rootMargin: '100px',
    threshold: 0.1,
  }
)

// Observe loading indicator and load articles list
document.addEventListener('DOMContentLoaded', async () => {
  observer.observe(document.getElementById('loading'))

  // Load the article folders
  await loadArticlesList()

  // Start loading articles
  loadNextBatch()
})

// Load articles list from external file
async function loadArticlesList() {
  try {
    // Check if it's already loaded via the script tag
    if (window.articleFolders && window.articleFolders.length > 0) {
      articleFolders = window.articleFolders
      return
    }

    // Otherwise try to fetch it
    const response = await fetch('articles-list.js')
    if (!response.ok) {
      throw new Error(`Failed to load articles list: ${response.status}`)
    }

    const script = document.createElement('script')
    script.textContent = await response.text()
    document.head.appendChild(script)

    // Wait a moment for the script to execute
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (window.articleFolders) {
      articleFolders = window.articleFolders
    } else {
      throw new Error('Articles list not found in loaded script')
    }
  } catch (error) {
    console.error('Error loading articles list:', error)
    document.getElementById('loading').textContent =
      'Could not load articles. Please try again later.'
  }
}

// Create article card element
function createArticleCard(title, date, imageUrl, description, articleUrl) {
  const card = document.createElement('a')
  card.className = 'article-card'
  card.href = articleUrl

  // Create a default image URL if none is provided
  const imgSrc = imageUrl || './media/NW-Logo-No_Border-800px.png'

  card.innerHTML = `
    <img class="card-image" src="${imgSrc}" alt="${title}" loading="lazy" />
    <div class="card-content">
      <h3>${title}</h3>
      <p class="card-description">${description}</p>
    </div>
  `

  return card
}

// Extract description from Open Graph meta tags or fallback to content
function extractDescription(doc, maxLength = 120) {
  // Try to find description in Open Graph meta tag
  const ogDescription = doc.querySelector('meta[property="og:description"]')
  if (ogDescription && ogDescription.getAttribute('content')) {
    const content = ogDescription.getAttribute('content').trim()
    return content.length <= maxLength
      ? content
      : content.substring(0, maxLength) + '...'
  }

  // Fallbacks if Open Graph tag is not available

  // Try to find a featured excerpt
  const excerptEl = doc.querySelector('.featured-excerpt')
  if (excerptEl) {
    return excerptEl.textContent.trim()
  }

  // Otherwise, get the first paragraph
  const firstParagraph = doc.querySelector('.article-content p')
  if (firstParagraph) {
    const text = firstParagraph.textContent.trim()

    // Try to get first sentence
    const sentenceMatch = text.match(/^.*?[.!?]/)
    if (sentenceMatch) {
      return sentenceMatch[0].length <= maxLength
        ? sentenceMatch[0]
        : sentenceMatch[0].substring(0, maxLength) + '...'
    }

    // Fallback to truncated paragraph
    return text.length <= maxLength
      ? text
      : text.substring(0, maxLength) + '...'
  }

  return 'Read more...'
}

// Extract image from Open Graph meta tags or fallback to article content
function extractImage(doc) {
  // Try to find image in Open Graph meta tag
  const ogImage = doc.querySelector('meta[property="og:image"]')
  if (ogImage && ogImage.getAttribute('content')) {
    return ogImage.getAttribute('content')
  }

  // Fallbacks if Open Graph tag is not available

  // Try to find a featured image
  const featuredImg = doc.querySelector('.article-featured img')
  if (featuredImg && featuredImg.src) {
    return featuredImg.src
  }

  // Try to find any image in the article content
  const contentImg = doc.querySelector('.article-content img')
  if (contentImg && contentImg.src) {
    return contentImg.src
  }

  return null
}

// Extract title from Open Graph meta tags or fallback to content
function extractTitle(doc) {
  // Try to find title in Open Graph meta tag
  const ogTitle = doc.querySelector('meta[property="og:title"]')
  if (ogTitle && ogTitle.getAttribute('content')) {
    return ogTitle
      .getAttribute('content')
      .replace(' - Noise Wrangler', '') // Remove site name if present
      .trim()
  }

  // Fallback to article heading
  return doc.querySelector('article h2')?.textContent || 'Untitled'
}

// Load next batch of articles
async function loadNextBatch() {
  if (loading || !hasMore || articleFolders.length === 0) return
  loading = true
  const loadingIndicator = document.getElementById('loading')
  loadingIndicator.style.display = 'block'

  try {
    const batch = articleFolders.slice(
      loadedArticles,
      loadedArticles + ARTICLES_PER_BATCH
    )

    if (batch.length === 0) {
      hasMore = false
      loadingIndicator.style.display = 'none'
      observer.disconnect()
      return
    }

    // Load each article in the batch
    const articlesGrid = document.getElementById('articles-grid')
    for (const articleFolder of batch) {
      try {
        const response = await fetch(
          `${articlesDirectory}${articleFolder}/index.html`
        )
        if (!response.ok) {
          console.warn(`Could not load article: ${articleFolder}`)
          continue
        }

        const html = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')

        const title = extractTitle(doc)
        const dateEl = doc.querySelector('time')
        const date = dateEl ? dateEl.textContent : ''

        const imageUrl = extractImage(doc)
        const description = extractDescription(doc)

        const articleCard = createArticleCard(
          title,
          date,
          imageUrl,
          description,
          `${articlesDirectory}${articleFolder}/`
        )

        articlesGrid.appendChild(articleCard)
      } catch (error) {
        console.error(`Error loading article ${articleFolder}:`, error)
      }
    }

    loadedArticles += batch.length

    // Check if this was the last batch
    if (loadedArticles >= articleFolders.length) {
      hasMore = false
      loadingIndicator.style.display = 'none'
      observer.disconnect()
    }
  } catch (error) {
    console.error('Error loading articles:', error)
    loadingIndicator.textContent =
      'Error loading articles. Scroll to try again.'
  } finally {
    loading = false
  }
}
