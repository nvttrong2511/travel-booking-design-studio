# Travel Booking Design Studio

An AI-first creative design operating system for building bold, original, production-ready travel booking interfaces with Claude Code.

> Invent interfaces. Do not imitate marketplaces.

This repository is both a design knowledge base and an installable CLI. The CLI places agents, commands, rules, templates, and studio instructions into an existing project's `.claude/` directory without replacing user-owned files by default.

## Quick start

### 1. Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
claude doctor
```

### 2. Run the studio installer inside your project

Until the package is published to npm, run it directly from GitHub:

```bash
cd your-travel-project
npx github:nvttrong2511/travel-booking-design-studio init
```

After npm publication, the shorter command will be:

```bash
npx travel-booking-design-studio init
```

The default `complete` profile installs:

```text
.claude/
├── agents/
├── commands/
├── rules/
├── travel-booking-design-studio.md
└── travel-booking-design-studio/
    ├── templates/
    ├── checklists/
    ├── docs/
    ├── examples/
    └── installation.json
```

It also creates or updates the root `CLAUDE.md` with:

```md
<!-- travel-booking-design-studio -->
@.claude/travel-booking-design-studio.md
```

Existing project instructions are preserved.

### 3. Start Claude Code

```bash
claude
```

Then run:

```text
/create-concept
```

## CLI commands

```bash
# Full studio
npx github:nvttrong2511/travel-booking-design-studio init

# Smaller installation
npx github:nvttrong2511/travel-booking-design-studio init --profile minimal

# Only specialist agents
npx github:nvttrong2511/travel-booking-design-studio init --profile agents

# Only slash commands
npx github:nvttrong2511/travel-booking-design-studio init --profile commands

# Inspect installation
npx github:nvttrong2511/travel-booking-design-studio status

# Preview an update
npx github:nvttrong2511/travel-booking-design-studio update --dry-run

# Update without replacing conflicts
npx github:nvttrong2511/travel-booking-design-studio update

# Replace conflicting studio paths intentionally
npx github:nvttrong2511/travel-booking-design-studio update --force

# Remove managed files
npx github:nvttrong2511/travel-booking-design-studio remove
```

Supported options:

```text
--profile <complete|minimal|agents|commands>
--target <directory>
--force
--yes, -y
--dry-run
--version, -v
```

## Safety behavior

The CLI:

- installs Claude Code assets under `.claude/`;
- preserves an existing root `CLAUDE.md` and appends one managed import;
- skips conflicting files by default;
- records managed paths in `installation.json`;
- removes only recorded studio files during `remove`;
- supports `--dry-run` before update or removal;
- uses only Node.js built-ins and requires Node.js 18 or newer.

## Recommended design workflow

```text
/create-concept
/challenge-design
/generate-design-language
/reinvent-layout
/implement-concept
/design-review
```

Do not begin by asking Claude to code the page immediately. Start with a brief and multiple structurally different concepts, critique them, lock the design language, and only then implement the selected direction.

## Core creative rules

Every substantial design task must:

1. generate at least three structurally different concepts;
2. define a visual and interaction language before assembling components;
3. reject generic travel marketplace and SaaS patterns;
4. preserve usability, accessibility, trust, responsive behavior, and implementation feasibility;
5. finish with a critical design review.

## Repository map

```text
.claude/
  agents/       Specialist creative agents
  commands/     Reusable design workflows
  rules/        Non-negotiable studio rules

bin/             npm/npx CLI
test/            CLI behavior tests
scripts/         Legacy shell installer

docs/            Principles, playbooks, patterns, references
templates/       Structured briefs and output templates
checklists/      Quality gates
examples/        Worked creative examples
```

## Development

```bash
git clone https://github.com/nvttrong2511/travel-booking-design-studio.git
cd travel-booking-design-studio
npm test
npm run check
node bin/travel-booking-design-studio.js init --target /path/to/test-project --dry-run
```

To test the package exactly as users receive it:

```bash
npm pack
npx ./travel-booking-design-studio-1.0.0.tgz init --target /path/to/test-project
```

## Publishing to npm

```bash
npm login
npm test
npm publish
```

The unscoped npm package name is configured as `travel-booking-design-studio`. Verify package-name availability immediately before publishing.

## What this studio rejects

- Airbnb, Booking, Agoda, Traveloka, Expedia, or generic SaaS imitation
- safe hero-search-card page formulas
- concepts that only change color, radius, font, or imagery
- decorative motion without purpose
- desktop layouts merely stacked on mobile
- fabricated prices, availability, ratings, or policies
- visual novelty that damages clarity or trust

## License

MIT
