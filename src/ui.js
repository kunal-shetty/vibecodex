import figlet from "figlet";
import gradient from "gradient-string";
import boxen from "boxen";
import chalk from "chalk";

export async function showWelcomeBanner() {
  console.clear();

  const banner = figlet.textSync("VIBECODEX", { font: "ANSI Shadow" });

  // Animated color sweep
  const palettes = [
    ["#ff006e", "#fb5607", "#ffbe0b", "#8338ec", "#3a86ff"],
    ["#f72585", "#7209b7", "#3a0ca3", "#4361ee", "#4cc9f0"],
    ["#06d6a0", "#118ab2", "#073b4c", "#ffd166", "#ef476f"],
  ];

  for (let i = 0; i < 12; i++) {
    console.clear();
    const palette = palettes[i % palettes.length];
    const shifted = [...palette.slice(i % palette.length), ...palette.slice(0, i % palette.length)];
    console.log(gradient(shifted).multiline(banner));
    await new Promise((r) => setTimeout(r, 70));
  }

  // Final state
  console.clear();
  console.log(gradient(["#a855f7", "#6366f1", "#3b82f6", "#06b6d4"]).multiline(banner));

  const version = chalk.gray("v4.0.0");
  const tagline =
    chalk.bold.white("Full-Stack App Generator\n") +
    chalk.gray("Next.js · Expo · Supabase · GitHub · Vercel\n\n") +
    chalk.dim("8 web templates · 6 mobile templates · modular features");

  console.log(
    boxen(tagline, {
      padding: { top: 1, bottom: 1, left: 3, right: 3 },
      borderStyle: "double",
      borderColor: "magenta",
      textAlignment: "center",
    })
  );
  console.log();
}

export function printStep(step, total, message) {
  const bar = chalk.magenta("█".repeat(step)) + chalk.gray("░".repeat(total - step));
  console.log(`\n  ${chalk.bold.cyan(`[${step}/${total}]`)} ${bar}  ${chalk.white(message)}`);
}

export function printSuccess(message) {
  console.log(`  ${chalk.green("✔")} ${chalk.white(message)}`);
}

export function printError(message) {
  console.log(`  ${chalk.red("✘")} ${chalk.white(message)}`);
}

export function printInfo(message) {
  console.log(`  ${chalk.blue("ℹ")} ${chalk.gray(message)}`);
}

export function printSummary({ projectName, platform, template, liveUrl, repoUrl, projectPath }) {
  const devNote =
    platform === "web"
      ? `  ${chalk.green("✔")} ${chalk.white("Dev server running")} ${chalk.gray("—")} ${chalk.cyan.underline("http://localhost:3000")}\n`
      : `  ${chalk.green("✔")} ${chalk.white("Expo server running")} ${chalk.gray("—")} ${chalk.cyan("scan the QR code with Expo Go")}\n`;

  console.log();
  console.log(
    boxen(
      `${chalk.bold.green("🎉 Project scaffolded successfully!")}\n\n` +
        `  ${chalk.gray("Name:")}     ${chalk.cyan.bold(projectName)}\n` +
        `  ${chalk.gray("Template:")} ${chalk.cyan(template)}\n` +
        `  ${chalk.gray("Path:")}     ${chalk.cyan(projectPath)}\n` +
        (repoUrl ? `  ${chalk.gray("Repo:")}     ${chalk.cyan.underline(repoUrl)}\n` : "") +
        (liveUrl ? `  ${chalk.gray("Live URL:")} ${chalk.cyan.underline(liveUrl)}\n` : "") +
        `\n` +
        devNote,
      {
        padding: 1,
        borderStyle: "round",
        borderColor: "green",
        margin: { top: 1, bottom: 1 },
      }
    )
  );
}
