import { retry, sleep } from "../utils.js";

const API = "https://api.vercel.com";

export async function deployFromGitHub(vercelToken, githubUsername, repoName, envVars = {}) {
  const headers = {
    Authorization: `Bearer ${vercelToken}`,
    "Content-Type": "application/json",
  };

  // 1. Create Vercel project linked to GitHub repo
  const projectRes = await retry(async () => {
    const r = await fetch(`${API}/v10/projects`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: repoName,
        framework: "nextjs",
        gitRepository: {
          type: "github",
          repo: `${githubUsername}/${repoName}`,
        },
      }),
    });
    const data = await r.json();
    if (!r.ok && data.error?.code !== "project_already_exists") {
      throw new Error(data.error?.message || "Vercel project creation failed");
    }
    return data;
  });

  const projectId = projectRes.id || projectRes.project?.id;

  // 2. Set environment variables
  if (projectId && Object.keys(envVars).length > 0) {
    const envPayload = Object.entries(envVars).map(([key, value]) => ({
      key,
      value,
      type: "encrypted",
      target: ["production", "preview", "development"],
    }));

    await fetch(`${API}/v10/projects/${projectId}/env`, {
      method: "POST",
      headers,
      body: JSON.stringify(envPayload),
    });
  }

  // 3. Trigger deployment
  const deployRes = await retry(async () => {
    const r = await fetch(`${API}/v13/deployments`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: repoName,
        gitSource: {
          type: "github",
          repo: `${githubUsername}/${repoName}`,
          ref: "main",
        },
        projectSettings: { framework: "nextjs" },
      }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error?.message || "Deployment trigger failed");
    return data;
  });

  // 4. Poll until ready (max 5 minutes)
  const deploymentId = deployRes.id;
  let liveUrl = null;

  for (let i = 0; i < 60; i++) {
    await sleep(5000);
    const r = await fetch(`${API}/v13/deployments/${deploymentId}`, { headers });
    const data = await r.json();

    if (data.readyState === "READY") {
      liveUrl = `https://${data.url}`;
      break;
    }
    if (data.readyState === "ERROR" || data.readyState === "CANCELED") {
      throw new Error("Vercel deployment failed. Check vercel.com dashboard for details.");
    }
  }

  return liveUrl || `https://${repoName}.vercel.app`;
}
