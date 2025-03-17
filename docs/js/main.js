// Global variables
let loadedArticles = 0
const ARTICLES_PER_BATCH = 9
let loading = false
let hasMore = true
const articlesDirectory = 'articles/'
let articleFilenames = []

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

  // Load the article filenames
  await loadArticlesList()

  // Start loading articles
  loadNextBatch()
})

// Load articles list from external file
async function loadArticlesList() {
  try {
    // Check if it's already loaded via the script tag
    if (window.articleFilenames && window.articleFilenames.length > 0) {
      articleFilenames = window.articleFilenames
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

    if (window.articleFilenames) {
      articleFilenames = window.articleFilenames
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
    <img class="article-image" src="${imgSrc}" alt="${title}" loading="lazy" />
    <div class="article-content">
      <h3>${title}</h3>
      <p class="article-description">${description}</p>
    </div>
  `

  return card
}

// Extract a single sentence description from article content
function extractDescription(articleContent, maxLength = 120) {
  // Try to find a featured excerpt first
  const excerptEl = articleContent.querySelector('.featured-excerpt')
  if (excerptEl) {
    return excerptEl.textContent.trim()
  }

  // Otherwise, get the first paragraph
  const firstParagraph = articleContent.querySelector('.article-content p')
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

// Extract image from article
function extractImage(articleContent) {
  // Try to find a featured image first
  const featuredImg = articleContent.querySelector('.article-featured img')
  if (featuredImg && featuredImg.src) {
    return featuredImg.src
  }

  // Try to find any image in the article content
  const contentImg = articleContent.querySelector('.article-content img')
  if (contentImg && contentImg.src) {
    return contentImg.src
  }

  return null
}

// Load next batch of articles
async function loadNextBatch() {
  if (loading || !hasMore || articleFilenames.length === 0) return
  loading = true
  const loadingIndicator = document.getElementById('loading')
  loadingIndicator.style.display = 'block'

  try {
    const batch = articleFilenames.slice(
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
    for (const articleFile of batch) {
      try {
        const response = await fetch(`${articlesDirectory}${articleFile}`)
        if (!response.ok) {
          console.warn(`Could not load article: ${articleFile}`)
          continue
        }

        const html = await response.text()
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html

        const article = tempDiv.querySelector('article')
        if (!article) continue

        const title = article.querySelector('h2')?.textContent || 'Untitled'
        const dateEl = article.querySelector('time')
        const date = dateEl ? dateEl.textContent : ''

        const imageUrl = extractImage(article)
        const description = extractDescription(article)

        const articleCard = createArticleCard(
          title,
          date,
          imageUrl,
          description,
          `${articlesDirectory}${articleFile}`
        )

        articlesGrid.appendChild(articleCard)
      } catch (error) {
        console.error(`Error loading article ${articleFile}:`, error)
      }
    }

    loadedArticles += batch.length

    // Check if this was the last batch
    if (loadedArticles >= articleFilenames.length) {
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
