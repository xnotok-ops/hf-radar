# 🤗 HF Radar

Daily trending Hugging Face models, datasets & spaces digest. Auto-generated via GitHub Actions with Telegram notifications and a web UI.

## Features

- **Auto Daily Digest** — GitHub Actions runs every day at 07:45 WIB, scans Hugging Face trending
- **3 Categories** — Models, Datasets, and Spaces tracked separately
- **Web UI** — Browse all historical digests via GitHub Pages
- **Telegram Notification** — Get top trending AI models sent to Telegram every morning
- **Weekly Persistent** — Track which models stay trending 3+ days (not just one-day hype)
- **Monthly Consistent** — Track which models are consistently popular over 30 days
- **Global Sources** — All languages, all authors, descriptions as-is

## What It Tracks

| Category | What | Metrics |
|----------|------|---------|
| 🧠 Models | LLMs, image gen, embeddings, audio, etc | Likes, downloads, downloads/day, pipeline tag |
| 📦 Datasets | Training data, benchmarks, etc | Likes, downloads, downloads/day |
| 🚀 Spaces | Demo apps, tools, playgrounds | Likes, SDK type |

## How It Works

    1. GitHub Actions triggers daily (cron 07:45 WIB)
    2. Fetches trending from Hugging Face API
    3. Records to history.json for weekly/monthly tracking
    4. Generates markdown digest
    5. Rebuilds web UI
    6. Commits & pushes automatically
    7. Sends Telegram notification

## Quick Start

### Option A: Fork & Run

1. Fork this repo
2. Settings → Actions → enable all actions
3. Settings → Pages → Source: main, folder: /docs → Save
4. Actions → Daily HF Radar → Run workflow
5. Web UI live at https://YOUR-USERNAME.github.io/hf-radar

### Option B: Run locally

    git clone https://github.com/xnotok-ops/hf-radar.git
    cd hf-radar
    npm start
    npm run build

## Telegram Setup (optional)

Uses the same Telegram bot as GitHub Radar. Add these secrets to repo:
- TELEGRAM_BOT_TOKEN
- TELEGRAM_CHAT_ID

Optionally add HF_TOKEN for higher API rate limits (get from huggingface.co/settings/tokens).

## Project Structure

    hf-radar/
    ├── .github/workflows/
    │   └── daily-hf-radar.yml
    ├── src/
    │   ├── index.js
    │   ├── fetch-trending.js
    │   ├── generate-digest.js
    │   ├── history-tracker.js
    │   ├── telegram.js
    │   └── build-index.js
    ├── digests/
    ├── docs/
    │   └── index.html
    ├── package.json
    ├── .gitignore
    └── README.md

## Related

- [GitHub Radar](https://github.com/xnotok-ops/github-radar) — Same concept but for GitHub trending repos

---

**Built by [@xnotok](https://x.com/xnotok)** | [github.com/xnotok-ops](https://github.com/xnotok-ops)
