// Global variables
let loadedArticles = 0
const ARTICLES_PER_BATCH = 5
let loading = false
let hasMore = true
let featuredLoaded = false
let cachedArticlesList = null
const articlesDirectory = './articles/'

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

// Observe loading indicator
observer.observe(document.getElementById('loading'))

// Get the list of articles from the articles directory
async function getAllArticles() {
  if (cachedArticlesList) return cachedArticlesList

  try {
    // List all files in the articles directory
    const articles = await fetch(articlesDirectory)
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')

        // Get all links that match our article pattern
        const links = Array.from(doc.querySelectorAll('a'))
          .map((a) => a.href)
          .filter((href) => /\d{4}-\d{2}-\d{2}.*\.html$/.test(href))
          .map((href) => href.split('/').pop())

        // Sort by date (newest first)
        return links.sort().reverse()
      })

    cachedArticlesList = articles
    return articles
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

// Load featured articles
async function loadFeaturedArticles() {
  if (featuredLoaded) return

  try {
    const articlesList = await getAllArticles()
    const featuredSection = document.getElementById('featured')

    // Load all articles and find the featured ones
    let featuredCount = 0
    for (const articleFile of articlesList) {
      if (featuredCount >= 3) break

      const articleResponse = await fetch(`${articlesDirectory}${articleFile}`)
      if (!articleResponse.ok) continue

      const html = await articleResponse.text()
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = html

      const article = tempDiv.querySelector('article')
      if (article.dataset.featured === 'true') {
        // Extract article data
        const title = article.querySelector('h2').textContent
        const date = article.querySelector('time').textContent
        const image = article.querySelector('.article-featured img').src
        const excerpt = article.querySelector('.featured-excerpt').textContent

        // Create featured card
        const featuredCard = createFeaturedCard(title, date, image, excerpt)
        featuredSection.appendChild(featuredCard)
        featuredCount++
      }
    }

    featuredLoaded = true
  } catch (error) {
    console.error('Error loading featured articles:', error)
  }
}

// Create featured card element
function createFeaturedCard(title, date, image, excerpt) {
  const featuredCard = document.createElement('div')
  featuredCard.className = 'featured-card'
  featuredCard.innerHTML = `
        <img class="featured-image" src="${image}" alt="${title}" loading="lazy" />
        <div class="featured-content">
            <h3>${title}</h3>
            <p class="featured-excerpt">${excerpt}</p>
            <div class="featured-meta">${date}</div>
        </div>
    `

  featuredCard.addEventListener('click', () => {
    window.location.hash = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  })

  return featuredCard
}

// Get filtered article list
async function getArticlesList() {
  const articles = await getAllArticles()
  const filteredArticles = []

  for (const articleFile of articles) {
    const response = await fetch(`${articlesDirectory}${articleFile}`)
    if (!response.ok) continue

    const html = await response.text()
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    if (tempDiv.querySelector('article').dataset.featured !== 'true') {
      filteredArticles.push(articleFile)
    }
  }

  return filteredArticles
}

// Load next batch of articles
async function loadNextBatch() {
  if (loading || !hasMore) return
  loading = true
  const loadingIndicator = document.getElementById('loading')
  loadingIndicator.style.display = 'block'

  try {
    const articlesList = await getArticlesList()
    const batch = articlesList.slice(
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
    const content = document.getElementById('content')
    for (const articleFile of batch) {
      const response = await fetch(`${articlesDirectory}${articleFile}`)
      if (!response.ok) continue

      const html = await response.text()
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = html

      const article = tempDiv.firstElementChild
      article.classList.add('visible')
      content.appendChild(article)
    }

    loadedArticles += batch.length
  } catch (error) {
    console.error('Error loading articles:', error)
    loadingIndicator.textContent = 'Error loading posts. Scroll to try again.'
  } finally {
    loading = false
  }
}

// Handle deep linking
function handleDeepLink() {
  const hash = window.location.hash.slice(1)
  if (hash) {
    const article = document.querySelector(`article[id="${hash}"]`)
    if (article) {
      article.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedArticles()
  loadNextBatch()
  window.addEventListener('hashchange', handleDeepLink)
})
