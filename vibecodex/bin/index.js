#!/usr/bin/env node

import inquirer from "inquirer";
import figlet from "figlet";
import gradient from "gradient-string";
import boxen from "boxen";
import chalk from "chalk";
import { run } from "../src/run.js";
import { showWelcomeBanner } from "../src/ui.js";

// ── Animated Banner ────────────────────────────────────────────────────────
await showWelcomeBanner();

// ── Template Definitions ───────────────────────────────────────────────────
const WEB_TEMPLATES = [
  {
    name: `${chalk.bold.white("SaaS Starter")}          ${chalk.gray("Auth · Billing · Dashboard · Supabase")}`,
    value: "saas-starter",
    short: "SaaS Starter",
  },
  {
    name: `${chalk.bold.white("AI Chat App")}           ${chalk.gray("OpenAI · Streaming · History · Auth")}`,
    value: "ai-chat",
    short: "AI Chat App",
  },
  {
    name: `${chalk.bold.white("E-commerce Store")}      ${chalk.gray("Products · Cart · Stripe · Auth")}`,
    value: "ecommerce",
    short: "E-commerce Store",
  },
  {
    name: `${chalk.bold.white("Blog / CMS")}            ${chalk.gray("MDX · SEO · Comments · Dark Mode")}`,
    value: "blog-cms",
    short: "Blog / CMS",
  },
  {
    name: `${chalk.bold.white("Social Platform")}       ${chalk.gray("Profiles · Feed · Realtime · Storage")}`,
    value: "social",
    short: "Social Platform",
  },
  {
    name: `${chalk.bold.white("Portfolio")}             ${chalk.gray("Projects · Skills · Contact · Animations")}`,
    value: "portfolio",
    short: "Portfolio",
  },
  {
    name: `${chalk.bold.white("Analytics Dashboard")}   ${chalk.gray("Charts · Realtime · Filters · Export")}`,
    value: "analytics",
    short: "Analytics Dashboard",
  },
  {
    name: `${chalk.bold.white("Blank Next.js App")}     ${chalk.gray("Clean slate — App Router · Tailwind")}`,
    value: "blank-web",
    short: "Blank Next.js App",
  },
];

const MOBILE_TEMPLATES = [
  {
    name: `${chalk.bold.white("Social Media App")}      ${chalk.gray("Feed · Stories · DMs · Auth")}`,
    value: "mobile-social",
    short: "Social Media App",
  },
  {
    name: `${chalk.bold.white("Fitness Tracker")}       ${chalk.gray("Workouts · Progress · Goals · Charts")}`,
    value: "mobile-fitness",
    short: "Fitness Tracker",
  },
  {
    name: `${chalk.bold.white("Task Manager")}          ${chalk.gray("Tasks · Projects · Reminders · Sync")}`,
    value: "mobile-tasks",
    short: "Task Manager",
  },
  {
    name: `${chalk.bold.white("Food Delivery")}         ${chalk.gray("Menu · Cart · Orders · Maps")}`,
    value: "mobile-food",
    short: "Food Delivery",
  },
  {
    name: `${chalk.bold.white("AI Assistant")}          ${chalk.gray("Chat · Voice · History · OpenAI")}`,
    value: "mobile-ai",
    short: "AI Assistant",
  },
  {
    name: `${chalk.bold.white("Blank Expo App")}        ${chalk.gray("Clean slate — Tabs · Auth · Supabase")}`,
    value: "blank-mobile",
    short: "Blank Expo App",
  },
];

// ── Main Prompts ───────────────────────────────────────────────────────────
const { platform } = await inquirer.prompt([
  {
    type: "list",
    name: "platform",
    message: chalk.cyan.bold("What are you building?"),
    choices: [
      {
        name: `${chalk.bold("🌐  Web App")}      ${chalk.gray("Next.js · App Router · Tailwind")}`,
        value: "web",
      },
      {
        name: `${chalk.bold("📱  Mobile App")}   ${chalk.gray("Expo · React Native · EAS")}`,
        value: "mobile",
      },
    ],
  },
]);

const templates = platform === "web" ? WEB_TEMPLATES : MOBILE_TEMPLATES;

const { template } = await inquirer.prompt([
  {
    type: "list",
    name: "template",
    message: chalk.cyan.bold("Choose a template:"),
    choices: templates,
    pageSize: 8,
  },
]);

const { projectName } = await inquirer.prompt([
  {
    type: "input",
    name: "projectName",
    message: chalk.cyan.bold("Project name:"),
    default: template.replace(/^(mobile-|blank-)/, "my-").replace(/-/g, "-"),
    validate: (v) => {
      if (!v.trim()) return "Project name is required";
      if (!/^[a-z0-9-_]+$/i.test(v.trim())) return "Use only letters, numbers, hyphens, underscores";
      return true;
    },
  },
]);

// ── Feature Selection ─────────────────────────────────────────────────────
const { features } = await inquirer.prompt([
  {
    type: "checkbox",
    name: "features",
    message: chalk.cyan.bold("Include optional features:"),
    choices: [
      { name: `${chalk.white("Supabase")}  ${chalk.gray("— Auth · DB · Storage · Realtime")}`, value: "supabase", checked: true },
      { name: `${chalk.white("GitHub")}    ${chalk.gray("— Auto-create & push repo")}`, value: "github", checked: true },
      ...(platform === "web"
        ? [{ name: `${chalk.white("Vercel")}    ${chalk.gray("— Auto-deploy to production")}`, value: "vercel", checked: true }]
        : []),
      { name: `${chalk.white("Prettier")} ${chalk.gray("— Code formatting config")}`, value: "prettier", checked: true },
      { name: `${chalk.white("ESLint")}    ${chalk.gray("— Linting rules")}`, value: "eslint", checked: true },
    ],
  },
]);

// ── Credentials ────────────────────────────────────────────────────────────
const credPrompts = [];

if (features.includes("supabase")) {
  credPrompts.push(
    {
      type: "password",
      name: "supabaseToken",
      message: chalk.cyan("Supabase Access Token") + chalk.gray(" (dashboard.supabase.com/account/tokens):"),
      mask: "●",
      validate: (v) => (v.trim() ? true : "Required — or remove Supabase from features"),
    },
    {
      type: "input",
      name: "supabaseOrgId",
      message: chalk.cyan("Supabase Org ID") + chalk.gray(" (dashboard → Settings → General):"),
      validate: (v) => (v.trim() ? true : "Required"),
    }
  );
}

if (features.includes("github")) {
  credPrompts.push(
    {
      type: "input",
      name: "githubUsername",
      message: chalk.cyan("GitHub username:"),
      validate: (v) => (v.trim() ? true : "Required"),
    },
    {
      type: "password",
      name: "githubToken",
      message: chalk.cyan("GitHub Token") + chalk.gray(" (needs: repo + delete_repo scopes):"),
      mask: "●",
      validate: (v) => (v.trim() ? true : "Required"),
    }
  );
}

if (features.includes("vercel") && platform === "web") {
  credPrompts.push({
    type: "password",
    name: "vercelToken",
    message: chalk.cyan("Vercel Token") + chalk.gray(" (vercel.com/account/tokens):"),
    mask: "●",
    validate: (v) => (v.trim() ? true : "Required"),
  });
}

const creds = credPrompts.length > 0 ? await inquirer.prompt(credPrompts) : {};

// ── Confirm & Launch ───────────────────────────────────────────────────────
const selectedTemplate = templates.find((t) => t.value === template);
console.log();
console.log(
  boxen(
    `${chalk.bold.white("Ready to scaffold your project!")}\n\n` +
      `  ${chalk.gray("Project:")}   ${chalk.cyan(projectName)}\n` +
      `  ${chalk.gray("Template:")}  ${chalk.cyan(selectedTemplate?.short || template)}\n` +
      `  ${chalk.gray("Platform:")}  ${chalk.cyan(platform === "web" ? "Next.js Web App" : "Expo Mobile App")}\n` +
      `  ${chalk.gray("Features:")}  ${chalk.cyan(features.join(", ") || "none")}`,
    { padding: 1, borderStyle: "round", borderColor: "cyan", margin: { top: 0, bottom: 0 } }
  )
);
console.log();

const { confirmed } = await inquirer.prompt([
  {
    type: "confirm",
    name: "confirmed",
    message: chalk.cyan.bold("Launch scaffold?"),
    default: true,
  },
]);

if (!confirmed) {
  console.log(chalk.yellow("\n  Aborted. Run vibecodex again whenever you're ready! 👋\n"));
  process.exit(0);
}

await run({
  projectName: projectName.trim(),
  platform,
  template,
  features,
  ...creds,
});
