import { retry } from "../utils.js";

const API = "https://api.vercel.com";

export async function deployFromGitHub(
  vercelToken,
  githubUsername,
  repoName,
  envVars = {}
) {
  const headers = {
    Authorization: `Bearer ${vercelToken}`,
    "Content-Type": "application/json",
  };

  let projectId;

  // 1️⃣ Create or get existing project
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

    // If project already exists, fetch it
    if (!r.ok) {
      if (data.error?.code === "project_already_exists") {
        return { alreadyExists: true };
      }
      throw new Error(data.error?.message || "Vercel project creation failed");
    }

    return data;
  });

  // 2️⃣ Resolve project ID
  if (projectRes.id) {
    projectId = projectRes.id;
  } else {
    // Fetch existing project
    const existing = await fetch(`${API}/v9/projects/${repoName}`, {
      headers,
    });

    if (!existing.ok) {
      throw new Error("Failed to fetch existing Vercel project");
    }

    const existingData = await existing.json();
    projectId = existingData.id;
  }

  if (!projectId) {
    throw new Error("Could not resolve Vercel project ID");
  }

  // 3️⃣ Add environment variables (if any)
  if (Object.keys(envVars).length > 0) {
    const envPayload = Object.entries(envVars).map(([key, value]) => ({
      key,
      value,
      type: "encrypted",
      target: ["production", "preview", "development"],
    }));

    const envRes = await fetch(
      `${API}/v10/projects/${projectId}/env`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(envPayload),
      }
    );

    if (!envRes.ok) {
      const err = await envRes.json();
      throw new Error(err.error?.message || "Failed to set environment variables");
    }
  }

  // 4️⃣ Trigger deployment (linked to project)
  const deployRes = await retry(async () => {
    const r = await fetch(`${API}/v13/deployments`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: repoName,
        project: projectId, // 🔥 IMPORTANT FIX
        gitSource: {
          type: "github",
          repo: `${githubUsername}/${repoName}`,
          ref: "main",
        },
      }),
    });

    const data = await r.json();

    if (!r.ok) {
      throw new Error(data.error?.message || "Deployment failed");
    }

    return data;
  });

  const deploymentId = deployRes.id;
  if (!deploymentId) {
    throw new Error("Deployment ID missing from Vercel response");
  }

  // 5️⃣ Poll until deployment is ready
  let liveUrl = null;

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 5000));

    const r = await fetch(`${API}/v13/deployments/${deploymentId}`, {
      headers,
    });

    if (!r.ok) {
      throw new Error("Failed to fetch deployment status");
    }

    const data = await r.json();

    if (data.readyState === "READY") {
      liveUrl = `https://${data.url}`;
      break;
    }

    if (data.readyState === "ERROR") {
      throw new Error(
        "Vercel deployment errored. Check Vercel dashboard."
      );
    }
  }

  return liveUrl || `https://${repoName}.vercel.app`;
}