#!/usr/bin/env node

import inquirer from "inquirer";
import figlet from "figlet";
import gradient from "gradient-string";
import boxen from "boxen";
import chalk from "chalk";
import { run } from "../src/run.js";

// ── Banner ───────────────────────────────
console.clear();
const banner = figlet.textSync("VIBECODEX", { font: "ANSI Shadow" });

console.log(
  gradient(["#a855f7", "#6366f1", "#3b82f6"]).multiline(banner)
);

console.log(
  boxen(
    chalk.bold.white("Full-Stack App Generator\n") +
      chalk.gray("Next.js · Expo · Supabase · GitHub · Vercel"),
    {
      padding: 1,
      borderStyle: "round",
      borderColor: "magenta",
      textAlignment: "center",
    }
  )
);

console.log();

// ── Required ─────────────────────────────
const answers = await inquirer.prompt([
  {
    type: "input",
    name: "projectName",
    message: chalk.cyan("Project name:"),
    validate: (v) => (v.trim() ? true : "Required"),
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

  // ── Supabase ───────────────────────────
  {
    type: "confirm",
    name: "useSupabase",
    message: chalk.cyan("Create Supabase project automatically?"),
    default: false,
  },
  {
    type: "password",
    name: "supabaseToken",
    message: chalk.cyan("Supabase Access Token:"),
    mask: "●",
    when: (a) => a.useSupabase,
    validate: (v) => (v.trim() ? true : "Required"),
  },
  {
    type: "input",
    name: "supabaseOrgId",
    message: chalk.cyan("Supabase Org ID:"),
    when: (a) => a.useSupabase,
    validate: (v) => (v.trim() ? true : "Required"),
  },

  // ── GitHub ─────────────────────────────
  {
    type: "confirm",
    name: "useGithub",
    message: chalk.cyan("Create GitHub repo & push code?"),
    default: false,
  },
  {
    type: "input",
    name: "githubUsername",
    message: chalk.cyan("GitHub username:"),
    when: (a) => a.useGithub,
    validate: (v) => (v.trim() ? true : "Required"),
  },
  {
    type: "password",
    name: "githubToken",
    message: chalk.cyan("GitHub Token:"),
    mask: "●",
    when: (a) => a.useGithub,
    validate: (v) => (v.trim() ? true : "Required"),
  },

  // ── Vercel ─────────────────────────────
  {
    type: "confirm",
    name: "deployVercel",
    message: chalk.cyan("Deploy to Vercel?"),
    default: false,
    when: (a) => a.platform === "web",
  },
  {
    type: "password",
    name: "vercelToken",
    message: chalk.cyan("Vercel Token:"),
    mask: "●",
    when: (a) => a.deployVercel,
    validate: (v) => (v.trim() ? true : "Required"),
  },
]);

// Dependency Guard
if (answers.deployVercel && !answers.useGithub) {
  console.log(
    chalk.red("\n❌ Vercel deployment requires a GitHub repository.\n")
  );
  process.exit(1);
}

await run(answers);