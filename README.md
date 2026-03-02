# VibeCodex

🚀 **Full-Stack App Generator** — Instantly scaffold production-ready applications with Next.js, Expo, Supabase, and Vercel.

VibeCodex is a premium CLI tool that takes the busywork out of setting up modern full-stack web and mobile projects. With a single command, you get an integrated, fully functional application complete with authentication, database configurations, and deployment automation.

## Features

- **Next.js Web Apps**: Modern App Router, TailwindCSS, Supabase Auth integrations, and one-click Vercel automated deployment.
- **Expo Mobile Apps**: React Native powered by Expo Router, complete with Supabase Auth, protected routes, and tab navigation.
- **Supabase Integration**: Out-of-the-box configuration for your Postgres database, Auth, and RLS policies.
- **GitHub Automation**: Automatically initializes a Git repository, creates initial commits, and pushes your code seamlessly to GitHub.
- **Vercel Automation**: (Web only) Creates a Vercel project and deploys your front-end instantly.
- **Beautiful Interface**: Enjoy a smooth, rainbow-animated terminal experience that is visually stunning.
- **AI Prompts Included**: Includes premade `.agents/prompts` to accelerate your ongoing development.

---

## Installation

Install globally via npm for easy reuse:

```bash
npm install -g @kunal-shetty/vibecodex
```

Or run it directly using `npx` without installing:

```bash
npx @kunal-shetty/vibecodex
```

## Usage

Simply run:

```bash
npx @kunal-shetty/vibecodex
```

The beautiful animated CLI will guide you through:
1. Entering your **Project Name**.
2. Choosing your **Platform** (Next.js Web App or Expo Mobile App).
3. Providing your **Supabase Access Token** and **Org ID**.
4. Providing your **GitHub Username** and **Token**.
5. *(Optional)* Setting up **Vercel Deployment** (for web apps only).

Follow the interactive terminal prompts, and let VibeCodex configure everything for you.

---

## Prerequisites

Before running the CLI, make sure you have the following credentials ready:
- **Supabase Access Token**: Go to `supabase.com/dashboard/account/tokens` to generate one.
- **Supabase Org ID**: Go to `supabase.com/dashboard/org` → Settings → General.
- **GitHub Classic Token**: Go to `github.com/settings/tokens` (Requires `repo` and `delete_repo` scopes).
- **Vercel Token** (optional): Go to `vercel.com/account/tokens` to deploy web apps.

---

## Structure Generated
VibeCodex sets up full repositories with optimal directory structures.
Web Apps feature top-tier layout patterns, components, and Tailwind styles.
Mobile Apps feature full Expo tab routing, `(auth)` layouts, and safe areas.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
