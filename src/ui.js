import ora from "ora";
import chalk from "chalk";
import gradient from "gradient-string";

let spinner = null;
let intervalId = null;

const messages = [
  "Fetching dependencies...",
  "Brewing your app...",
  "Compiling bytes...",
  "Downloading the internet...",
  "Running generators...",
  "Almost there..."
];

export function start(msg, animated = false) {
  spinner = ora({ 
    text: chalk.hex("#c4b5fd")(msg), 
    spinner: "dots12", // sleek spinner
    color: "magenta" 
  }).start();

  if (animated) {
    let i = 0;
    intervalId = setInterval(() => {
      if (spinner) {
        spinner.text = chalk.hex("#c4b5fd")(messages[i % messages.length]);
        i++;
      }
    }, 2000);
  }
}

export function succeed(msg) {
  if (intervalId) clearInterval(intervalId);
  // remove emoji, use a clean distinct mark
  spinner?.succeed(chalk.hex("#86efac")("✓ " + msg));
  spinner = null;
}

export function fail(msg) {
  if (intervalId) clearInterval(intervalId);
  spinner?.fail(chalk.hex("#fca5a5")("✕ " + msg));
  spinner = null;
}

export function warn(msg) {
  if (intervalId) clearInterval(intervalId);
  spinner?.warn(chalk.hex("#fde68a")("⚠ " + msg));
  spinner = null;
}

export function info(msg) {
  console.log(chalk.hex("#60a5fa")(`  · ${msg}`));
}

export function dim(msg) {
  console.log(chalk.gray(`    ${msg}`));
}

export function section(msg) {
  console.log(gradient(["#a855f7","#3b82f6"])(`\n  ◆ ${msg}`));
}

export function done(lines) {
  console.log();
  console.log(gradient(["#a855f7","#34d399"])("  ✦ Initialization complete! Summary:\n"));
  for (const [k, v] of Object.entries(lines)) {
    console.log(`  ${chalk.bold.white(k.padEnd(14))} ${chalk.hex("#a78bfa")(v)}`);
  }
  console.log();
}
