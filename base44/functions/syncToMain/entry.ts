/**
 * syncToMain — pushes current app source files to the `main` branch on GitHub.
 * Admin-only.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const REPO = "Mr-Banjoko/learn-with-cody";
const TARGET_BRANCH = "main";

const FILES_TO_SYNC = [
  "src/App.jsx",
  "src/index.css",
  "src/pages/Games.jsx",
  "src/lib/content.js",
  "src/lib/shortAWords.js",
  "src/lib/letterPaths.js",
  "src/lib/useAudio.js",
  "src/lib/letterSounds.js",
  "src/components/write/WriteGame.jsx",
  "src/components/write/WriteShortA.jsx",
  "src/components/write/LetterTracer.jsx",
  "src/components/AppShell.jsx",
];

async function getFileSha(token, path, branch) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${path}?ref=${branch}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha || null;
}

async function upsertFileText(token, path, textContent, branch) {
  const base64 = btoa(unescape(encodeURIComponent(textContent)));
  const sha = await getFileSha(token, path, branch);
  const body = {
    message: `sync: update ${path}`,
    content: base64,
    branch,
  };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Failed to upsert ${path}: ${JSON.stringify(data)}`);
  return data;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { payload } = await req.json().catch(() => ({ payload: {} }));
    const filesToSync = (payload && payload.files) ? payload.files : FILES_TO_SYNC;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("github");

    const results = [];
    for (const [path, content] of Object.entries(filesToSync)) {
      if (typeof content === "string") {
        await upsertFileText(accessToken, path, content, TARGET_BRANCH);
        results.push({ path, status: "synced" });
      }
    }

    return Response.json({ success: true, branch: TARGET_BRANCH, files: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});