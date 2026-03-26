# AI Agent Command Center

A full-stack platform to launch, monitor, and control multiple AI agents working on parallel tasks, with human oversight when needed.

## Tech Stack

- **Backend**: Node.js + Fastify + SQLite + OpenAI API
- **Frontend**: Next.js 14 (App Router) + Vanilla CSS
- **Real-time**: WebSocket for live updates

## Quick Start

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure your OpenAI API key
Edit `backend/.env` and set:
```
OPENAI_API_KEY=your_actual_api_key
```

### 3. Run the app
```bash
npm run dev
```

This starts:
- **Backend** at `http://localhost:3001`
- **Frontend** at `http://localhost:3000`

## Features

- 🤖 **Agent Management** — Create agents with custom system prompts, models, and capabilities
- ⚡ **Task Control** — Launch, monitor, and cancel tasks with real-time progress
- 🔄 **Workflows** — Chain multi-agent pipelines for complex operations
- 👁️ **Human Oversight** — Approve/reject low-confidence AI decisions
- 📊 **Live Dashboard** — Real-time metrics and system health
- ⚙️ **Settings** — Configure orchestration parameters and model defaults

## Architecture

```
├── backend/
│   ├── .env                  # API keys & config
│   ├── src/
│   │   ├── index.js          # Fastify server entry
│   │   ├── db/               # SQLite schema & connection
│   │   ├── services/         # OpenAI, orchestrator, agent runner, WS
│   │   └── routes/           # REST + WebSocket endpoints
├── frontend/
│   ├── app/                  # Next.js pages (dashboard, agents, tasks, etc.)
│   ├── components/           # Sidebar, shared components
│   └── lib/                  # API client, WebSocket hook
```
