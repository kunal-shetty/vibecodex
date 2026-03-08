import path from "path";
import fs from "fs-extra";
import ora from "ora";
import chalk from "chalk";
import { execa } from "execa";
import { printStep, printSuccess, printError, printInfo, printSummary } from "./ui.js";
import { createAndPush } from "./providers/github.js";
import { deployFromGitHub } from "./providers/vercel.js";
import { createProject as createSupabaseProject } from "./providers/supabase.js";
import { scaffoldWebTemplate } from "./templates/web.js";
import { scaffoldMobileTemplate } from "./templates/mobile.js";
import { toSlug, sleep } from "./utils.js";

// Cross-platform open-in-browser helper
async function openInChrome(url) {
  const os = process.platform;
  try {
    if (os === "win32") {
      await execa("cmd", ["/c", "start", "chrome", url], { shell: true });
    } else if (os === "darwin") {
      await execa("open", ["-a", "Google Chrome", url]);
    } else {
      // Linux: try google-chrome → chromium-browser → xdg-open
      try { await execa("google-chrome", ["--new-tab", url]); }
      catch { try { await execa("chromium-browser", ["--new-tab", url]); }
      catch { await execa("xdg-open", [url]); } }
    }
    return true;
  } catch {
    return false;
  }
}

export async function run(answers) {
  const {
    projectName,
    platform,
    template,
    features = [],
    supabaseToken,
    supabaseOrgId,
    githubUsername,
    githubToken,
    vercelToken,
  } = answers;

  const slug = toSlug(projectName);
  const projectPath = path.resolve(process.cwd(), slug);

  const steps = [
    "scaffold",
    features.includes("supabase") && "supabase",
    features.includes("github") && "github",
    features.includes("vercel") && platform === "web" && "vercel",
    "install",
    "launch",
  ].filter(Boolean);
  const total = steps.length;

  let stepNum = 0;
  const next = (msg) => printStep(++stepNum, total, msg);

  let supabaseUrl = "";
  let supabaseAnonKey = "";
  let repoUrl = "";
  let liveUrl = "";

  // ── Step 1: Scaffold ──────────────────────────────────────────────────────
  next(`Scaffolding ${chalk.cyan(template)} template...`);
  const scaffoldSpinner = ora({ text: "Writing project files...", color: "cyan" }).start();
  try {
    await fs.ensureDir(projectPath);
    if (platform === "web") {
      await scaffoldWebTemplate(template, projectPath, { projectName: slug, supabaseUrl, supabaseAnonKey });
    } else {
      await scaffoldMobileTemplate(template, projectPath, { projectName: slug, supabaseUrl, supabaseAnonKey });
    }
    scaffoldSpinner.succeed(chalk.green("Project files written"));
    printSuccess(`Created ${platform === "web" ? "Next.js" : "Expo"} project at ${chalk.cyan(projectPath)}`);
  } catch (err) {
    scaffoldSpinner.fail(chalk.red("Scaffold failed"));
    printError(err.message);
    process.exit(1);
  }

  // ── Step 2: Supabase ──────────────────────────────────────────────────────
  if (features.includes("supabase") && supabaseToken && supabaseOrgId) {
    next("Creating Supabase project...");
    const sbSpinner = ora({ text: "Provisioning database (~60 seconds)...", color: "cyan" }).start();
    try {
      const result = await createSupabaseProject(supabaseToken, supabaseOrgId, slug);
      supabaseUrl = result.apiUrl;
      supabaseAnonKey = result.anonKey;

      const envFile = platform === "web"
        ? path.join(projectPath, ".env.local")
        : path.join(projectPath, ".env");
      let envContent = await fs.readFile(envFile, "utf-8").catch(() => "");
      envContent = envContent
        .replace(/YOUR_SUPABASE_URL/g, supabaseUrl)
        .replace(/YOUR_SUPABASE_ANON_KEY/g, supabaseAnonKey);
      await fs.outputFile(envFile, envContent);

      sbSpinner.succeed(chalk.green("Supabase project ready"));
      printSuccess(`API: ${chalk.cyan(supabaseUrl)}`);
    } catch (err) {
      sbSpinner.warn(chalk.yellow("Supabase setup failed — configure manually"));
      printInfo(`Error: ${err.message}`);
    }
  }

  // ── Step 3: GitHub ────────────────────────────────────────────────────────
  if (features.includes("github") && githubToken && githubUsername) {
    next(`Pushing to GitHub (${chalk.cyan(githubUsername)}/${slug})...`);
    const ghSpinner = ora({ text: "Creating repo & pushing...", color: "cyan" }).start();
    try {
      repoUrl = await createAndPush(projectPath, slug, githubUsername, githubToken);
      ghSpinner.succeed(chalk.green("GitHub repo created"));
      printSuccess(`Repo: ${chalk.cyan(repoUrl)}`);
    } catch (err) {
      ghSpinner.warn(chalk.yellow("GitHub push failed"));
      printInfo(`Error: ${err.message}`);
    }
  }

  // ── Step 4: Vercel ────────────────────────────────────────────────────────
  if (features.includes("vercel") && platform === "web" && vercelToken && githubUsername) {
    next("Deploying to Vercel...");
    const vlSpinner = ora({ text: "Triggering deployment (1-3 minutes)...", color: "cyan" }).start();
    try {
      liveUrl = await deployFromGitHub(vercelToken, githubUsername, slug, {
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
      });
      vlSpinner.succeed(chalk.green("Deployed to Vercel"));
      printSuccess(`Live: ${chalk.cyan(liveUrl)}`);
    } catch (err) {
      vlSpinner.warn(chalk.yellow("Vercel deployment failed"));
      printInfo(`Error: ${err.message}`);
      printInfo("Deploy manually at vercel.com");
    }
  }

  // ── Step: npm install ─────────────────────────────────────────────────────
  next("Installing dependencies...");
  const installSpinner = ora({ text: "Running npm install (may take a minute)...", color: "cyan" }).start();
  try {
    await execa("npm", ["install"], { cwd: projectPath });
    installSpinner.succeed(chalk.green("Dependencies installed"));
  } catch (err) {
    installSpinner.warn(chalk.yellow("npm install failed — run it manually"));
    printInfo(`Error: ${err.message}`);
  }

  // ── Step: Launch ──────────────────────────────────────────────────────────
  if (platform === "web") {
    // Start Next.js detached, then open Chrome
    next("Starting Next.js dev server...");
    const devUrl = "http://localhost:3000";
    printInfo(`Launching ${chalk.cyan("npm run dev")} on ${chalk.cyan(devUrl)}...`);

    const devProc = execa("npm", ["run", "dev"], {
      cwd: projectPath,
      stdio: "ignore",
      detached: true,
    });
    devProc.unref();

    // Wait for Next.js to finish initial compile
    await sleep(4000);

    const opened = await openInChrome(devUrl);
    if (opened) {
      printSuccess(`Chrome opened at ${chalk.cyan(devUrl)}`);
    } else {
      printInfo(`Visit ${chalk.cyan(devUrl)} in your browser`);
    }

  } else if (platform === "mobile") {
    // Start Expo — hand terminal over so QR code renders properly
    next("Starting Expo dev server...");

    // Open the Expo web UI in Chrome as well (port 8081)
    const expoWebUrl = "http://localhost:8081";
    printInfo(`Launching ${chalk.cyan("npx expo start")} — scan QR code with Expo Go`);
    printInfo(`Web interface: ${chalk.cyan(expoWebUrl)}`);
    console.log();

    // Small delay then open Chrome to the Expo web bundler
    setTimeout(async () => {
      const opened = await openInChrome(expoWebUrl);
      if (opened) printSuccess(`Chrome opened at ${chalk.cyan(expoWebUrl)}`);
    }, 5000);

    try {
      // stdio: "inherit" so Expo's interactive QR-code UI renders in terminal
      await execa("npx", ["expo", "start"], {
        cwd: projectPath,
        stdio: "inherit",
      });
    } catch (err) {
      // Exit code 130 / SIGINT = Ctrl-C by user — normal exit
      if (err.exitCode !== 130 && err.signal !== "SIGINT") {
        printError(`Expo failed to start: ${err.message}`);
        printInfo(`Run manually: cd ${slug} && npx expo start`);
      }
    }
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  printSummary({ projectName: slug, platform, template, liveUrl, repoUrl, projectPath });
}
