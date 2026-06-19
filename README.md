# Aura AI — AI Companion

A regulation-compliant AI companion app with safety pipeline, memory engine, voice chat, streaming responses, and Stripe monetization.

## Tech Stack

- **Frontend**: React Native (Expo) + TypeScript
- **Backend**: Node.js + Express (TypeScript)
- **Database**: PostgreSQL + Drizzle ORM
- **LLM**: Groq (llama-3.1-8b-instant)
- **Memory**: Keyword-based fact extraction & retrieval
- **Voice**: Web Speech API (browser) / OpenAI Whisper + TTS (with API key)
- **Auth**: JWT + bcrypt
- **Payments**: Stripe Checkout
- **Safety**: Pre/post-message content moderation + crisis detection

## Features

- ✅ Chat with AI companions (Aurora, Orion, Lyra + custom)
- ✅ Safety pipeline — crisis detection, content moderation, minor protection, break reminders
- ✅ Memory engine — extracts facts from conversations, retrieves relevant memories
- ✅ Age gating — birth year verification, minor mode
- ✅ AI disclosure banner — transparent about AI nature
- ✅ Voice calls — Web Speech API (browser) or OpenAI (with key)
- ✅ WebSocket streaming — real-time token-by-token responses
- ✅ Stripe payments — premium subscription with checkout flow
- ✅ Free tier — 50 messages/day, unlimited with premium
- ✅ Glassmorphism design — cosmic purple/blue theme

## Quick Start

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- pnpm (`npm i -g pnpm`)

### Setup

```bash
# Install dependencies
pnpm install

# Start PostgreSQL
docker compose up -d db

# Copy env and fill in your keys
cp .env.example .env
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | JWT signing secret |
| `GROQ_API_KEY` | Yes | LLM chat via Groq |
| `OPENAI_API_KEY` | No | Memory embeddings + STT/TTS |
| `STRIPE_SECRET_KEY` | No | Stripe payments |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |

### Run

```bash
# Push database schema
pnpm --filter @workspace/db exec drizzle-kit push --config ./drizzle.config.ts

# Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start Expo app (port 8081)
cd artifacts/aura-ai
pnpm run dev:win   # Windows
pnpm run dev       # macOS/Linux
```

## Project Structure

```
├── artifacts/
│   ├── api-server/          # Express backend
│   │   └── src/
│   │       ├── routes/      # API endpoints
│   │       ├── services/    # Safety, memory, voice, LLM
│   │       └── middleware/  # Auth middleware
│   └── aura-ai/             # React Native / Expo frontend
│       └── app/             # Screens & navigation
├── lib/
│   └── db/                  # Database schema & client
├── docker-compose.yml
└── AGENTS.md                # AI assistant instructions
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account (with birth year) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |
| PUT | `/api/auth/me` | Update profile |
| GET | `/api/companions` | List companions |
| POST | `/api/companions` | Create companion |
| POST | `/api/companions/:id/chat` | Send message |
| GET | `/api/companions/:id/messages` | Get chat history |
| POST | `/api/payments/create-checkout-session` | Premium checkout |
| POST | `/api/voice/stt` | Speech-to-text (with OpenAI key) |
| POST | `/api/voice/tts` | Text-to-speech (with OpenAI key) |
| WS | `/ws/chat?token=JWT` | WebSocket streaming chat |
| GET | `/api/healthz` | Health check |

## Safety Features

- Crisis detection (self-harm, suicide language) with crisis resources
- Content moderation (explicit, medical advice)
- Minor protection mode (stricter filtering for under-18)
- Pre-message and post-message safety checks
- Break reminders every 20 messages for minors, 50 for adults
- AI disclosure banner on every screen

## Voice

On **web browsers** (Chrome/Edge), voice uses the built-in Web Speech API — no API key needed. On **native** (iOS/Android), set `OPENAI_API_KEY` for Whisper STT and TTS.

## Memory

Facts are extracted from conversations using regex patterns and stored with keyword tags. Relevant memories are retrieved by keyword similarity. No external API needed — works entirely with the built-in keyword engine.

## License

MIT
