# Opening letter: a home-page card for Playable Ideas

You are the website session that adds Playable Ideas to noisewrangler.art. JP is at his translation work and will not be answering: build it whole, verify it, commit, and report. Do not push; the sidekick reads the diff and pushes. Work in this repo only (the toys' public repo is read-only for you).

## Why now

JP presented at SMC 2026 in Zagreb (7 November) and is writing to the people he met there. They will arrive at noisewrangler.art, and the home page says nothing of the toys: only the Now page links to them. His words: "People are going to start visiting the site and this is really important."

## What a card is here

The home grid is built by `docs/js/main.js` from `docs/js/articles-list.js`: each entry is a folder in `docs/articles/`, and the card's title, picture and description come from that page's `og:title`, `og:image` and `og:description` (description cut at 120 characters). So the card is a short article page, `docs/articles/playable-ideas/index.html`, first in the list.

## The job

1. The page, modelled on a recent article (`docs/articles/barreiro-improvised/index.html` for structure, head tags, `article:published_time`, nav and footer). Short: what the toys are, the four of them one line each with a link to each, one unmissable link to https://play.noisewrangler.art, where they come from (the SMC 2026 talk and poster; link `articles/wandering-mind/` if that page is the paper's and is public, read it first), and the invitation to write to him (`contact.html`).
2. The picture: `~/Documents/Projects/261009-playable-papers-public/og.png` (1200×630, the toys' own share card), copied into `docs/media/` under a clear name. Look at how it crops in the card and on the page before settling; if it crops badly, a toy's own `og.png` under `toys/<toy>/` in that repo is the alternative.
3. `'playable-ideas'` at the top of `docs/js/articles-list.js`; then `npm run update-rss`, and `docs/sitemap.html` if articles are listed there by hand.
4. The home page's intro paragraph (`hero-intro` in `docs/index.html`) is JP's sentence. Leave it; if you think it wants a clause for the toys, say so in the report with the wording.

## The copy

Every sentence on the page comes from text JP has already published or approved. Assemble and trim; do not write new claims, and no marketing gloss. Load the `collaborative-writing` skill (`~/.claude/skills/collaborative-writing/SKILL.md`) before composing. British English. Sources, in order of authority:

- The toys' front page, reviewed by JP on 2026-11-03: `~/Documents/Projects/261009-playable-papers-public/index.html` (title, the description "Small toys for trying out musical ideas by hand", the one line per toy, the "bigger project: exploring fuzziness and fussiness in instrument design, to start a dialogue with other musicians" paragraph, the CC BY 4.0 line).
- The Playable Ideas section of `docs/now.html`, his own paragraphs.
- The poster's foot line: "Playable Ideas: four prototypes on memory, playable on your phone." (On a phone the toys offer a preview; they are built for a large screen. Say it the front page's way.)
- The spec is written for AI agents, enough to rebuild a toy from scratch: that is on the front page and belongs on this one.

The public name is Playable Ideas (never Playable Papers, the repo's old slug). The four public toys are motif-memory, markov, statistical-feedback and branches; nothing else from the lab is named.

## Done means

- The site served locally from `docs/` (any static server), the home page loaded in headless Chrome at desktop and phone widths, a screenshot of each read by you: the card is first, its picture and text sit like its neighbours', and the article page reads well at both widths. Every link on the new page answers 200.
- `npm run lint` no worse than before your change.
- One commit on `main`, not pushed.

Report by ending your turn with: the commit hash, the page's full text as it stands, and at most three lines on anything you chose or doubt.
