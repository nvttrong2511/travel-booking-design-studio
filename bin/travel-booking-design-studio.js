#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = '2.0.0';
const AGENT_NAME = 'travel-booking-design-studio';
const SOURCE_ENTRY = path.join(PACKAGE_ROOT, '.claude', 'agents', `${AGENT_NAME}.md`);
const SOURCE_DIRECTORY = path.join(PACKAGE_ROOT, '.claude', 'agents', AGENT_NAME);

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
  init       Install the agent into .claude/agents/
  update     Update agent-owned files
  status     Show installation status
  remove     Remove the installed agent
  help       Show this help

Options:
  --target <directory>   Project directory. Defaults to current directory
  --force                Replace conflicting files
  --yes, -y              Skip confirmation prompts
  --dry-run              Preview changes without writing
  --version, -v          Print version

Examples:
  npx github:nvttrong2511/travel-booking-design-studio init
  npx travel-booking-design-studio update --dry-run
  npx travel-booking-design-studio remove
`);
}

function parseArgs(argv) {
  const args = [...argv];
  const command = args[0] && !args[0].startsWith('-') ? args.shift() : 'init';
  const options = {
    target: process.cwd(),
    force: false,
    yes: false,
    dryRun: false,
    help: false,
    version: false,
  };

  while (args.length) {
    const arg = args.shift();
    if (arg === '--target') options.target = path.resolve(args.shift() || '.');
    else if (arg === '--force') options.force = true;
    else if (arg === '--yes' || arg === '-y') options.yes = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--version' || arg === '-v') options.version = true;
    else throw new Error(`Unknown option: ${arg}`);
  }

  return { command, options };
}

function walkFiles(root) {
  if (!fs.existsSync(root)) return [];
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(absolute));
    else files.push(absolute);
  }
  return files;
}

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function sameContent(source, destination) {
  return fs.existsSync(destination) && readText(source) === readText(destination);
}

function relativeToTarget(target, absolute) {
  return path.relative(target, absolute).split(path.sep).join('/');
}

function copySafely(source, destination, options, report) {
  const relative = relativeToTarget(options.target, destination);
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
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }

  (exists ? report.updated : report.created).push(relative);
}

function installSources(target) {
  const destinationRoot = path.join(target, '.claude', 'agents');
  const sources = [
    {
      source: SOURCE_ENTRY,
      destination: path.join(destinationRoot, `${AGENT_NAME}.md`),
    },
  ];

  for (const source of walkFiles(SOURCE_DIRECTORY)) {
    const relative = path.relative(SOURCE_DIRECTORY, source);
    sources.push({
      source,
      destination: path.join(destinationRoot, AGENT_NAME, relative),
    });
  }

  return sources;
}

function manifestPath(target) {
  return path.join(target, '.claude', 'agents', AGENT_NAME, 'installation.json');
}

function writeManifest(target, options, report) {
  const file = manifestPath(target);
  const previous = fs.existsSync(file) ? JSON.parse(readText(file)) : null;
  const managedFiles = new Set(previous?.managedFiles || []);

  for (const item of [...report.created, ...report.updated, ...report.unchanged]) {
    if (item !== relativeToTarget(target, file)) managedFiles.add(item);
  }

  const manifest = {
    package: AGENT_NAME,
    version: VERSION,
    installedAt: new Date().toISOString(),
    managedFiles: [...managedFiles].sort(),
  };

  if (!options.dryRun) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
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
    console.log('  Use --force only when replacement is intentional.');
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
  options.target = target;

  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
    throw new Error(`Target directory does not exist: ${target}`);
  }

  const approved = await confirm(
    `${mode === 'update' ? 'Update' : 'Install'} ${AGENT_NAME} in ${target}?`,
    options,
  );
  if (!approved) return warning('Cancelled.');

  const report = { created: [], updated: [], unchanged: [], conflicts: [] };
  info(`${mode === 'update' ? 'Updating' : 'Installing'} one Claude Code agent`);

  for (const item of installSources(target)) {
    copySafely(item.source, item.destination, options, report);
  }

  writeManifest(target, options, report);
  printReport(report, options.dryRun);

  if (!options.dryRun) {
    success('Agent installed at .claude/agents/travel-booking-design-studio/');
    console.log('\nStart Claude Code and ask:');
    console.log(`  ${color('1', 'Use the travel-booking-design-studio agent to redesign the hotel search experience.')}`);
  }
}

function status(options) {
  const target = path.resolve(options.target);
  const entry = path.join(target, '.claude', 'agents', `${AGENT_NAME}.md`);
  const directory = path.join(target, '.claude', 'agents', AGENT_NAME);
  const manifest = manifestPath(target);

  console.log(`Travel Booking Design Studio status for ${target}\n`);
  console.log(`Agent entry: ${fs.existsSync(entry) ? color('32', 'installed') : color('31', 'missing')}`);
  console.log(`Agent directory: ${fs.existsSync(directory) ? color('32', 'installed') : color('31', 'missing')}`);
  console.log(`Manifest: ${fs.existsSync(manifest) ? color('32', 'present') : color('33', 'not found')}`);

  if (fs.existsSync(manifest)) {
    const data = JSON.parse(readText(manifest));
    console.log(`Version: ${data.version || 'unknown'}`);
    console.log(`Managed files: ${data.managedFiles?.length || 0}`);
  }
}

async function remove(options) {
  const target = path.resolve(options.target);
  options.target = target;
  const approved = await confirm(`Remove ${AGENT_NAME} from ${target}?`, options);
  if (!approved) return warning('Cancelled.');

  const manifest = manifestPath(target);
  const managed = new Set([
    `.claude/agents/${AGENT_NAME}.md`,
    `.claude/agents/${AGENT_NAME}`,
  ]);

  if (fs.existsSync(manifest)) {
    const data = JSON.parse(readText(manifest));
    for (const file of data.managedFiles || []) managed.add(file);
  }

  let removed = 0;
  for (const relative of managed) {
    const absolute = path.join(target, relative);
    if (!fs.existsSync(absolute)) continue;
    if (!options.dryRun) fs.rmSync(absolute, { recursive: true, force: true });
    removed += 1;
  }

  success(`${options.dryRun ? 'Would remove' : 'Removed'} ${removed} managed path(s).`);
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
