/**
 * syncToMain — pushes current app source files to the `main` branch on GitHub.
 * Admin-only.
 *
 * Expects payload: { files: { "github/path": "file content string", ... } }
 * The frontend reads file contents and sends them here for GitHub upsert.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const REPO = "Mr-Banjoko/learn-with-cody";
const TARGET_BRANCH = "main";

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

    const body = await req.json().catch(() => ({}));
    const files = body?.files;

    if (!files || typeof files !== "object" || Array.isArray(files)) {
      return Response.json(
        { error: "Missing payload. Expected: { files: { 'path': 'content', ... } }" },
        { status: 400 }
      );
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("github");

    const results = [];
    const errors = [];

    for (const [ghPath, content] of Object.entries(files)) {
      if (typeof content !== "string") {
        errors.push({ path: ghPath, error: "content is not a string" });
        continue;
      }
      try {
        await upsertFileText(accessToken, ghPath, content, TARGET_BRANCH);
        results.push({ path: ghPath, status: "synced" });
      } catch (err) {
        errors.push({ path: ghPath, error: err.message });
      }
    }

    return Response.json({ success: true, branch: TARGET_BRANCH, files: results, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});