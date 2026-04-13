Write a new Presques Riens blog post. Topic: $ARGUMENTS

If no topic was provided, ask: "What should this post be about?"

## Editorial guidance

Load and follow the `/collaborative-writing` skill for all editorial
decisions: stance, workflow phases, writing discipline, and voice.

Blog-specific addition: **solution first.** If the post has something
actionable (a tool, a recipe, a method), put it at the top in a
highlighted box using `<div class="protocol-section">`. The reader
should be able to act on the post without scrolling.

## Process

1. **Discuss first.** Ask the user what the post should cover, what the
   key takeaway is, and whether there's a link or resource to feature
   prominently. Do not start writing until the angle is clear.
2. **Create the article folder and HTML file** following the structure
   below.
3. **Register the post** in `docs/js/blog-list.js` (newest first).
4. **Run `npm run update-rss`** to regenerate the RSS feed.
5. **Show the user the result** for review before committing.

## File structure

Create `docs/articles/<slug>/index.html` where `<slug>` is a short
kebab-case name derived from the topic.

Use the exact HTML boilerplate from existing posts (header, nav, footer,
OG meta tags). Copy the structure from any post in `docs/articles/`.

### Required meta tags in `<head>`

```html
<meta name="description" content="..." />
<meta property="og:title" content="Title - Noise Wrangler" />
<meta property="og:description" content="Short summary for feeds and social." />
<meta property="og:image" content="https://noisewrangler.art/media/<slug>.jpg" />
<meta property="og:url" content="https://noisewrangler.art/articles/<slug>/" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Noise Wrangler" />
<meta property="article:published_time" content="YYYY-MM-DDTHH:MM:SS.000Z" />
```

The OG image won't exist yet. Note it as a TODO for the user.

### HTML conventions

- `<h3>` sections with `id` attributes for scannability
- Short paragraphs (2-4 sentences, one idea each)
- No em-dashes (use commas, periods, or restructure)
- Attribution at the bottom in italics: `Written with [model] on [date].`
  Add image credits if applicable.

## Image

The post needs an OG image for RSS and social sharing. Optimal size:
1200 x 630 px. The image file goes in `docs/media/<slug>.jpg`.

If no image is available, remind the user they need one and leave the
OG image tag pointing to the expected path. The RSS feed will still
generate correctly; the image just won't display until the file exists.

## Checklist before committing

- [ ] HTML validates (correct nesting, no broken tags)
- [ ] OG meta tags are complete
- [ ] `blog-list.js` updated (new slug at the top of the array)
- [ ] `npm run update-rss` ran successfully
- [ ] User has reviewed the text
