import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'bin', 'travel-booking-design-studio.js');

function run(args, cwd) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: 'utf8',
  });
}

test('installer creates one Claude Code agent and preserves CLAUDE.md', () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'travel-design-studio-'));
  const claudeFile = path.join(project, 'CLAUDE.md');
  fs.writeFileSync(claudeFile, '# Existing project rules\n', 'utf8');

  const result = run(['init', '--yes', '--target', project], project);
  assert.equal(result.status, 0, result.stderr);

  assert.ok(fs.existsSync(path.join(project, '.claude', 'agents', 'travel-booking-design-studio.md')));
  assert.ok(fs.existsSync(path.join(project, '.claude', 'agents', 'travel-booking-design-studio', 'AGENT.md')));
  assert.ok(fs.existsSync(path.join(project, '.claude', 'agents', 'travel-booking-design-studio', 'installation.json')));
  assert.equal(fs.readFileSync(claudeFile, 'utf8'), '# Existing project rules\n');
  assert.ok(!fs.existsSync(path.join(project, '.claude', 'commands')));
});

test('installer leaves a conflicting agent entry untouched by default', () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'travel-design-studio-conflict-'));
  const entry = path.join(project, '.claude', 'agents', 'travel-booking-design-studio.md');
  fs.mkdirSync(path.dirname(entry), { recursive: true });
  fs.writeFileSync(entry, 'user-owned agent\n', 'utf8');

  const result = run(['init', '--yes', '--target', project], project);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(entry, 'utf8'), 'user-owned agent\n');
  assert.match(result.stdout, /conflict/i);
});

test('remove deletes only the installed agent paths', () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'travel-design-studio-remove-'));
  const unrelated = path.join(project, '.claude', 'notes.md');
  fs.mkdirSync(path.dirname(unrelated), { recursive: true });
  fs.writeFileSync(unrelated, 'keep me\n', 'utf8');

  assert.equal(run(['init', '--yes', '--target', project], project).status, 0);
  const result = run(['remove', '--yes', '--target', project], project);
  assert.equal(result.status, 0, result.stderr);

  assert.ok(fs.existsSync(unrelated));
  assert.ok(!fs.existsSync(path.join(project, '.claude', 'agents', 'travel-booking-design-studio.md')));
  assert.ok(!fs.existsSync(path.join(project, '.claude', 'agents', 'travel-booking-design-studio')));
});
