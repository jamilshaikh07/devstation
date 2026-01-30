const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const app = express();
app.use(express.json());
app.use(express.text());

const BASE = '/home/coder/projects';

function safePath(p) {
  const resolved = path.resolve(BASE, p || '');
  if (!resolved.startsWith(BASE)) throw new Error('Access denied');
  return resolved;
}

// List directory
app.get('/api/files', async (req, res) => {
  try {
    const dir = safePath(req.query.path);
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const items = entries
      .filter(e => !e.name.startsWith('.'))
      .map(e => ({ name: e.name, type: e.isDirectory() ? 'dir' : 'file' }))
      .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1));
    res.json(items);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Read file
app.get('/api/file', async (req, res) => {
  try {
    const content = await fs.readFile(safePath(req.query.path), 'utf-8');
    res.type('text/plain').send(content);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Write file
app.post('/api/file', async (req, res) => {
  try {
    const fp = safePath(req.query.path);
    await fs.mkdir(path.dirname(fp), { recursive: true });
    await fs.writeFile(fp, req.body, 'utf-8');
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Delete file
app.delete('/api/file', async (req, res) => {
  try {
    const fp = safePath(req.query.path);
    const stat = await fs.stat(fp);
    if (stat.isDirectory()) await fs.rm(fp, { recursive: true });
    else await fs.unlink(fp);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Create directory
app.post('/api/mkdir', async (req, res) => {
  try {
    await fs.mkdir(safePath(req.query.path), { recursive: true });
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Run command (sandboxed to projects dir)
app.post('/api/terminal', (req, res) => {
  try {
    const cwd = safePath(req.query.cwd || '');
    const output = execSync(req.body, { cwd, timeout: 10000, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    res.type('text/plain').send(output);
  } catch (e) {
    res.status(200).type('text/plain').send(e.stderr || e.stdout || e.message);
  }
});

app.listen(3000, '0.0.0.0', () => console.log('File server on :3000'));
