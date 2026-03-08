import fs from "fs-extra";
import path from "path";

/**
 * Scaffold a web template into the given directory.
 * Returns an array of additional env vars to set.
 */
export async function scaffoldWebTemplate(template, projectPath, options = {}) {
  const { projectName, supabaseUrl, supabaseAnonKey } = options;

  // Write base Next.js files all templates share
  await writeBaseNextjs(projectPath, projectName);

  // Template-specific files
  switch (template) {
    case "saas-starter":
      await writeSaasStarter(projectPath, options);
      break;
    case "ai-chat":
      await writeAiChat(projectPath, options);
      break;
    case "ecommerce":
      await writeEcommerce(projectPath, options);
      break;
    case "blog-cms":
      await writeBlogCms(projectPath, options);
      break;
    case "social":
      await writeSocial(projectPath, options);
      break;
    case "portfolio":
      await writePortfolio(projectPath, options);
      break;
    case "analytics":
      await writeAnalytics(projectPath, options);
      break;
    case "blank-web":
    default:
      await writeBlankWeb(projectPath, options);
      break;
  }

  // Write .env.local
  await writeEnvLocal(projectPath, {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl || "YOUR_SUPABASE_URL",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey || "YOUR_SUPABASE_ANON_KEY",
    ...(template === "ai-chat" ? { OPENAI_API_KEY: "YOUR_OPENAI_API_KEY" } : {}),
    ...(template === "ecommerce"
      ? { STRIPE_SECRET_KEY: "YOUR_STRIPE_SECRET_KEY", NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "YOUR_STRIPE_PK" }
      : {}),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// BASE — shared across all web templates
// ─────────────────────────────────────────────────────────────────────────────

async function writeBaseNextjs(dir, projectName) {
  // package.json
  await fs.outputJSON(
    path.join(dir, "package.json"),
    {
      name: projectName,
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      },
      dependencies: {
        next: "14.2.3",
        react: "^18",
        "react-dom": "^18",
        "@supabase/supabase-js": "^2.43.4",
        "@supabase/ssr": "^0.4.0",
        "lucide-react": "^0.378.0",
        "clsx": "^2.1.1",
        "tailwind-merge": "^2.3.0",
      },
      devDependencies: {
        typescript: "^5",
        "@types/node": "^20",
        "@types/react": "^18",
        "@types/react-dom": "^18",
        tailwindcss: "^3.4.1",
        postcss: "^8",
        autoprefixer: "^10.0.1",
        eslint: "^8",
        "eslint-config-next": "14.2.3",
      },
    },
    { spaces: 2 }
  );

  // next.config.mjs
  await fs.outputFile(
    path.join(dir, "next.config.mjs"),
    `/** @type {import('next').NextConfig} */
const nextConfig = {};
export default nextConfig;
`
  );

  // tsconfig.json
  await fs.outputJSON(
    path.join(dir, "tsconfig.json"),
    {
      compilerOptions: {
        target: "ES2017",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: { "@/*": ["./src/*"] },
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    },
    { spaces: 2 }
  );

  // tailwind.config.ts
  await fs.outputFile(
    path.join(dir, "tailwind.config.ts"),
    `import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};
export default config;
`
  );

  // postcss.config.mjs
  await fs.outputFile(
    path.join(dir, "postcss.config.mjs"),
    `const config = { plugins: { tailwindcss: {}, autoprefixer: {} } };
export default config;
`
  );

  // src/app/globals.css
  await fs.outputFile(
    path.join(dir, "src/app/globals.css"),
    `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #171717;
}
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}
`
  );

  // src/lib/supabase/client.ts
  await fs.outputFile(
    path.join(dir, "src/lib/supabase/client.ts"),
    `import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
`
  );

  // src/lib/supabase/server.ts
  await fs.outputFile(
    path.join(dir, "src/lib/supabase/server.ts"),
    `import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
`
  );

  // src/lib/utils.ts
  await fs.outputFile(
    path.join(dir, "src/lib/utils.ts"),
    `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`
  );

  // .gitignore
  await fs.outputFile(
    path.join(dir, ".gitignore"),
    `.env*.local
.env
node_modules/
.next/
out/
.DS_Store
*.pem
`
  );

  // README.md
  await fs.outputFile(
    path.join(dir, "README.md"),
    `# ${projectName}

> Scaffolded with [VibeCodex](https://github.com/kunal-shetty/vibecodex) ⚡

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Copy \`.env.local.example\` to \`.env.local\` and fill in your values.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Language**: TypeScript
`
  );
}

async function writeEnvLocal(dir, vars) {
  const lines = Object.entries(vars).map(([k, v]) => `${k}=${v}`).join("\n");
  await fs.outputFile(path.join(dir, ".env.local"), lines + "\n");
  await fs.outputFile(path.join(dir, ".env.local.example"), lines + "\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: SaaS Starter
// ─────────────────────────────────────────────────────────────────────────────
async function writeSaasStarter(dir, opts) {
  // Layout
  await fs.outputFile(
    path.join(dir, "src/app/layout.tsx"),
    `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaaS App",
  description: "Built with VibeCodex",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`
  );

  // Landing page
  await fs.outputFile(
    path.join(dir, "src/app/page.tsx"),
    `import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center text-white">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-6xl font-bold tracking-tight">
          Your <span className="text-purple-400">SaaS</span> App
        </h1>
        <p className="text-xl text-slate-300 max-w-lg">
          The fastest way to launch your software business. Auth, billing, and dashboards — all ready.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/auth/signup" className="bg-purple-600 hover:bg-purple-500 px-8 py-3 rounded-lg font-semibold transition-colors">
            Get Started Free
          </Link>
          <Link href="/auth/login" className="border border-slate-600 hover:border-slate-400 px-8 py-3 rounded-lg font-semibold transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
`
  );

  // Auth pages
  await fs.outputFile(
    path.join(dir, "src/app/auth/login/page.tsx"),
    `"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Welcome back</h2>
        {error && <p className="text-red-400 text-sm mb-4 bg-red-950 border border-red-800 rounded-lg p-3">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 py-3 rounded-lg font-semibold text-white transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-slate-400 text-sm text-center mt-6">
          No account? <Link href="/auth/signup" className="text-purple-400 hover:underline">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
`
  );

  await fs.outputFile(
    path.join(dir, "src/app/auth/signup/page.tsx"),
    `"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage("Check your email for a confirmation link!");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Create account</h2>
        {message && <p className="text-blue-400 text-sm mb-4 bg-blue-950 border border-blue-800 rounded-lg p-3">{message}</p>}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 py-3 rounded-lg font-semibold text-white transition-colors">
            {loading ? "Creating account..." : "Sign Up Free"}
          </button>
        </form>
        <p className="text-slate-400 text-sm text-center mt-6">
          Already have an account? <Link href="/auth/login" className="text-purple-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
`
  );

  // Dashboard
  await fs.outputFile(
    path.join(dir, "src/app/dashboard/page.tsx"),
    `import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-purple-400">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{user.email}</span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-sm text-slate-400 hover:text-white transition-colors">Sign out</button>
          </form>
        </div>
      </header>
      <main className="p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Welcome back!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Users", value: "—", icon: "👥" },
            { label: "Revenue", value: "—", icon: "💰" },
            { label: "Active Plans", value: "—", icon: "📊" },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
`
  );

  // Auth callback route
  await fs.outputFile(
    path.join(dir, "src/app/auth/callback/route.ts"),
    `import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
`
  );

  // Signout route
  await fs.outputFile(
    path.join(dir, "src/app/auth/signout/route.ts"),
    `import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url));
}
`
  );

  // Pricing page
  await fs.outputFile(
    path.join(dir, "src/app/pricing/page.tsx"),
    `import Link from "next/link";

const plans = [
  { name: "Starter", price: "$0", features: ["5 projects", "Basic analytics", "Email support"], cta: "Get started", href: "/auth/signup", highlight: false },
  { name: "Pro", price: "$29/mo", features: ["Unlimited projects", "Advanced analytics", "Priority support", "Custom domains"], cta: "Start free trial", href: "/auth/signup", highlight: true },
  { name: "Enterprise", price: "Custom", features: ["Everything in Pro", "SSO", "SLA", "Dedicated support"], cta: "Contact sales", href: "mailto:hello@example.com", highlight: false },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white py-24 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-slate-400 text-xl">No hidden fees. Cancel anytime.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.name} className={\`rounded-2xl border p-8 \${plan.highlight ? "border-purple-500 bg-purple-900/20" : "border-slate-800 bg-slate-900"}\`}>
            <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
            <div className="text-3xl font-bold mb-6 text-purple-400">{plan.price}</div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-slate-300">
                  <span className="text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href={plan.href} className={\`block text-center py-3 rounded-lg font-semibold transition-colors \${plan.highlight ? "bg-purple-600 hover:bg-purple-500" : "border border-slate-600 hover:border-slate-400"}\`}>
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
`
  );

  // Supabase SQL schema
  await fs.outputFile(
    path.join(dir, "supabase/schema.sql"),
    `-- SaaS Starter Schema
-- Run this in your Supabase SQL Editor

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  plan text default 'free',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: AI Chat App
// ─────────────────────────────────────────────────────────────────────────────
async function writeAiChat(dir, opts) {
  await fs.outputFile(
    path.join(dir, "src/app/layout.tsx"),
    `import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "AI Chat", description: "AI Chat powered by OpenAI" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="bg-gray-950">{children}</body></html>;
}
`
  );

  await fs.outputFile(
    path.join(dir, "src/app/page.tsx"),
    `"use client";
import { useState, useRef, useEffect } from "react";

interface Message { role: "user" | "assistant"; content: string; }

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <header className="py-4 px-6 border-b border-gray-800 text-white font-bold text-lg">
        🤖 AI Assistant
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={\`flex \${m.role === "user" ? "justify-end" : "justify-start"}\`}>
            <div className={\`max-w-[80%] rounded-2xl px-4 py-3 text-sm \${m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"}\`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-3 text-gray-400 text-sm">Thinking...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t border-gray-800 flex gap-2">
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..." disabled={loading}
          className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
          Send
        </button>
      </div>
    </div>
  );
}
`
  );

  await fs.outputFile(
    path.join(dir, "src/app/api/chat/route.ts"),
    `import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { messages } = await request.json();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.OPENAI_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful, concise AI assistant." },
        ...messages,
      ],
      max_tokens: 1000,
    }),
  });

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "No response.";
  return NextResponse.json({ content });
}
`
  );

  await fs.outputFile(
    path.join(dir, "supabase/schema.sql"),
    `-- AI Chat Schema
create table public.chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  title text,
  created_at timestamptz default now()
);
create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.chat_sessions on delete cascade,
  role text check (role in ('user', 'assistant')),
  content text,
  created_at timestamptz default now()
);
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
create policy "User owns sessions" on public.chat_sessions using (auth.uid() = user_id);
create policy "User owns messages" on public.chat_messages using (
  session_id in (select id from public.chat_sessions where user_id = auth.uid())
);
`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: E-commerce
// ─────────────────────────────────────────────────────────────────────────────
async function writeEcommerce(dir, opts) {
  await fs.outputFile(
    path.join(dir, "src/app/layout.tsx"),
    `import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Store", description: "E-commerce store" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="bg-white">{children}</body></html>;
}
`
  );

  await fs.outputFile(
    path.join(dir, "src/app/page.tsx"),
    `import Link from "next/link";

const products = [
  { id: 1, name: "Product One", price: 29.99, image: "🎧", category: "Electronics" },
  { id: 2, name: "Product Two", price: 49.99, image: "👟", category: "Fashion" },
  { id: 3, name: "Product Three", price: 19.99, image: "📚", category: "Books" },
  { id: 4, name: "Product Four", price: 89.99, image: "⌚", category: "Accessories" },
  { id: 5, name: "Product Five", price: 14.99, image: "🎮", category: "Gaming" },
  { id: 6, name: "Product Six", price: 34.99, image: "🎨", category: "Art" },
];

export default function StorePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">🛍️ My Store</h1>
        <Link href="/cart" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">
          🛒 Cart (0)
        </Link>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-6xl">
                {p.image}
              </div>
              <div className="p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{p.category}</p>
                <h3 className="font-semibold text-gray-900 mb-2">{p.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">\${p.price}</span>
                  <button className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
`
  );

  await fs.outputFile(
    path.join(dir, "src/app/cart/page.tsx"),
    `"use client";
import { useState } from "react";
import Link from "next/link";

export default function CartPage() {
  const [items] = useState<any[]>([]);
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>
      {items.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-lg">Your cart is empty</p>
          <Link href="/" className="mt-4 inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800">
            Continue Shopping
          </Link>
        </div>
      ) : null}
    </div>
  );
}
`
  );

  await fs.outputFile(
    path.join(dir, "supabase/schema.sql"),
    `-- E-commerce Schema
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  stock_qty int default 0,
  category text,
  created_at timestamptz default now()
);
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  status text default 'pending',
  total numeric(10,2),
  stripe_payment_id text,
  created_at timestamptz default now()
);
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders on delete cascade,
  product_id uuid references public.products on delete set null,
  qty int not null,
  unit_price numeric(10,2) not null
);
alter table public.products enable row level security;
create policy "Anyone can view products" on public.products for select using (true);
alter table public.orders enable row level security;
create policy "Users can view own orders" on public.orders using (auth.uid() = user_id);
`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: Blog / CMS
// ─────────────────────────────────────────────────────────────────────────────
async function writeBlogCms(dir, opts) {
  await fs.outputFile(
    path.join(dir, "src/app/layout.tsx"),
    `import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "My Blog", description: "Personal blog" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="bg-white text-gray-900 font-serif">{children}</body></html>;
}
`
  );

  await fs.outputFile(
    path.join(dir, "src/app/page.tsx"),
    `import Link from "next/link";

const posts = [
  { slug: "hello-world", title: "Hello, World!", excerpt: "My first post on this blog.", date: "2024-01-01", readTime: "2 min" },
  { slug: "getting-started", title: "Getting Started with Next.js", excerpt: "Everything you need to know to build fast web apps.", date: "2024-01-15", readTime: "5 min" },
  { slug: "supabase-tips", title: "5 Supabase Tips for Developers", excerpt: "Level up your Supabase skills with these practical tips.", date: "2024-02-01", readTime: "7 min" },
];

export default function BlogHome() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <header className="mb-16">
        <h1 className="text-4xl font-bold mb-2">My Blog</h1>
        <p className="text-gray-500">Thoughts on code, design, and the internet.</p>
      </header>
      <div className="space-y-12">
        {posts.map((post) => (
          <article key={post.slug} className="group">
            <Link href={\`/blog/\${post.slug}\`}>
              <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
                <time>{post.date}</time>
                <span>·</span>
                <span>{post.readTime} read</span>
              </div>
              <h2 className="text-2xl font-bold group-hover:text-blue-600 transition-colors mb-2">{post.title}</h2>
              <p className="text-gray-600 leading-relaxed">{post.excerpt}</p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
`
  );

  await fs.outputFile(
    path.join(dir, "src/app/blog/[slug]/page.tsx"),
    `export default function PostPage({ params }: { params: { slug: string } }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <Link href="/" className="text-sm text-blue-600 hover:underline mb-8 block">← Back to blog</Link>
      <article>
        <h1 className="text-4xl font-bold mb-4">Post: {params.slug}</h1>
        <p className="text-gray-600 leading-loose">
          Post content goes here. Connect to Supabase or use MDX files for real content.
        </p>
      </article>
    </div>
  );
}

import Link from "next/link";
`
  );

  await fs.outputFile(
    path.join(dir, "supabase/schema.sql"),
    `-- Blog / CMS Schema
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,
  cover_url text,
  author_id uuid references auth.users on delete set null,
  published bool default false,
  published_at timestamptz,
  created_at timestamptz default now()
);
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts on delete cascade,
  user_id uuid references auth.users on delete cascade,
  content text not null,
  created_at timestamptz default now()
);
alter table public.posts enable row level security;
create policy "Anyone can read published posts" on public.posts for select using (published = true);
create policy "Authors can manage own posts" on public.posts using (auth.uid() = author_id);
alter table public.comments enable row level security;
create policy "Anyone can read comments" on public.comments for select using (true);
create policy "Users can insert own comments" on public.comments for insert with check (auth.uid() = user_id);
`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: Social Platform
// ─────────────────────────────────────────────────────────────────────────────
async function writeSocial(dir, opts) {
  await fs.outputFile(
    path.join(dir, "src/app/layout.tsx"),
    `import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Social App" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="bg-black text-white">{children}</body></html>;
}
`
  );

  await fs.outputFile(
    path.join(dir, "src/app/page.tsx"),
    `import Link from "next/link";
const posts = [
  { user: "alice", handle: "@alice", avatar: "👩", time: "2m", content: "Just shipped a new feature! So excited 🚀", likes: 24 },
  { user: "bob", handle: "@bob", avatar: "👨", time: "10m", content: "Beautiful day for coding ☀️", likes: 12 },
  { user: "carol", handle: "@carol", avatar: "🧑", time: "1h", content: "Hot take: TypeScript is worth the overhead", likes: 87 },
];
export default function FeedPage() {
  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold">Home</h1>
        <Link href="/profile" className="text-sm text-gray-400 hover:text-white">Profile</Link>
      </header>
      <div className="bg-gray-900 rounded-2xl p-4 mb-6 border border-gray-800">
        <textarea placeholder="What's on your mind?" className="w-full bg-transparent text-white resize-none focus:outline-none text-sm" rows={3} />
        <div className="flex justify-end mt-2">
          <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-500">Post</button>
        </div>
      </div>
      <div className="space-y-4">
        {posts.map((p, i) => (
          <div key={i} className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{p.avatar}</span>
              <div>
                <p className="font-semibold text-sm">{p.user}</p>
                <p className="text-xs text-gray-400">{p.handle} · {p.time}</p>
              </div>
            </div>
            <p className="text-sm text-gray-200 mb-3">{p.content}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <button className="hover:text-red-400">❤️ {p.likes}</button>
              <button className="hover:text-blue-400">💬 Reply</button>
              <button className="hover:text-green-400">🔁 Repost</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`
  );

  await fs.outputFile(
    path.join(dir, "supabase/schema.sql"),
    `-- Social Platform Schema
create table public.profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  follower_count int default 0,
  following_count int default 0,
  created_at timestamptz default now()
);
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  content text not null,
  image_url text,
  like_count int default 0,
  repost_count int default 0,
  created_at timestamptz default now()
);
create table public.follows (
  follower_id uuid references auth.users on delete cascade,
  following_id uuid references auth.users on delete cascade,
  primary key (follower_id, following_id)
);
create table public.likes (
  user_id uuid references auth.users on delete cascade,
  post_id uuid references public.posts on delete cascade,
  primary key (user_id, post_id)
);
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
create policy "Public profiles" on public.profiles for select using (true);
create policy "Public posts" on public.posts for select using (true);
create policy "Own posts" on public.posts for all using (auth.uid() = user_id);
`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: Portfolio
// ─────────────────────────────────────────────────────────────────────────────
async function writePortfolio(dir, opts) {
  await fs.outputFile(
    path.join(dir, "src/app/layout.tsx"),
    `import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Portfolio", description: "My Portfolio" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
`
  );

  await fs.outputFile(
    path.join(dir, "src/app/page.tsx"),
    `const projects = [
  { name: "Project Alpha", desc: "A full-stack SaaS app built with Next.js and Supabase.", tech: ["Next.js", "Supabase", "Tailwind"], link: "#" },
  { name: "Mobile Fitness App", desc: "Cross-platform fitness tracker built with Expo.", tech: ["Expo", "React Native", "TypeScript"], link: "#" },
  { name: "AI Chat Bot", desc: "Real-time AI assistant with chat history.", tech: ["OpenAI", "Next.js", "Vercel"], link: "#" },
];
const skills = ["TypeScript", "React", "Next.js", "Node.js", "Expo", "Supabase", "PostgreSQL", "Tailwind CSS", "GraphQL", "Docker"];

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-7xl mb-6">👋</div>
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Your Name
        </h1>
        <p className="text-2xl text-gray-300 mb-2">Full-Stack Developer & Designer</p>
        <p className="text-gray-400 max-w-lg mb-8">I build beautiful, performant web and mobile apps that people love to use.</p>
        <div className="flex gap-4">
          <a href="#projects" className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-full font-semibold transition-colors">View Work</a>
          <a href="mailto:you@example.com" className="border border-gray-600 hover:border-gray-400 px-8 py-3 rounded-full font-semibold transition-colors">Contact Me</a>
        </div>
      </section>
      {/* Skills */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Skills</h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {skills.map((s) => <span key={s} className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-full text-sm">{s}</span>)}
        </div>
      </section>
      {/* Projects */}
      <section id="projects" className="py-20 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div key={p.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500 transition-colors group">
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{p.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{p.desc}</p>
              <div className="flex flex-wrap gap-2">
                {p.tech.map((t) => <span key={t} className="bg-gray-800 text-xs px-2 py-1 rounded">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: Analytics Dashboard
// ─────────────────────────────────────────────────────────────────────────────
async function writeAnalytics(dir, opts) {
  await fs.outputFile(
    path.join(dir, "src/app/layout.tsx"),
    `import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Analytics Dashboard" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="bg-gray-950 text-white">{children}</body></html>;
}
`
  );

  await fs.outputFile(
    path.join(dir, "src/app/page.tsx"),
    `const stats = [
  { label: "Total Users", value: "12,482", delta: "+8.2%", positive: true },
  { label: "Monthly Revenue", value: "$48,294", delta: "+12.5%", positive: true },
  { label: "Churn Rate", value: "2.4%", delta: "-0.3%", positive: true },
  { label: "Avg Session", value: "4m 32s", delta: "-1.1%", positive: false },
];
export default function DashboardPage() {
  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-400 mt-1">Last 30 days</p>
      </header>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-sm text-gray-400 mb-2">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className={\`text-sm mt-1 \${s.positive ? "text-green-400" : "text-red-400"}\`}>{s.delta}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-64 flex items-center justify-center text-gray-500">
          📊 Line Chart — connect Supabase or use Recharts
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-64 flex items-center justify-center text-gray-500">
          🍩 Pie Chart — connect your data source
        </div>
      </div>
    </div>
  );
}
`
  );

  await fs.outputFile(
    path.join(dir, "supabase/schema.sql"),
    `-- Analytics Schema
create table public.events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  name text not null,
  properties jsonb,
  created_at timestamptz default now()
);
create index events_name_idx on public.events(name);
create index events_created_idx on public.events(created_at);
alter table public.events enable row level security;
create policy "Service role only" on public.events using (false);
`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE: Blank Web App
// ─────────────────────────────────────────────────────────────────────────────
async function writeBlankWeb(dir, opts) {
  await fs.outputFile(
    path.join(dir, "src/app/layout.tsx"),
    `import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "My App", description: "Built with VibeCodex" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
`
  );

  await fs.outputFile(
    path.join(dir, "src/app/page.tsx"),
    `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center text-white">
        <div className="text-6xl mb-6">⚡</div>
        <h1 className="text-4xl font-bold mb-4">Your App Starts Here</h1>
        <p className="text-slate-400 text-lg">Scaffolded with VibeCodex — edit <code className="bg-slate-700 px-2 py-0.5 rounded">src/app/page.tsx</code> to begin.</p>
      </div>
    </main>
  );
}
`
  );
}
