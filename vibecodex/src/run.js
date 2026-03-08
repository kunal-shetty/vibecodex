import path from "path";
import fs from "fs-extra";
import ora from "ora";
import chalk from "chalk";
import { printStep, printSuccess, printError, printInfo, printSummary } from "./ui.js";
import { createAndPush } from "./providers/github.js";
import { deployFromGitHub } from "./providers/vercel.js";
import { createProject as createSupabaseProject } from "./providers/supabase.js";
import { scaffoldWebTemplate } from "./templates/web.js";
import { scaffoldMobileTemplate } from "./templates/mobile.js";
import { toSlug } from "./utils.js";

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

  // Calculate total steps
  const steps = [
    "scaffold",
    features.includes("supabase") && "supabase",
    features.includes("github") && "github",
    features.includes("vercel") && platform === "web" && "vercel",
  ].filter(Boolean);
  const total = steps.length;

  let stepNum = 0;
  const next = (msg) => printStep(++stepNum, total, msg);

  let supabaseUrl = "";
  let supabaseAnonKey = "";
  let repoUrl = "";
  let liveUrl = "";

  // ── Step 1: Scaffold template ─────────────────────────────────────────────
  next(`Scaffolding ${chalk.cyan(template)} template...`);
  const spinner = ora({ text: "Writing project files...", color: "cyan" }).start();

  try {
    await fs.ensureDir(projectPath);

    if (platform === "web") {
      await scaffoldWebTemplate(template, projectPath, {
        projectName: slug,
        supabaseUrl,
        supabaseAnonKey,
      });
    } else {
      await scaffoldMobileTemplate(template, projectPath, {
        projectName: slug,
        supabaseUrl,
        supabaseAnonKey,
      });
    }

    spinner.succeed(chalk.green("Project files written"));
    printSuccess(`Created ${platform === "web" ? "Next.js" : "Expo"} project at ${chalk.cyan(projectPath)}`);
  } catch (err) {
    spinner.fail(chalk.red("Scaffold failed"));
    printError(err.message);
    process.exit(1);
  }

  // ── Step 2: Supabase ──────────────────────────────────────────────────────
  if (features.includes("supabase") && supabaseToken && supabaseOrgId) {
    next("Creating Supabase project...");
    const sbSpinner = ora({ text: "Provisioning database (this takes ~60 seconds)...", color: "cyan" }).start();

    try {
      const result = await createSupabaseProject(supabaseToken, supabaseOrgId, slug);
      supabaseUrl = result.apiUrl;
      supabaseAnonKey = result.anonKey;

      // Update .env files with real values
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
      sbSpinner.warn(chalk.yellow("Supabase setup failed — you can configure manually"));
      printInfo(`Error: ${err.message}`);
      printInfo("Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local manually");
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
    const vlSpinner = ora({ text: "Triggering deployment (this takes 1-3 minutes)...", color: "cyan" }).start();

    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    };

    try {
      liveUrl = await deployFromGitHub(vercelToken, githubUsername, slug, envVars);
      vlSpinner.succeed(chalk.green("Deployed to Vercel"));
      printSuccess(`Live: ${chalk.cyan(liveUrl)}`);
    } catch (err) {
      vlSpinner.warn(chalk.yellow("Vercel deployment failed"));
      printInfo(`Error: ${err.message}`);
      printInfo("You can deploy manually from vercel.com");
    }
  }

  // ── Done! ─────────────────────────────────────────────────────────────────
  printSummary({
    projectName: slug,
    platform,
    template,
    liveUrl,
    repoUrl,
    projectPath,
  });
}
