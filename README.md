# CommerceAI

AI Commerce Machine untuk affiliate marketer.

## Quick Start

```bash
npm install
npx prisma db push
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `AI_API_KEY` — API key untuk AI provider (kosongkan untuk menggunakan MockAIProvider)
- `AI_MODEL` — Model yang digunakan (default: gpt-4o)
- `AI_BASE_URL` — Base URL API (default: OpenAI)
