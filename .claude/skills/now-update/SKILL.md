---
name: now-update
description: Quarterly refresh of the Noise Wrangler /now page (docs/now.html). Sweeps every project chronote for status events, drafts in JP's voice, archives the old page. Use when JP asks to update the Now page or ~3 months have passed since the last update.
user-invocable: true
---

# now-update — refresh the /now page without missing anything

**Core principle — coverage vs. selection.** The Now page is a *status
snapshot*. Semantic vault-search ranks on *topic*, so it silently misses
**status events** (accepted / rejected / deadline / parked / decided) —
that is how the SMC 2026 *acceptance* was missed while the page still said
"submitting" (see memory `feedback_vault_status_snapshots`). The
`chronote_digest.py` script fixes **coverage**: it mechanically surfaces
every dated entry since the last update, so nothing recent stays hidden.
It does **not** decide what belongs on the page. **Deciding what's useful,
and flagging doubt, stays with the model and JP. Do not automate the
selection away** — the script's only job is that the useful thing is never
*hidden*.

**Run this on a capable model (Opus).** Skill frontmatter has no `model:`
field in this setup, so it can't be pinned — but step 5–6 are genuine
editorial judgment (what's stale, what drops off, where to express doubt,
when to withhold and ask JP for raw material). A weak model will either
dump the whole digest onto the page or quietly drop things. If you're not
on Opus, say so before drafting.

---

## Procedure

Work from the repo root: `C:\Users\jpdre\Music\Share\noise-wrangler-website`.

### 1. Find the cutoff
Read `docs/now.html`. The `<p class="now-updated">Updated <Month Year>,
from <place>.</p>` line is the *previous* update. Convert that month to a
`YYYY-MM-01` cutoff (e.g. "Updated March 2026" → `2026-03-01`).

### 2. Coverage — run the digest (never skip)
```bash
python .claude/skills/now-update/chronote_digest.py --since <cutoff>
```
Read the **whole** digest. It groups every `## YYYY/MM/DD` chronote entry
since the cutoff by source note, newest-first. This is the guarantee that
nothing recent is invisible — including projects you'd forgotten were
active. Don't sample it; read it.

### 3. Read the memory
Read `C:\Users\jpdre\.claude\projects\C--Users-jpdre-Music-Share-noise-wrangler-website\memory\MEMORY.md`
and the relevant files, especially:
- `feedback_vault_status_snapshots` — why this skill exists.
- `feedback_collaborative_writing` — **draft structure first; JP writes the
  raw material for anything personal/reflective; clean up without
  rewriting his voice.**
- `user_identity` — the artistic identity and the fuzziness principle.

### 4. Themes — semantic search, but only for reflections
Use the `vault-search` skill (`search.py`) **only** for *thematic/reflective*
threads that are not status events — e.g. "flow", "alienness". Semantic
search is the right tool there and the wrong tool for status (that's what
step 2 is for). Read the full source note when an excerpt looks relevant.

### 5. Diff against the live page (the judgment call)
Lay the digest candidates against the current `now.html` and sort them:
- **New** — genuinely happened this quarter, worth a line.
- **Stale** — the page asserts something now outdated (e.g. "submitting a
  paper" → **accepted, camera-ready**; "being ported to JUCE" → **ported,
  now driven by a web dashboard over OSC**). Fix these even if nothing new
  replaces them.
- **Drops off** — was current last quarter, no longer. Let it go.

State the split explicitly to JP: *the digest guarantees I saw everything;
what makes the page is a judgment call.* Where inclusion is genuinely
uncertain, **say so and recommend** — don't silently include or drop.

### 6. Draft in JP's voice
Match `docs/now.html`: declarative, first person, concrete, short
paragraphs, inline links, no marketing gloss. Keep the section rhythm the
page already uses (a lead "Updated…" line, then thematic sections, then a
lighter "In My Mind" / reflections area, then the now-page footer note).
- **Make judgment calls and express doubt** in what you show JP.
- For **personal/reflective** items (a reflection on alienness, on a book,
  on the practice), do **not** invent JP's voice — draft the structure and
  a stub, and **ask him for a few sentences of raw material**, then clean up
  without rewriting. (per `feedback_collaborative_writing`.)

### 7. Archive the old page
- Copy the current `docs/now.html` to `docs/now-YYYY-MM.html`, where
  `YYYY-MM` is the **old** update's month (the cutoff month from step 1).
- In the new `now.html`, add a small **Previously** list just above the
  footer's `<hr>`/now-page note, linking each archived snapshot, newest
  first, e.g.:
  ```html
  <p class="now-archive">
    Previously: <a href="now-2026-03.html">March 2026</a>
  </p>
  ```
- Preserve the `<header>`, `<nav>`, `<footer>`, and all `og:`/meta tags in
  both files. The archived copy is frozen as-is; only the live page grows
  the Previously list.

### 8. Update the dateline
Set the live page's `<p class="now-updated">Updated <Month Year>, from
<place>.</p>` to the new month/place. Confirm the place with JP if unsure.

---

## chronote_digest.py — reference

```bash
python .claude/skills/now-update/chronote_digest.py --since 2026-03-01
# --vault  default C:\Users\jpdre\Documents\Obsidian\Notes
# --scope  default Projects   (subdir under the vault to scan)
```
Deterministic date-header scan — no index, no dependencies. Walks every
`.md` under `<vault>/<scope>/`, finds each file's `# Chronological notes`
section, and prints every `## YYYY/MM/DD` (or `## YYYY/MM/DD - Title`)
entry dated on/after the cutoff, grouped by note, newest first. Notes with
no chronote section are skipped. Forces UTF-8 stdout so em-dashes and
Japanese (疎密) survive a redirect on Windows.

**Coverage caveat:** the digest only sees `Projects/` notes that use the
`# Chronological notes` + `## YYYY/MM/DD` convention. Status recorded
elsewhere (a top-of-note frontmatter change, a note outside `Projects/`, a
one-off `.md` at vault root) won't appear — so the digest is the floor of
coverage, not the ceiling. If JP mentions something the digest didn't
catch, that's a signal to widen `--scope` or check the root notes by hand.
