import { execa } from "execa";
import { retry } from "../utils.js";

export async function createAndPush(projectPath, name, username, token) {
  // 1. Init + first commit
  await execa("git", ["init"], { cwd: projectPath });
  await execa("git", ["add", "."], { cwd: projectPath });
  await execa("git", ["commit", "-m", "🚀 Initial commit — scaffolded by VibeCodex"], {
    cwd: projectPath,
  });

  // 2. Create private GitHub repo
  await retry(async () => {
    const res = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "vibecodex-cli",
      },
      body: JSON.stringify({
        name,
        private: true,
        auto_init: false,
        description: "Scaffolded by VibeCodex ⚡",
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      if (err.errors?.[0]?.message?.includes("already exists")) return;
      throw new Error(err.message || "GitHub API error");
    }
  });

  // 3. Push (token embedded, cleaned after)
  const remoteWithToken = `https://${username}:${token}@github.com/${username}/${name}.git`;
  const cleanRemote = `https://github.com/${username}/${name}.git`;

  await execa("git", ["remote", "add", "origin", remoteWithToken], { cwd: projectPath });
  await execa("git", ["branch", "-M", "main"], { cwd: projectPath });
  await execa("git", ["push", "-u", "origin", "main"], { cwd: projectPath });
  await execa("git", ["remote", "set-url", "origin", cleanRemote], { cwd: projectPath });

  return cleanRemote;
}

export async function deleteRepo(username, repoName, token) {
  const res = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
    method: "DELETE",
    headers: {
      Authorization: `token ${token}`,
      "User-Agent": "vibecodex-cli",
    },
  });
  return res.ok || res.status === 404;
}
