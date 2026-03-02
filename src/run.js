import path from "path";
import fs from "fs-extra";
import { execa } from "execa";
import open from "open";

import { slug, TEMPLATES_ROOT, delay } from "./utils.js";
import * as ui from "./ui.js";
import { createSupabaseProject } from "./providers/supabase.js";
import { createAndPush } from "./providers/github.js";
import { deployFromGitHub } from "./providers/vercel.js";

export async function run(answers) {
  const name = slug(answers.projectName);
  const isWeb = answers.platform === "web";
  const cwd = process.cwd();
  const projectPath = path.join(cwd, name);

  console.log();
  ui.section(`Creating "${name}" — ${isWeb ? "Next.js Web App" : "Expo Mobile App"}`);

  // ─────────────────────────────────────────
  // STEP 1 — Create project
  // ─────────────────────────────────────────
  ui.start(isWeb ? "Running create-next-app..." : "Running create-expo-app...", true);

  try {
    if (isWeb) {
      await execa("npx", [
        "create-next-app@latest",
        name,
        "--typescript",
        "--app",
        "--tailwind",
        "--eslint",
        "--yes",
      ]);
    } else {
      await execa("npx", [
        "create-expo-app@latest",
        name,
        "--template",
        "blank-typescript",
      ]);
    }
    ui.succeed("Project created!");
  } catch (err) {
    ui.fail("Project creation failed.");
    ui.dim(err.message);
    process.exit(1);
  }

  // ─────────────────────────────────────────
  // STEP 2 — Supabase (OPTIONAL)
  // ─────────────────────────────────────────
  let supabase = null;

  if (answers.useSupabase) {
    ui.start("Provisioning Supabase project...");
    try {
      supabase = await createSupabaseProject(
        answers.supabaseToken,
        answers.supabaseOrgId,
        name
      );
      ui.succeed(`Supabase ready → ${supabase.url}`);
    } catch (err) {
      ui.warn("Supabase provisioning failed.");
      ui.dim(err.message);
    }
  }

  // ─────────────────────────────────────────
  // STEP 3 — Install packages (only if needed)
  // ─────────────────────────────────────────
  if (answers.useSupabase || isWeb) {
    ui.start("Installing dependencies...", true);

    try {
      const pkgs = [];

      if (answers.useSupabase) {
        pkgs.push("@supabase/supabase-js");
        if (isWeb) pkgs.push("@supabase/ssr");
      }

      if (isWeb) {
        pkgs.push("@google/generative-ai", "resend");
      }

      if (pkgs.length > 0) {
        await execa("npm", ["install", ...pkgs], { cwd: projectPath });
      }

      ui.succeed("Dependencies installed!");
    } catch (err) {
      ui.warn("Dependency installation failed.");
      ui.dim(err.message);
    }
  }

  // ─────────────────────────────────────────
  // STEP 4 — Inject templates
  // ─────────────────────────────────────────
  ui.start("Injecting boilerplate templates...");

  try {
    const tplDir = path.join(TEMPLATES_ROOT, isWeb ? "web" : "mobile");
    if (fs.existsSync(tplDir)) {
      fs.copySync(tplDir, projectPath, { overwrite: true });
    }
    ui.succeed("Templates injected!");
  } catch (err) {
    ui.warn("Template injection issue.");
  }

  if (!isWeb) {
    try { await setupExpoTabs(projectPath); } catch {}
  }

  // ─────────────────────────────────────────
  // STEP 5 — Write env files
  // ─────────────────────────────────────────
  ui.start("Writing environment files...");
  try {
    writeEnv(projectPath, isWeb, supabase);
    ui.succeed(".env files created!");
  } catch {
    ui.warn("Env file error.");
  }

  // ─────────────────────────────────────────
  // STEP 6 — GitHub (OPTIONAL)
  // ─────────────────────────────────────────
  let repoUrl = null;

  if (answers.useGithub) {
    ui.start("Creating GitHub repo & pushing...", true);

    try {
      repoUrl = await createAndPush(
        projectPath,
        name,
        answers.githubUsername,
        answers.githubToken
      );
      ui.succeed(`Pushed → ${repoUrl}`);
    } catch (err) {
      ui.warn("GitHub push failed.");
      ui.dim(err.message);
    }
  }

  // ─────────────────────────────────────────
  // STEP 7 — Vercel (OPTIONAL + depends on GitHub)
  // ─────────────────────────────────────────
  let liveUrl = null;

  if (isWeb && answers.deployVercel) {
    if (!answers.useGithub) {
      ui.warn("Vercel deployment requires GitHub repo. Skipping.");
    } else {
      ui.start("Deploying to Vercel...", true);

      try {
        const envVars = supabase
          ? {
              NEXT_PUBLIC_SUPABASE_URL: supabase.url,
              NEXT_PUBLIC_SUPABASE_ANON_KEY: supabase.anonKey,
            }
          : {};

        liveUrl = await deployFromGitHub(
          answers.vercelToken,
          answers.githubUsername,
          name,
          envVars
        );

        ui.succeed(`Live → ${liveUrl}`);
      } catch (err) {
        ui.warn("Vercel deploy failed.");
        ui.dim(err.message);
      }
    }
  }

  // ─────────────────────────────────────────
  // STEP 8 — Summary
  // ─────────────────────────────────────────
  const summary = {
    Project: name,
    Platform: isWeb ? "Next.js Web App" : "Expo Mobile App",
    Supabase: answers.useSupabase ? "Enabled" : "Skipped",
    GitHub: repoUrl || "Skipped",
    Vercel: liveUrl || (answers.deployVercel ? "Failed" : "Skipped"),
  };

  ui.done(summary);

  // ─────────────────────────────────────────
  // STEP 9 — Start dev server
  // ─────────────────────────────────────────
  if (liveUrl) {
    await openChrome(liveUrl);
  }

  if (isWeb) {
    ui.section("Starting Next.js dev server...");
    if (!liveUrl) {
      setTimeout(() => openChrome("http://localhost:3000"), 4000);
    }
    await execa("npm", ["run", "dev"], {
      cwd: projectPath,
      stdio: "inherit",
    });
  } else {
    ui.section("Starting Expo...");
    await execa("npx", ["expo", "start"], {
      cwd: projectPath,
      stdio: "inherit",
    });
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function writeEnv(projectPath, isWeb, supabase) {
  const prefix = isWeb ? "NEXT_PUBLIC" : "EXPO_PUBLIC";
  const lines = [
    "# Generated by VibeCodex 🚀",
    "",
    `# Supabase`,
    `${prefix}_SUPABASE_URL=${supabase?.url ?? ""}`,
    `${prefix}_SUPABASE_ANON_KEY=${supabase?.anonKey ?? ""}`,
    "",
  ];

  if (isWeb) {
    lines.push("# AI (Gemini)");
    lines.push("GEMINI_API_KEY=");
    lines.push("");
    lines.push("# Email (Resend)");
    lines.push("RESEND_API_KEY=");
    lines.push("");
  }

  const content = lines.join("\n");
  fs.writeFileSync(path.join(projectPath, ".env.local"), content);
  fs.writeFileSync(
    path.join(projectPath, ".env.example"),
    content
      .replace(/(SUPABASE_URL=).+/, "$1")
      .replace(/(SUPABASE_ANON_KEY=).+/, "$1")
  );
}

async function openChrome(url) {
  try {
    await open(url, { app: { name: open.apps.chrome } });
  } catch {
    try { await open(url); } catch (_) {}
  }
}

async function setupExpoTabs(projectPath) {
  const tabsDir = path.join(projectPath, "app", "(tabs)");
  fs.ensureDirSync(tabsDir);

  const appDir = path.join(projectPath, "app");
  fs.ensureDirSync(appDir);
  const authDir = path.join(appDir, "(auth)");
  fs.ensureDirSync(authDir);

  // Root layout
  fs.writeFileSync(path.join(appDir, "_layout.tsx"), `import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </>
  );
}
`);

  // Tab layout
  fs.writeFileSync(path.join(tabsDir, "_layout.tsx"), `import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: "#a855f7",
      tabBarStyle: { backgroundColor: "#0a0a0a", borderTopColor: "#1f1f1f" },
      headerStyle: { backgroundColor: "#0a0a0a" },
      headerTintColor: "#fff",
    }}>
      <Tabs.Screen name="index" options={{
        title: "Home",
        tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: "Profile",
        tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
      }} />
    </Tabs>
  );
}
`);
}
