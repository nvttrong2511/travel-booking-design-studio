#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = '1.0.0';
const MANAGED_MARKER = '<!-- travel-booking-design-studio -->';
const IMPORT_LINE = '@.claude/travel-booking-design-studio.md';

const profiles = {
  complete: {
    agents: true,
    commands: true,
    rules: true,
    resources: true,
  },
  minimal: {
    agents: false,
    commands: true,
    rules: true,
    resources: false,
  },
  agents: {
    agents: true,
    commands: false,
    rules: true,
    resources: false,
  },
  commands: {
    agents: false,
    commands: true,
    rules: false,
    resources: false,
  },
};

function color(code, value) {
  return process.stdout.isTTY ? `\u001b[${code}m${value}\u001b[0m` : value;
}

function info(message) {
  console.log(`${color('36', '●')} ${message}`);
}

function success(message) {
  console.log(`${color('32', '✓')} ${message}`);
}

function warning(message) {
  console.log(`${color('33', '!')} ${message}`);
}

function fail(message) {
  console.error(`${color('31', '✕')} ${message}`);
}

function printHelp() {
  console.log(`Travel Booking Design Studio v${VERSION}

Usage:
  travel-booking-design-studio [command] [options]

Commands:
  init       Install the studio into the current project
  update     Add new studio files without replacing user-modified files
  status     Show installation status and detected conflicts
  remove     Remove only files managed by this installer
  help       Show this help

Options:
  --profile <complete|minimal|agents|commands>
  --target <directory>   Project directory. Defaults to the current directory
  --force                Replace conflicting managed files
  --yes, -y              Skip confirmation prompts
  --dry-run               Preview changes without writing files
  --version, -v           Print the CLI version

Examples:
  npx github:nvttrong2511/travel-booking-design-studio init
  npx travel-booking-design-studio init --profile complete
  npx travel-booking-design-studio update --dry-run
`);
}

function parseArgs(argv) {
  const args = [...argv];
  const command = args[0] && !args[0].startsWith('-') ? args.shift() : 'init';
  const options = {
    profile: 'complete',
    target: process.cwd(),
    force: false,
    yes: false,
    dryRun: false,
  };

  while (args.length) {
    const arg = args.shift();
    if (arg === '--profile') options.profile = args.shift();
    else if (arg === '--target') options.target = path.resolve(args.shift() || '.');
    else if (arg === '--force') options.force = true;
    else if (arg === '--yes' || arg === '-y') options.yes = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--version' || arg === '-v') options.version = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error(`Unknown option: ${arg}`);
  }

  if (!profiles[options.profile]) {
    throw new Error(`Unknown profile: ${options.profile}`);
  }

  return { command, options };
}

function walkFiles(root) {
  if (!fs.existsSync(root)) return [];
  const output = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) output.push(...walkFiles(absolute));
    else output.push(absolute);
  }
  return output;
}

function relativeToPackage(absolute) {
  return path.relative(PACKAGE_ROOT, absolute).split(path.sep).join('/');
}

function ensureDirectory(directory, dryRun) {
  if (!dryRun) fs.mkdirSync(directory, { recursive: true });
}

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function sameContent(source, destination) {
  return fs.existsSync(destination) && readText(source) === readText(destination);
}

function copyFileSafely(source, destination, options, report) {
  const relative = path.relative(options.target, destination).split(path.sep).join('/');
  const exists = fs.existsSync(destination);

  if (exists && sameContent(source, destination)) {
    report.unchanged.push(relative);
    return;
  }

  if (exists && !options.force) {
    report.conflicts.push(relative);
    return;
  }

  if (!options.dryRun) {
    ensureDirectory(path.dirname(destination), false);
    fs.copyFileSync(source, destination);
  }

  (exists ? report.updated : report.created).push(relative);
}

function selectedSources(profile) {
  const selected = profiles[profile];
  const sources = [];

  if (selected.agents) sources.push(...walkFiles(path.join(PACKAGE_ROOT, '.claude', 'agents')));
  if (selected.commands) sources.push(...walkFiles(path.join(PACKAGE_ROOT, '.claude', 'commands')));
  if (selected.rules) sources.push(...walkFiles(path.join(PACKAGE_ROOT, '.claude', 'rules')));

  if (selected.resources) {
    for (const directory of ['templates', 'checklists', 'docs', 'examples']) {
      sources.push(...walkFiles(path.join(PACKAGE_ROOT, directory)));
    }
  }

  return sources;
}

function destinationFor(source, target) {
  const relative = relativeToPackage(source);
  if (relative.startsWith('.claude/')) return path.join(target, relative);
  return path.join(target, '.claude', 'travel-booking-design-studio', relative);
}

function createMemoryFile(target, options, report) {
  const source = path.join(PACKAGE_ROOT, 'CLAUDE.md');
  const destination = path.join(target, '.claude', 'travel-booking-design-studio.md');
  copyFileSafely(source, destination, options, report);
}

function updateRootClaudeFile(target, options, report) {
  const file = path.join(target, 'CLAUDE.md');
  const relative = 'CLAUDE.md';
  const block = `${MANAGED_MARKER}\n${IMPORT_LINE}\n`;

  if (!fs.existsSync(file)) {
    if (!options.dryRun) fs.writeFileSync(file, `# Project instructions\n\n${block}`, 'utf8');
    report.created.push(relative);
    return;
  }

  const content = readText(file);
  if (content.includes(IMPORT_LINE)) {
    report.unchanged.push(relative);
    return;
  }

  if (!options.dryRun) {
    const separator = content.endsWith('\n') ? '\n' : '\n\n';
    fs.writeFileSync(file, `${content}${separator}${block}`, 'utf8');
  }
  report.updated.push(relative);
}

function writeManifest(target, profile, options, report) {
  const manifestPath = path.join(target, '.claude', 'travel-booking-design-studio', 'installation.json');
  const manifest = {
    package: 'travel-booking-design-studio',
    version: VERSION,
    profile,
    installedAt: new Date().toISOString(),
    managedFiles: [...report.created, ...report.updated]
      .filter((item) => item !== 'CLAUDE.md')
      .sort(),
  };

  if (!options.dryRun) {
    ensureDirectory(path.dirname(manifestPath), false);
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  }
}

function printReport(report, dryRun) {
  const prefix = dryRun ? 'Would' : 'Did';
  if (report.created.length) success(`${prefix} create ${report.created.length} file(s)`);
  if (report.updated.length) success(`${prefix} update ${report.updated.length} file(s)`);
  if (report.unchanged.length) info(`${report.unchanged.length} file(s) already current`);
  if (report.conflicts.length) {
    warning(`${report.conflicts.length} conflict(s) left untouched:`);
    for (const file of report.conflicts) console.log(`  - ${file}`);
    console.log('  Re-run with --force only when replacing those files is intentional.');
  }
}

async function confirm(question, options) {
  if (options.yes || !process.stdin.isTTY) return true;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${question} [Y/n] `);
  rl.close();
  return answer.trim() === '' || /^y(es)?$/i.test(answer.trim());
}

async function install(options, mode) {
  const target = path.resolve(options.target);
  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
    throw new Error(`Target directory does not exist: ${target}`);
  }

  const approved = await confirm(
    `${mode === 'update' ? 'Update' : 'Install'} Travel Booking Design Studio in ${target}?`,
    options,
  );
  if (!approved) {
    warning('Cancelled.');
    return;
  }

  const report = { created: [], updated: [], unchanged: [], conflicts: [] };
  info(`${mode === 'update' ? 'Updating' : 'Installing'} profile: ${options.profile}`);

  createMemoryFile(target, options, report);
  updateRootClaudeFile(target, options, report);

  for (const source of selectedSources(options.profile)) {
    copyFileSafely(source, destinationFor(source, target), options, report);
  }

  writeManifest(target, options.profile, options, report);
  printReport(report, options.dryRun);

  if (!options.dryRun) {
    success('Claude Code studio is ready.');
    console.log('\nStart Claude Code in this project and run:');
    console.log(`  ${color('1', 'claude')}`);
    console.log(`  ${color('1', '/create-concept')}`);
  }
}

function status(options) {
  const target = path.resolve(options.target);
  const manifestPath = path.join(target, '.claude', 'travel-booking-design-studio', 'installation.json');
  const memoryPath = path.join(target, '.claude', 'travel-booking-design-studio.md');
  const rootClaude = path.join(target, 'CLAUDE.md');

  console.log(`Travel Booking Design Studio status for ${target}\n`);
  console.log(`Memory file: ${fs.existsSync(memoryPath) ? color('32', 'installed') : color('31', 'missing')}`);
  console.log(`CLAUDE.md import: ${fs.existsSync(rootClaude) && readText(rootClaude).includes(IMPORT_LINE) ? color('32', 'configured') : color('31', 'missing')}`);
  console.log(`Manifest: ${fs.existsSync(manifestPath) ? color('32', 'present') : color('33', 'not found')}`);

  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(readText(manifestPath));
    console.log(`Version: ${manifest.version || 'unknown'}`);
    console.log(`Profile: ${manifest.profile || 'unknown'}`);
    console.log(`Managed files: ${manifest.managedFiles?.length || 0}`);
  }
}

async function remove(options) {
  const target = path.resolve(options.target);
  const manifestPath = path.join(target, '.claude', 'travel-booking-design-studio', 'installation.json');
  const approved = await confirm(`Remove managed studio files from ${target}?`, options);
  if (!approved) {
    warning('Cancelled.');
    return;
  }

  const managed = new Set();
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(readText(manifestPath));
    for (const file of manifest.managedFiles || []) managed.add(file);
  } else {
    warning('Manifest missing. Only known studio-owned files will be removed.');
  }

  managed.add('.claude/travel-booking-design-studio.md');
  managed.add('.claude/travel-booking-design-studio/installation.json');

  let removed = 0;
  for (const relative of managed) {
    const absolute = path.join(target, relative);
    if (!fs.existsSync(absolute)) continue;
    if (!options.dryRun) fs.rmSync(absolute, { recursive: true, force: true });
    removed += 1;
  }

  const rootClaude = path.join(target, 'CLAUDE.md');
  if (fs.existsSync(rootClaude)) {
    const content = readText(rootClaude);
    const next = content
      .replace(`${MANAGED_MARKER}\n${IMPORT_LINE}\n`, '')
      .replace(`${MANAGED_MARKER}\r\n${IMPORT_LINE}\r\n`, '');
    if (next !== content && !options.dryRun) fs.writeFileSync(rootClaude, next, 'utf8');
  }

  const ownedDirectory = path.join(target, '.claude', 'travel-booking-design-studio');
  if (!options.dryRun && fs.existsSync(ownedDirectory)) {
    fs.rmSync(ownedDirectory, { recursive: true, force: true });
  }

  success(`${options.dryRun ? 'Would remove' : 'Removed'} ${removed} managed file(s).`);
}

async function main() {
  try {
    const { command, options } = parseArgs(process.argv.slice(2));
    if (options.version) return console.log(VERSION);
    if (options.help || command === 'help') return printHelp();

    if (command === 'init') await install(options, 'init');
    else if (command === 'update') await install(options, 'update');
    else if (command === 'status') status(options);
    else if (command === 'remove') await remove(options);
    else throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

await main();
