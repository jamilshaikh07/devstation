# DevStation

A self-hosted, mobile-friendly development environment that runs anywhere Docker does. Code from your phone, tablet, or laptop — same tools, same files.

## What's Inside

- **Code Editor** — VS Code in the browser (code-server) with Microsoft marketplace support (Copilot works!)
- **Mobile Editor** — CodeMirror 6 based editor that auto-loads on phone-sized screens
- **Terminal** — Full web terminal (ttyd) with pre-installed DevOps tools
- **Single Port** — Everything behind nginx reverse proxy on port 80 with basic auth
- **File Preview** — View HTML files at `/preview/<project>/file.html`

## Pre-installed Tools

`git` · `kubectl` · `helm` · `k3d` · `kind` · `docker` · `claude` (Claude Code CLI) · `node` · `python3` · `jq` · `vim` · `htop`

## Quick Start

```bash
git clone https://github.com/jamilshaikh07/devstation.git
cd devstation
sudo docker compose up -d
```

Open `http://localhost` — login with `admin` / `devstation`.

## Configuration

Edit `.env` to change credentials:

```env
DEVSTATION_USER=admin
DEVSTATION_PASS=your-password
```

## Directory Structure

```
├── docker-compose.yml      # Service orchestration
├── code-server/             # Custom code-server image with DevOps tools
├── nginx/                   # Reverse proxy with auth
├── html/                    # Dashboard + mobile editor
├── projects/                # Your code lives here (mounted into container)
└── config/                  # Persistent config (SSH keys, git config, VS Code settings)
```

## Architecture

```
                    ┌─────────────────────────┐
                    │     nginx (port 80)      │
                    │   auth + reverse proxy   │
                    └────┬──────┬──────┬───────┘
                         │      │      │
              /code/     │  /term/  /preview/
                         │      │      │
                    ┌────┴──────┴──────┘
                    │   code-server container
                    ├── VS Code (8443)
                    ├── ttyd terminal (7681)
                    └── file-server API (3000)
```

Everything runs in a single container (code-server + ttyd + file API), so the VS Code terminal and the Term tab share the same environment and tools.

## Mobile

On screens ≤768px, the Code tab automatically loads a touch-optimized CodeMirror editor instead of VS Code. Features:

- File tree with tap navigation
- Syntax highlighting (JS/TS/Python/HTML/CSS/JSON/YAML/Markdown)
- Built-in terminal for quick commands
- Create/edit/save files — same filesystem as desktop

## iOS PWA

1. Open in Safari
2. Tap Share → Add to Home Screen
3. Launch from home screen for full-screen experience

## License

MIT
