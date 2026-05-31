# Product

## Register

brand

## Users

Technical leaders, portfolio managers, recruiters, and hiring decision-makers who land on the site to evaluate S. Ashwath as a candidate or collaborator. They are senior professionals — CTO, CRO, CFO, fund managers — comfortable with data but short on time. They want to verify that "18 years of enterprise tech leadership" is backed by real, demonstrable engineering capability, not just a resume narrative.

The /scenarios surface (Macro Cascade Intelligence Engine) is simultaneously a portfolio artefact and a working tool: visitors can run live macro analyses as part of evaluating the author's work. That surface behaves like a product (tool register) nested inside a brand surface (portfolio register). Audit and craft tasks targeting /scenarios should apply product-register standards.

## Product Purpose

A portfolio that proves technical depth by showing live AI systems, not describing them. Each domain page (E-Commerce, FinTech, Travel-Tech, Macro Engine) is a working artefact — simulations run, API calls happen, LLM briefs are generated in real time. The site exists to make a single claim undeniable: this is an operator-builder who ships, not just directs.

Success = a senior hiring decision-maker spends 10+ minutes in the engine, runs a scenario, reads a persona brief, and leaves convinced the author can build production AI systems.

## Brand Personality

Expert. Precise. Operator-grade.

Voice: technical confidence without jargon for its own sake. Every number earns its place. No decorative copy.

Emotional goal: the visitor should feel they are looking at something real and serious — not a demo, not a side project, not a showcase for its own sake. The work speaks; the UI frames it without competing with it.

## Anti-references

- Generic ChatGPT-wrapper portfolios — pretty card grids with no live behaviour
- Bloomberg's raw data dumps — powerful but inaccessible, no interpretive layer
- "AI startup" landing pages — gradient blobs, buzzwords, hero animations that say nothing
- SaaS template portfolios — shadcn defaults, uniform card grids, no point of view
- Academic research sites — dry, no urgency, hard to navigate

## Design Principles

1. **The work is the hero.** UI exists to frame the live data and outputs, never to compete with them. If a design element draws attention to itself rather than the analysis result, it loses.
2. **Precision signals credibility.** Every number, lag, confidence interval, and mechanism label is an artefact of real modelling. The design should treat these with the same seriousness as a Bloomberg terminal does — no rounding, no softening, no decorative labels.
3. **Dark + mono is the natural register.** This is a tool used by analysts, not consumers. The dot-matrix dark theme is not aesthetic — it is context-appropriate. It signals: this is a serious technical environment.
4. **Role-specificity over generality.** The 11 personas and scenario-locking features exist because the same macro shock means different things to a logistics CFO and a startup founder. The design should foreground this differentiation, not bury it.
5. **Show evidence, not claims.** Lock & Compare, live RSS signals, VIX seeding, calibration source tables — every feature is a proof mechanism. Design decisions should reinforce, not obscure, the evidence trail.

## Accessibility & Inclusion

WCAG 2.1 AA minimum. Key considerations:
- All interactive controls keyboard-accessible (trigger cards, matrix rows, persona dropdown, lock/run CTAs)
- Tooltip content must be reachable on keyboard and touch (mobile ⓘ inline expansion already implemented)
- Colour coding (delta AMP/MIT/FLIP) must not be the sole differentiator — text labels (AMP ▲, MIT ▼, FLIP ↕) are required alongside colour
- Reduced motion: Framer Motion `useReducedMotion` hook should suppress entrance animations
- Minimum 4.5:1 contrast for all data labels, impact percentages, and mechanism text against card backgrounds
