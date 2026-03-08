# ⚡ VibeCodex

> **Full-Stack App Generator** — scaffold production-ready apps in seconds.

[![npm](https://img.shields.io/npm/v/vibecodex.svg)](https://www.npmjs.com/package/vibecodex)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)

## What's new in v4.0

- **8 web templates** (up from 2)
- **6 mobile templates** (up from 1)
- **Modular features** — pick only what you need (Supabase, GitHub, Vercel)
- **Improved CLI** with progress bars, step tracking, and confirmation screen
- **Complete Supabase schemas** included in every template
- **Real working UI** — every template ships with full screen components, not just skeletons

## Quick Start

```bash
npx vibecodex
```

> Requires Node.js 18+

## Templates

### 🌐 Web (Next.js 14 · App Router · Tailwind · TypeScript)

| Template | Description | Includes |
|----------|-------------|---------|
| **SaaS Starter** | Full auth + dashboard | Login, signup, dashboard, pricing page, Supabase profiles |
| **AI Chat App** | OpenAI chat interface | Streaming-ready chat UI, `/api/chat` route, history schema |
| **E-commerce Store** | Product listings + cart | Product grid, cart page, Stripe-ready, orders schema |
| **Blog / CMS** | MDX-ready blog | Post listing, post detail, admin schema, comments |
| **Social Platform** | Twitter-like feed | Feed, compose, profile, follows/likes schema, realtime-ready |
| **Portfolio** | Developer portfolio | Hero, skills cloud, projects grid |
| **Analytics Dashboard** | KPI dashboard | Stat cards, chart placeholders, events schema |
| **Blank Next.js** | Clean slate | App Router + Tailwind + Supabase client wired up |

### 📱 Mobile (Expo 51 · React Native · Expo Router)

| Template | Description | Includes |
|----------|-------------|---------|
| **Social Media App** | Feed + profiles | Post feed, compose, profile tab, Supabase auth |
| **Fitness Tracker** | Workout planner | Today screen, workout cards, progress ring |
| **Task Manager** | To-do with priorities | Interactive task list, add/toggle, priority badges |
| **Food Delivery** | Restaurant browsing | Home feed, categories, restaurant cards |
| **AI Assistant** | Mobile chat bot | Chat UI, keyboard-aware, API-ready |
| **Blank Expo App** | Clean slate | Expo Router + Supabase client wired up |

## What gets generated

Every project comes with:

- ✅ Full project structure ready to `npm install`
- ✅ TypeScript configured
- ✅ Supabase client (browser + server for web, AsyncStorage for mobile)
- ✅ `.env.local` / `.env` with your real credentials (if provided)
- ✅ `.env.local.example` for teammates
- ✅ `supabase/schema.sql` — copy-paste into your Supabase SQL editor
- ✅ `.gitignore` with secrets excluded
- ✅ `README.md` with setup instructions
- ✅ Optional: GitHub repo created & pushed
- ✅ Optional: Vercel deployment triggered (web only)

## Credentials needed

You only need the credentials for features you select:

| Feature | Where to get it |
|---------|----------------|
| Supabase Token | [dashboard.supabase.com/account/tokens](https://dashboard.supabase.com/account/tokens) |
| Supabase Org ID | Dashboard → Settings → General |
| GitHub Token | [github.com/settings/tokens](https://github.com/settings/tokens) — needs `repo` scope |
| Vercel Token | [vercel.com/account/tokens](https://vercel.com/account/tokens) |

## Development

```bash
git clone https://github.com/kunal-shetty/vibecodex
cd vibecodex
npm install
node bin/index.js
```

## License

MIT © [kunal-shetty](https://github.com/kunal-shetty)
