import { delay, retry } from "../utils.js";

const API = "https://api.supabase.com/v1";

export async function createSupabaseProject(token, orgId, name) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // 1. Create project
  const createRes = await retry(async () => {
    const r = await fetch(`${API}/projects`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name,
        organization_id: orgId,
        region: "ap-south-1",
        db_pass: genPassword(),
        plan: "free",
      }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || "Supabase API error");
    return data;
  });

  const projectRef = createRes.ref || createRes.id;

  // 2. Poll until ACTIVE_HEALTHY (can take 30–90s)
  for (let i = 0; i < 40; i++) {
    await delay(4000);
    const r = await fetch(`${API}/projects/${projectRef}`, { headers });
    const data = await r.json();
    if (data.status === "ACTIVE_HEALTHY") break;
    if (i === 39) throw new Error("Supabase project took too long. Check dashboard.");
  }

  // 3. Get anon key
  const keysRes = await fetch(`${API}/projects/${projectRef}/api-keys`, { headers });
  const keys = await keysRes.json();
  const anonKey = Array.isArray(keys)
    ? keys.find((k) => k.name === "anon")?.api_key
    : null;

  return {
    url: `https://${projectRef}.supabase.co`,
    anonKey: anonKey || "",
    ref: projectRef,
  };
}

function genPassword() {
  const c = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
  return Array.from({ length: 24 }, () => c[Math.floor(Math.random() * c.length)]).join("");
}
