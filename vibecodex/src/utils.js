import chalk from "chalk";

/**
 * Retry an async function up to `times` times with exponential backoff.
 */
export async function retry(fn, times = 3, delayMs = 1500) {
  let lastErr;
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < times - 1) {
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
      }
    }
  }
  throw lastErr;
}

/**
 * Sleep for ms milliseconds.
 */
export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Convert a project name to a valid slug.
 */
export function toSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-");
}

/**
 * Generate a random password-safe string (for Supabase DB passwords etc.)
 */
export function generateSecret(length = 32) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/**
 * Print a JSON response for debugging (gated behind DEBUG env var).
 */
export function debugLog(label, data) {
  if (process.env.DEBUG) {
    console.log(chalk.dim(`\n[debug] ${label}:`), JSON.stringify(data, null, 2));
  }
}
