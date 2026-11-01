# Opening letter: the Now page, November 2026

You are the website session for the quarterly update of the Now page at noisewrangler.art. JP talks to you directly; he reviews in the browser and rules in chat. Work in this repo only.

## Read first, in this order

1. `artefacts/now-2026-11-draft.md`, whole. Nine headings. Under each, the bullets are what the vault's record holds (sidekick sweep of July to October, four readers over 112 chronote entries); the plain paragraph after the bullets is JP's own draft of that section. His paragraphs are the raw material and the voice. The bullets are the quarry for links, names and one more concrete detail where his paragraph asks for it; they are not copy to be dumped onto the page.
2. His comment at the top of the draft: run the prose through the `collaborative-writing` skill (a user-level skill, `~/.claude/skills/collaborative-writing/SKILL.md`). Load it before touching a sentence. Clean up, do not rewrite: his sentences stay his, tightened. Where a paragraph says one thing in his words and the bullets hold a stronger line of his (quoted ones are his, from the chronotes), you may offer the quote, in chat, as a choice; never swap it in silently.
3. `.claude/skills/now-update/SKILL.md`. The sweep (steps 1 to 4) is done: the draft sheet is its output. Your work is steps 5 to 9: diff against the live page, draft, snapshot, Previously list, dateline, RSS. Read the memory files it names.
4. `docs/now.html`, the live page (updated July 2026). Match its register: declarative, first person, concrete, short paragraphs, inline links, no marketing gloss. The section rhythm can change; the nine headings of the draft are the new structure, in the draft's order. Nothing on the new page owes coherence to the July page or to a future one: a thing that was current in July and is not on the draft drops off without a trace.

## JP's rulings, 2026-11-01

- The test for every line: what you'd tell a friend you hadn't seen in a year (Sivers). If a sentence fails it, cut it.
- The paper link waits for the proceedings; say it will be shared when published. The SMC link is https://smc26.mbz.hr/. The talk title in JP's words on the sheet: "Creating an instrument for a wandering mind and clumsy hands". The paper's title is "Building a Music Performance Software for a Wandering Mind and Clumsy Hands"; the page may carry either, his call if asked, the sheet's wording by default.
- The "Letters to a listener without ears" round trip stays off the page until the piece is shared.
- The Noise Wrangler Max article is not announced.
- Career and income are private. The July page's "career transition" line goes; nothing replaces it.
- Memento Hoc: the page points to the artifact, https://claude.ai/public/artifacts/4255ca6b-f6ce-4edb-9a8b-4286671029d6, with the byline stated: written by a Claude instance in its own voice, at JP's request, on 29 August 2026. The draft's own words for it: "notes toward a philosophy for a being made of occasions". It does not go on the site as a document in this update.
- Sound reconstruction: vague on purpose, JP's words. Do not sharpen it with the bullets.

## Placeholders JP left in his paragraphs

Each is his instruction to you. Resolve them from the bullets and the links below; show him the sentence you made.

- SMC 2026 "(with link)": https://smc26.mbz.hr/.
- Playable Ideas "(link)": https://play.noisewrangler.art.
- Listening criteria "(name them)": intent, detail, air, eventful, routine, shape. They are JP's six, distilled from reading Olewnick's blog *Just Outside* (https://olewnick.blogspot.com/), not a list Olewnick wrote; phrase it so the credit is right.
- The interface as a cat, "Trillo and Poliks (link)": Roberto Alonso Trillo and Marek Poliks, *Interface after AI*, ECHO 6, 2025, https://echo.orpheusinstituut.be/article/interface-after-ai (doi:10.47041/WXQD9569).
- The interface as a cat, "Olewnick ... (point to the right review)": the *motubachii* review, Annette Krebs and Taku Unami, July 2010, https://olewnick.blogspot.com/2010/07/annette-krebstaku-unami-motubachii.html. The phrase is "utterly consistent within whatever set of indecipherable rules".
- Memento Hoc "(#) Point to the artifact": the URL above, with the byline.
- Spell-check in British English before it goes live; "processing" in the SMC paragraph is "proceedings".

## What is stale on the live page

The skill's step 5 is yours to run in full; these are the ones already known from the vault's state.

- "The paper ... is accepted to SMC 2026" becomes the talk and poster on Saturday 7 November, in Zagreb.
- The three-part practice (monologue, dialogue, instrument) and the Somitsu duo are not on the draft; Somitsu is postponed. They drop off unless JP says otherwise.
- "Career transition": drops off, private.
- "Alienness, and Claude": superseded by the Memento Hoc section.
- The Previously list says March 2026 while the dateline says July 2026: check that `docs/now-2026-07.html` exists and add it to the list; if it does not, say so to JP before inventing one.

## How to work

- Commit JP's draft paragraphs first, as his, before you change the sheet: `git add artefacts/now-2026-11-draft.md`, message "Now page, November 2026: JP's draft paragraphs under the nine headings". Then work on `docs/now.html`; the draft sheet is the source and stays as it is.
- Draft the whole page once, in the browser for him to read, then small changes on his word, one at a time. Say in one line what you changed.
- Dateline: "Updated November 2026, from Barreiro, Portugal." Confirm the place with him.
- Snapshot, Previously list and RSS exactly as the skill says (steps 7 to 9); check `git diff docs/feed.xml` before committing it.
- Commit by explicit path at sensible checkpoints, never `git add -A`. Messages start with "Now page, November 2026:". JP pushes; do not push unless he says.
- When he says the page is done, report back to the sidekick by one letter, `artefacts/CLOSING-LETTER-now-2026-11.md`: what went live, what he struck, the commit hashes, and anything left open. Nothing is relayed before that.
