#!/usr/bin/env node

import inquirer from "inquirer";
import figlet from "figlet";
import gradient from "gradient-string";
import boxen from "boxen";
import chalk from "chalk";
import { run } from "../src/run.js";

// ── Banner ────────────────────────────────────────────────────────────────
console.clear();
const banner = figlet.textSync("VIBECODEX", { font: "ANSI Shadow" });

// Animated ASCII rendering
const colors = ["#a855f7", "#6366f1", "#3b82f6", "#14b8a6", "#f43f5e", "#ec4899", "#a855f7"];
for (let i = 0; i < 15; i++) {
  console.clear();
  const shift = [...colors.slice(i % colors.length), ...colors.slice(0, i % colors.length)];
  console.log(gradient(shift).multiline(banner));
  await new Promise(r => setTimeout(r, 80));
}
console.clear();
console.log(gradient(["#a855f7", "#6366f1", "#3b82f6"]).multiline(banner));

console.log(
  boxen(
    chalk.bold.white("Full-Stack App Generator\n") +
      chalk.gray("Next.js · Expo · Supabase · GitHub · Vercel"),
    { padding: 1, borderStyle: "round", borderColor: "magenta", textAlignment: "center" }
  )
);
console.log();

// ── Prompts ───────────────────────────────────────────────────────────────
const answers = await inquirer.prompt([
  {
    type: "input",
    name: "projectName",
    message: chalk.cyan("Project name:"),
    validate: (v) => v.trim() ? true : "Required",
  },
  {
    type: "list",
    name: "platform",
    message: chalk.cyan("What are you building?"),
    choices: [
      { name: "Next.js Web App", value: "web" },
      { name: "Expo Mobile App", value: "mobile" },
    ],
  },

  // ── Supabase credentials ──────────────────────────────────────────────
  {
    type: "password",
    name: "supabaseToken",
    message: chalk.cyan("Supabase Access Token") + chalk.gray(" (supabase.com/dashboard/account/tokens):"),
    mask: "●",
    validate: (v) => v.trim() ? true : "Required",
  },
  {
    type: "input",
    name: "supabaseOrgId",
    message: chalk.cyan("Supabase Org ID") + chalk.gray(" (supabase.com/dashboard/org → Settings → General):"),
    validate: (v) => v.trim() ? true : "Required",
  },

  // ── GitHub ────────────────────────────────────────────────────────────
  {
    type: "input",
    name: "githubUsername",
    message: chalk.cyan("GitHub username:"),
    validate: (v) => v.trim() ? true : "Required",
  },
  {
    type: "password",
    name: "githubToken",
    message: chalk.cyan("GitHub Token") + chalk.gray(" (github.com/settings/tokens — needs repo + delete_repo scope):"),
    mask: "●",
    validate: (v) => v.trim() ? true : "Required",
  },

  // ── Vercel (web only) ─────────────────────────────────────────────────
  {
    type: "confirm",
    name: "deployVercel",
    message: chalk.cyan("Deploy to Vercel?"),
    default: true,
    when: (a) => a.platform === "web",
  },
  {
    type: "password",
    name: "vercelToken",
    message: chalk.cyan("Vercel Token") + chalk.gray(" (vercel.com/account/tokens):"),
    mask: "●",
    when: (a) => a.platform === "web" && a.deployVercel,
    validate: (v) => v.trim() ? true : "Required",
  },
]);

await run(answers);
