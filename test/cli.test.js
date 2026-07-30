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

test('complete profile installs studio into .claude without replacing project files', () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'travel-design-studio-'));
  fs.writeFileSync(path.join(project, 'CLAUDE.md'), '# Existing project rules\n', 'utf8');

  const result = run(['init', '--yes', '--target', project], project);
  assert.equal(result.status, 0, result.stderr);

  assert.ok(fs.existsSync(path.join(project, '.claude', 'agents', 'creative-director.md')));
  assert.ok(fs.existsSync(path.join(project, '.claude', 'commands', 'create-concept.md')));
  assert.ok(fs.existsSync(path.join(project, '.claude', 'travel-booking-design-studio.md')));
  assert.match(fs.readFileSync(path.join(project, 'CLAUDE.md'), 'utf8'), /@\.claude\/travel-booking-design-studio\.md/);
  assert.match(fs.readFileSync(path.join(project, 'CLAUDE.md'), 'utf8'), /Existing project rules/);
});

test('installer leaves conflicting user files untouched by default', () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'travel-design-studio-conflict-'));
  const command = path.join(project, '.claude', 'commands', 'create-concept.md');
  fs.mkdirSync(path.dirname(command), { recursive: true });
  fs.writeFileSync(command, 'user-owned command\n', 'utf8');

  const result = run(['init', '--yes', '--target', project], project);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(command, 'utf8'), 'user-owned command\n');
  assert.match(result.stdout, /conflict/i);
});

test('remove deletes managed files and preserves unrelated files', () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'travel-design-studio-remove-'));
  const unrelated = path.join(project, '.claude', 'notes.md');
  fs.mkdirSync(path.dirname(unrelated), { recursive: true });
  fs.writeFileSync(unrelated, 'keep me\n', 'utf8');

  assert.equal(run(['init', '--yes', '--target', project], project).status, 0);
  const result = run(['remove', '--yes', '--target', project], project);
  assert.equal(result.status, 0, result.stderr);

  assert.ok(fs.existsSync(unrelated));
  assert.ok(!fs.existsSync(path.join(project, '.claude', 'travel-booking-design-studio.md')));
  assert.doesNotMatch(fs.readFileSync(path.join(project, 'CLAUDE.md'), 'utf8'), /travel-booking-design-studio/);
});
