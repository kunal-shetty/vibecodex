import { retry, sleep } from "../utils.js";

const API = "https://api.supabase.com";

export async function createProject(token, orgId, projectName) {
  const dbPassword = generateDbPassword();

  const project = await retry(async () => {
    const r = await fetch(`${API}/v1/projects`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        organization_id: orgId,
        db_pass: dbPassword,
        region: "us-east-1",
        plan: "free",
      }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || "Supabase project creation failed");
    return data;
  });

  // Wait for project to become active (can take 30-90 seconds)
  let projectRef = project.ref || project.id;
  let apiUrl = null;
  let anonKey = null;

  for (let i = 0; i < 24; i++) {
    await sleep(5000);
    try {
      const r = await fetch(`${API}/v1/projects/${projectRef}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (data.status === "ACTIVE_HEALTHY") {
        apiUrl = `https://${projectRef}.supabase.co`;
        // Fetch API keys
        const keysRes = await fetch(`${API}/v1/projects/${projectRef}/api-keys`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const keys = await keysRes.json();
        anonKey = keys.find?.((k) => k.name === "anon")?.api_key || keys.anon;
        break;
      }
    } catch {
      // still booting, continue polling
    }
  }

  return {
    projectRef,
    apiUrl: apiUrl || `https://${projectRef}.supabase.co`,
    anonKey: anonKey || "",
    dbPassword,
  };
}

function generateDbPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  return Array.from({ length: 24 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
