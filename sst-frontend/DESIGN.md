---
name: Sustainable Spending Tracker
description: A calm, data-forward field notebook for your spending's environmental footprint.
colors:
  primary: "#16A34A"
  primary-dark: "#22C55E"
  accent: "#4ADE80"
  bg: "#F8FAF9"
  bg-dark: "#0B1120"
  card: "#FFFFFF"
  card-dark: "#111827"
  ink: "#111827"
  ink-dark: "#F1F5F9"
  muted-ink: "#64748B"
  muted-ink-dark: "#94A3B8"
  border: "#E5E7EB"
  border-dark: "#2A3441"
  destructive: "#DC2626"
  esg-good-fg: "#166534"
  esg-good-bg: "#DCFCE7"
  esg-mid-fg: "#92400E"
  esg-mid-bg: "#FEF3C7"
  esg-bad-fg: "#991B1B"
  esg-bad-bg: "#FEE2E2"
typography:
  headline:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "ui-monospace, SF Mono, Cascadia Code, Menlo, Consolas, monospace"
    fontSize: "0.66rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.04em"
  data:
    fontFamily: "ui-monospace, SF Mono, Cascadia Code, Menlo, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "#15912b"
    textColor: "#FFFFFF"
  button-outline:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "40px"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    height: "40px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  badge-esg-good:
    backgroundColor: "{colors.esg-good-bg}"
    textColor: "{colors.esg-good-fg}"
    rounded: "{rounded.pill}"
    padding: "1px 8px"
---

# Design System: Sustainable Spending Tracker

## 1. Overview

**Creative North Star: "The Field Notebook"**

SST is the field notebook of someone observing their own spending: precise, annotated, data-forward, and quietly honest. The numbers are the subject; the interface is the ruled paper they sit on. Monospaced labels and tabular figures give it the feel of an instrument readout, not a marketing dashboard. Density is welcome where it serves comprehension (a month of transactions, a footprint series), restraint everywhere else.

The notebook has one warm habit: it roots for the reader. Where a raw observation log would print `−12%`, SST prints the full comparison (`▼ 12% vs abril`) and, on a good month, a small green ground note (`🌱 Bajaste un 12% — ¡buen mes!`). That is the only place personality raises its voice. It motivates, it never moralizes; it celebrates improvement and frames impact as a choice, not a verdict.

This system explicitly rejects **crypto-bro neon** (no neon gradients, no glassmorphism-by-default, no gradient text, no purple glow) and the **rigid corporate bank** (no navy-and-gold, no stock smiling-people photography, no cold wall of legal-dense text). Sustainability data read through a hype lens loses trust; read through an institutional lens it loses humanity. SST is the instrument in between: credible and human.

**Key Characteristics:**
- Data-forward: monospaced figures and labels, tabular alignment, the number is the hero.
- Restrained green, committed where it counts: green is the semantic color of sustainability across data viz and primary actions, never decoration.
- Flat at rest, responsive to touch: surfaces are defined by borders; depth is a reaction to state.
- One warm note: positive reinforcement and full-context comparisons, nowhere else.
- WCAG 2.1 AA, color never the only signal.

## 2. Colors

A near-neutral paper canvas with a single committed green that carries both meaning (sustainability) and action, plus a three-stop ESG scale that always pairs color with a number.

### Primary
- **Sustaining Green** (`#16A34A`, green-600; dark mode `#22C55E`, green-500 for contrast): primary actions, current selection, the active data point in a series, focus rings. The semantic color of sustainability. Defined as `--primary` / `--ring`.
- **Sprout Green** (`#4ADE80`, green-400): the `--accent`, reserved for hover surfaces on ghost/outline controls and subtle highlight fills. Never a second primary.

### Neutral
- **Ink** (`#111827`, gray-900; dark `#F1F5F9`): body and headline text. Defined as `--foreground`.
- **Field Note Gray** (`#64748B`, slate-500; dark `#94A3B8`): secondary labels, captions, column headers, the comparison-period text. Defined as `--muted-foreground`. Must still clear 4.5:1 on its surface.
- **Paper** (`#F8FAF9` off-white; dark `#0B1120` near-black): the body background, `--background`. Deliberately NOT cream/sand — chroma sits near 0, tinted a hair toward the brand hue, not toward warmth.
- **Card White** (`#FFFFFF`; dark `#111827`): raised surfaces, `--card`.
- **Rule Line** (`#E5E7EB`, gray-200; dark `#2A3441`): borders, dividers, chart grid lines. The literal ruled lines of the notebook.

### Tertiary — The ESG Scale
- **Good** (`#166534` on `#DCFCE7`): footprint score ≥ 70.
- **Mid** (`#92400E` on `#FEF3C7`): footprint score 40–69.
- **Bad** (`#991B1B` on `#FEE2E2`): footprint score < 40.

### Named Rules
**The Color-Plus-Number Rule.** Every ESG value shows its number inside the colored chip; color is never the sole carrier of meaning. A grayscale print or a colorblind reader must still read the score. Forbidden: a bare colored dot or background with no figure.

**The Committed-Restraint Rule.** Green carries data viz and primary actions and nothing else. It is allowed to dominate a chart (that is the data speaking) but it never tints chrome, nav, or card backgrounds. If green appears as decoration, it is wrong.

## 3. Typography

**Body/UI Font:** system sans (`ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto`)
**Data/Label Font:** system mono (`ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas`)
**Display Font:** none. Product UI does not need display/body pairing.

**Character:** One well-tuned sans carries every UI role; a monospace partner carries every figure and field label. The mono is what gives SST its instrument-readout feel and keeps numbers vertically aligned. The contrast axis is sans-vs-mono (a real axis), not two competing sans-serifs.

### Hierarchy
- **Headline** (600, `1.5rem`, line-height 1, tracking `-0.02em`): page and primary card titles ("Huella de mayo"). Fixed rem, never fluid clamp.
- **Title** (600, `1.125rem`, tracking `-0.01em`): section and secondary card titles.
- **Body** (400, `0.875rem`, line-height 1.5): descriptions, prose. Cap prose at 65–75ch; tables may run denser.
- **Label** (mono, 500, `0.66rem`, tracking `0.04em`, UPPERCASE): column headers, metric keys, chart axes. Uppercase is permitted here because these are short data labels (≤4 words), not section eyebrows.
- **Data** (mono, 500, `0.875rem`, `font-variant-numeric: tabular-nums`): all currency amounts, scores, deltas. Tabular figures so columns align.

### Named Rules
**The Tabular-Numbers Rule.** Every figure that sits in a column or updates in place uses `font-variant-numeric: tabular-nums` in the mono face. Money that jitters as digits change reads as a toy.

**The No-Eyebrow Rule.** Uppercase mono is for data labels and column headers only. It is forbidden as a tracked kicker above section headings ("RESUMEN", "IMPACTO"); that is the AI eyebrow trope, not this system's voice.

## 4. Elevation

Flat by default, with depth introduced only as a response to state. Surfaces are defined by their 1px Rule-Line border, not by a resting shadow. This keeps the page reading as ruled paper rather than a stack of floating panels. Tonal layering (Paper background vs Card White surface) does most of the depth work; shadow is reserved for interaction.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 6px 20px rgba(17,24,39,.08)`): applied on card hover/focus only, paired with `translateY(-2px)`. Signals "this is interactive / selected".
- **Action Glow** (`box-shadow: 0 4px 14px rgba(22,163,74,.30)`): on primary-button hover only. The single place the brand green is allowed to bloom.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest; the border is the boundary. A shadow appears only as a response to state (hover, focus, selected). A card that floats on a shadow while idle is wrong — remove the resting shadow, keep the border.

## 5. Components

### Buttons
- **Shape:** sharp, notebook-square corners (`4px`, `rounded.sm`). Tighter than the shadcn default to match the technical register.
- **Primary:** Sustaining Green fill, white text, `40px` height, `0 16px` padding, mono-adjacent sans label (verb + object). Confident and tactile: hover deepens the green (`#15912b`) and adds Action Glow; `:active` presses down `translateY(1px)`.
- **Hover / Focus:** `transition: background .15s, transform .12s, box-shadow .15s`. Focus-visible draws a 2px Sustaining Green ring offset from the surface. Never rely on color alone for focus; the ring is structural.
- **Outline / Ghost:** outline uses Paper bg + Rule-Line border; ghost is transparent. Both hover to a Sprout-Green-tinted accent surface, not a fill.

### Inputs / Fields
- **Style:** Paper background, 1px Rule-Line border, `4px` radius, `40px` height, `8px 12px` padding. Placeholder uses Field Note Gray and must still clear 4.5:1.
- **Focus:** 2px Sustaining Green ring, offset 2px. No glow.
- **Error / Disabled:** error border in Destructive `#DC2626` plus a text message (never red border alone); disabled drops to `opacity .5`, `cursor: not-allowed`.

### Cards / Containers
- **Corner Style:** `8px` (`rounded.lg`) — the one place radius softens, to frame content.
- **Background:** Card White on Paper. Tonal layering carries the separation.
- **Shadow Strategy:** none at rest (see Flat-By-Default Rule); Lift on hover/focus only.
- **Border:** 1px Rule-Line, always.
- **Internal Padding:** `24px` (`spacing.lg`); compact data cards may use `16px`.

### Badges — ESG Score (signature component)
- **Style:** pill (`999px`), 1px border, `1px 8px` padding, mono `0.72rem`. Three tones map to score bands (Good ≥70 / Mid 40–69 / Bad <40), each a fg/bg/border triad from the ESG Scale.
- **Always shows the numeric score inside** (Color-Plus-Number Rule). The chip is an annotation, not a traffic light.

### Navigation
- **Style:** top bar. Brand mark (green rounded square + "SST") left, links right in Field Note Gray; active link goes Ink + weight 600. Mono labels optional for a more instrument-like read.
- **Mobile:** collapse links into a sheet/menu; structural responsive behavior, never fluid type.

### Charts (signature)
- Bars/lines in muted gray for historical points, **Sustaining Green for the current/active point** (the data speaks the brand color). Horizontal Rule-Line grid lines behind the plot (the ruled-paper motif). Mono axis labels, uppercase.

### Comparison Delta & Ground Note (signature voice)
- **Delta:** always rendered with its comparison period — `▼ 12% vs abril`, never a bare `−12%`. Down-arrow + green for improvement, up-arrow + Destructive for regression, both with text.
- **Ground Note:** on a good month, a small green reinforcement banner inside the summary card (`🌱 Bajaste un 12% — ¡buen mes!`) using the ESG-Good triad. The single sanctioned moment of warmth.

## 6. Do's and Don'ts

### Do:
- **Do** render every currency figure, score, and delta in the mono face with `tabular-nums`.
- **Do** keep surfaces flat at rest and introduce the Lift shadow only on hover/focus.
- **Do** show the numeric score inside every ESG chip; color annotates, never carries meaning alone.
- **Do** write deltas with their comparison period (`▼ 12% vs abril`) and use the green Ground Note to celebrate a good month.
- **Do** keep green committed to data viz and primary actions; let it dominate a chart, never the chrome.
- **Do** verify body and placeholder text hits ≥4.5:1 in both light and dark mode, especially Field Note Gray.
- **Do** give every animation a `prefers-reduced-motion: reduce` fallback (crossfade or instant).

### Don't:
- **Don't** use crypto-bro neon: no neon gradients, no glassmorphism-by-default, no gradient text (`background-clip: text`), no purple glow. (PRODUCT.md anti-reference.)
- **Don't** drift toward the rigid corporate bank: no navy-and-gold, no stock smiling-people photos, no cold legal-dense walls of text. (PRODUCT.md anti-reference.)
- **Don't** use the saturated AI default cream/sand/beige body background, or token names like `--paper`/`--cream`/`--sand`. Paper here is chroma ≈ 0.
- **Don't** build the hero-metric template (big number + small label + gradient accent + supporting stat row) or endless identical card grids.
- **Don't** put a tracked uppercase eyebrow ("RESUMEN", "IMPACTO") above sections; uppercase mono is for data labels only (No-Eyebrow Rule).
- **Don't** use `border-left`/`border-right` > 1px as a colored accent stripe on cards or rows. Full borders or nothing.
- **Don't** tint chrome, nav, or card backgrounds green; green that isn't data or a primary action is wrong.
- **Don't** signal error with a red border alone — always pair with a text message.
