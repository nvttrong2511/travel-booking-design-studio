# Travel Booking Design Studio

A bold, original travel product design agent for Claude Code.

> One agent. One install. No marketplace clones.

The user sees one agent named `travel-booking-design-studio`. Creative direction, UX strategy, layout invention, interaction design, critique, accessibility, and implementation planning are coordinated internally by that single agent.

## Install

Run from the root of your project:

```bash
npx github:nvttrong2511/travel-booking-design-studio init
```

After the package is published to npm:

```bash
npx travel-booking-design-studio init
```

The installer creates:

```text
.claude/
└── agents/
    ├── travel-booking-design-studio.md
    └── travel-booking-design-studio/
        ├── AGENT.md
        └── installation.json
```

`travel-booking-design-studio.md` is the Claude Code agent entry point. The adjacent directory contains its internal operating system and supporting knowledge. This keeps one discoverable agent while allowing the agent package to grow without filling `.claude/agents/` with many unrelated agent names.

The installer does not modify the project's root `CLAUDE.md`.

## Use

Start Claude Code:

```bash
claude
```

Then ask naturally:

```text
Use the travel-booking-design-studio agent to redesign the hotel search experience.
Create three structurally different concepts and do not code until I approve one.
```

Other examples:

```text
Use the travel-booking-design-studio agent to critique this booking page.
```

```text
Use the travel-booking-design-studio agent in autopilot mode to redesign and implement the destination detail page.
```

The user does not need to remember slash commands. The agent automatically chooses between discovery, concept generation, design language, reinvention, implementation, review, and autopilot workflows.

## Agent behavior

For substantial interface work, the agent:

1. inspects the product and codebase;
2. identifies users, decisions, business goals, data, and constraints;
3. produces at least three structurally different concepts;
4. attacks generic and derivative ideas;
5. recommends one direction with explicit trade-offs;
6. defines the visual and interaction language;
7. implements only after approval unless autopilot is requested;
8. finishes with an accessibility, mobile, trust, performance, and originality review.

It rejects Airbnb, Booking, Agoda, Traveloka, Expedia, generic SaaS imitation, hero-search-card formulas, decorative motion, fabricated booking data, and visual novelty that damages clarity.

## CLI

```bash
# Install
npx github:nvttrong2511/travel-booking-design-studio init

# Install into another directory
npx github:nvttrong2511/travel-booking-design-studio init --target ../my-project

# Check installation
npx github:nvttrong2511/travel-booking-design-studio status

# Preview an update
npx github:nvttrong2511/travel-booking-design-studio update --dry-run

# Update safely
npx github:nvttrong2511/travel-booking-design-studio update

# Intentionally replace conflicts
npx github:nvttrong2511/travel-booking-design-studio update --force

# Remove the agent
npx github:nvttrong2511/travel-booking-design-studio remove
```

Options:

```text
--target <directory>
--force
--yes, -y
--dry-run
--version, -v
```

The CLI skips conflicts by default, records managed files, supports dry runs, and removes only the installed agent paths.

## Repository structure

```text
.claude/agents/
  travel-booking-design-studio.md       Claude Code entry point
  travel-booking-design-studio/
    AGENT.md                             Internal orchestration and rules

bin/                                    npm/npx installer
test/                                   CLI tests
docs/                                   Source knowledge and playbooks
templates/                              Source templates
checklists/                             Source quality gates
examples/                               Worked examples
```

The older specialist agent files remain source material during the transition, but the v2 installer exposes only the single `travel-booking-design-studio` agent to consuming projects.

## Development

```bash
git clone https://github.com/nvttrong2511/travel-booking-design-studio.git
cd travel-booking-design-studio
npm test
npm run check
node bin/travel-booking-design-studio.js init --target /tmp/test-project --dry-run
```

Test the packaged result:

```bash
npm pack
npx ./travel-booking-design-studio-2.0.0.tgz init --target /tmp/test-project
```

## License

MIT
