import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export const TEMPLATES_ROOT = path.resolve(__dirname, "../templates");

export function slug(name) {
  return name.toLowerCase().trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function retry(fn, times = 3, wait = 3000) {
  for (let i = 1; i <= times; i++) {
    try { return await fn(); }
    catch (err) {
      if (i === times) throw err;
      await delay(wait * i);
    }
  }
}
