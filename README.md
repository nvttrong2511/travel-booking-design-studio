# Travel Booking Design Studio

An AI-first creative design operating system for building bold, original, production-ready travel booking interfaces with Claude Code.

This repository is not a generic documentation archive and not a clone factory. It is a structured AI design studio that forces divergent thinking, strong art direction, critical review, and implementation discipline.

## Core promise

> Invent interfaces. Do not imitate marketplaces.

Every substantial design task must:

1. generate at least three structurally different concepts;
2. define a visual and interaction language before assembling components;
3. reject generic travel marketplace and SaaS patterns;
4. preserve usability, accessibility, trust, responsive behavior, and implementation feasibility;
5. finish with a critical design review.

## Install into Claude Code

### 1. Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
claude doctor
```

### 2. Install this studio into an existing frontend project

Run from the root of your travel project:

```bash
curl -fsSL https://raw.githubusercontent.com/nvttrong2511/travel-booking-design-studio/main/scripts/install.sh | bash
```

Then start Claude Code:

```bash
claude
```

Inside Claude Code, type `/` to verify the studio commands, then run:

```text
/create-concept
```

The installer preserves the project's existing `CLAUDE.md`. It installs the studio as `CLAUDE.design-studio.md` and adds this import:

```md
@CLAUDE.design-studio.md
```

For manual installation, Windows notes, verification, updates, uninstall instructions, and a complete recommended workflow, read [`INSTALL.md`](INSTALL.md).

## Use this repository directly

```bash
git clone https://github.com/nvttrong2511/travel-booking-design-studio.git
cd travel-booking-design-studio
claude
```

Claude Code automatically reads the root `CLAUDE.md`. Specialist agents live in `.claude/agents/`, and reusable workflows live in `.claude/commands/`.

## Recommended workflow

```text
/create-concept
/challenge-design
/generate-design-language
/reinvent-layout
/implement-concept
/design-review
```

Do not begin by asking Claude to code the page immediately. Start with a brief and concepts, critique them, lock the design language, then implement the selected direction.

## Repository map

```text
.claude/
  agents/       Specialist creative agents
  commands/     Reusable design workflows
  rules/        Non-negotiable studio rules

scripts/        Project installer

docs/
  principles/   Creative and UX principles
  playbooks/    End-to-end design methods
  patterns/     Layout, interaction, motion, and storytelling patterns
  references/   Inspiration translation frameworks

templates/      Structured briefs and output templates
checklists/     Quality gates before implementation and delivery
examples/       Worked examples showing the expected level of thinking
```

## What this studio rejects

- Airbnb, Booking, Agoda, Traveloka, Expedia, or generic SaaS imitation
- safe hero-search-card page formulas
- concepts that only change color, radius, font, or imagery
- decorative motion without purpose
- desktop layouts merely stacked on mobile
- fabricated prices, availability, ratings, or policies
- visual novelty that damages clarity or trust

## What good output looks like

A strong result has a recognizable point of view, a coherent spatial system, meaningful motion, emotional pacing, clear booking decisions, accessible interaction, and realistic engineering boundaries.
