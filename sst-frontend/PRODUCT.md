# Product

## Register

product

## Users

Two audiences, weighted equally (Roger's decision, 2026-05-29):

1. **The end user** — a financially-aware person who wants to see, at a glance, where their money goes and what its environmental footprint is. They are not an accountant; they open the app to understand a month, not to audit a ledger. Context: desktop or mobile, a few minutes, looking for a clear answer and a nudge toward better choices.
2. **The evaluator** — a recruiter / engineer at Clarity AI (or any reviewer of Roger's portfolio) assessing frontend craft, product sense, and domain understanding (sustainable consumer finance is Clarity AI's space). Every screen doubles as a work sample.

The design must serve both: a credible product that a real user trusts, finished to a standard that impresses a reviewer. Neither demo-toy nor over-engineered showpiece.

## Product Purpose

SST connects (real or mock) bank transactions and computes a sustainability / carbon-footprint score per expense, then visualizes the monthly evolution. It exists to turn invisible spending impact into something legible and actionable — and, as a portfolio piece, to demonstrate that Roger can ship a clean, documented, presentable full-stack product on the Clarity AI stack (Kotlin + Spring backend, React + TypeScript frontend).

Success looks like: a user understands their month's footprint in one screen and feels nudged (not shamed) toward a better choice; a reviewer browses login → dashboard and sees deliberate, complete craft with no rough edges.

## Brand Personality

**Clean · trustworthy · data-forward.**

Voice: calm, plain, specific. It states what the number means, never hypes. Tone is encouraging without moralizing — it celebrates improvement and frames impact as a choice, not a verdict. The interface earns belief in its numbers through legibility and consistency, the way Mercury and Notion feel calm and credible, with a touch of the friendly, human data presentation of Monzo / Revolut (approachable charts, positive framing) — but always restrained, never loud.

## Anti-references

- **Crypto-bro neon.** No dark neon gradients, no glassmorphism-by-default, no purple glow, no gradient text. Sustainability data read through a "hype" lens destroys trust.
- **Rigid corporate bank.** No navy-and-gold, no stock photos of smiling people, no cold wall of legal-dense text. SST is human and clear, not institutional and stiff.
- (Shared absolute bans still apply: SaaS-cream body bg, hero-metric template, identical card grids, uppercase eyebrows over every section, side-stripe borders.)

## Design Principles

1. **Earned trust over flash.** This is money + environmental data; the user has to believe the numbers. Legibility, consistent vocabulary, and honest framing beat any decorative move. When in doubt, make the number easier to read.
2. **Motivate, don't moralize.** Surface impact so it nudges better choices without guilt. Positive, specific framing of the ESG score ("you improved 12% vs last month"), never a red scold.
3. **Data is the hero.** Charts and figures carry each screen; chrome recedes. Every view answers "where did my money go and what was its footprint?" at a glance.
4. **Familiar, not inventive.** Standard product affordances (top/side nav, real tables, real forms, standard modals only when unavoidable). The tool disappears into the task; novelty is reserved for moments of insight, not plumbing.
5. **Portfolio-grade finish.** Because a reviewer evaluates this, every state is intentional and complete — empty, loading (skeletons, not center spinners), error, hover, focus, disabled. No demo-toy rough edges.

## Accessibility & Inclusion

- **Target: WCAG 2.1 AA.** Body text ≥4.5:1 contrast, large text ≥3:1, including placeholder text. Verify the muted-foreground tokens against both light and dark backgrounds.
- **Color is never the only signal.** The ESG / sustainability scale leans green↔red; pair every color-coded value with an icon, label, or text so colorblind users (and grayscale prints) read it correctly.
- **Reduced motion is mandatory.** Every transition needs a `prefers-reduced-motion: reduce` fallback (crossfade or instant). Motion conveys state only.
- **Keyboard + focus.** All interactive elements reachable and operable by keyboard with a visible focus ring (the `--ring` green token); dark mode included.
