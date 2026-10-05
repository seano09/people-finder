// GET /api/people
// Returns the staff list from Entra ID (Microsoft Graph) in the shape the People Finder page expects:
//   [{ id, name, title, dept, office, mail, upn, mgr }]
// Uses app-only access (client credentials) with the Graph application permission User.Read.All.

const { app } = require("@azure/functions");

const TENANT_ID = process.env.TENANT_ID;
const CLIENT_ID = process.env.AAD_CLIENT_ID;
const CLIENT_SECRET = process.env.AAD_CLIENT_SECRET;
const CACHE_MINUTES = Number(process.env.CACHE_MINUTES || 60);
// Only include people with a job title (filters out most service accounts and shared mailboxes). Set to "false" to include everyone.
const REQUIRE_JOB_TITLE = (process.env.REQUIRE_JOB_TITLE || "true").toLowerCase() !== "false";
// Optional comma-separated list of departments to leave out, e.g. "Resources,Test"
const EXCLUDE_DEPARTMENTS = (process.env.EXCLUDE_DEPARTMENTS || "")
  .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
// Optional comma-separated list of UPN fragments to leave out, e.g. "svc-,room-,noreply"
const EXCLUDE_UPN_CONTAINS = (process.env.EXCLUDE_UPN_CONTAINS || "")
  .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

let cache = { at: 0, data: null };

async function getToken() {
  const missing = ["TENANT_ID", "AAD_CLIENT_ID", "AAD_CLIENT_SECRET"].filter(k => !process.env[k]);
  if (missing.length) throw new Error(`Missing environment variable(s): ${missing.join(", ")}`);
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });
  const r = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, { method: "POST", body });
  if (!r.ok) throw new Error(`Token request failed (${r.status}): ${await r.text()}`);
  return (await r.json()).access_token;
}

async function getAllUsers(token) {
  const select = "id,displayName,jobTitle,department,officeLocation,mail,userPrincipalName,accountEnabled,userType";
  let url = `https://graph.microsoft.com/v1.0/users?$select=${select}&$expand=manager($select=id)&$top=100`;
  const users = [];
  while (url) {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (r.status === 429) {
      const wait = Number(r.headers.get("Retry-After") || 5);
      await new Promise(res => setTimeout(res, wait * 1000));
      continue;
    }
    if (!r.ok) throw new Error(`Graph request failed (${r.status}): ${await r.text()}`);
    const page = await r.json();
    users.push(...page.value);
    url = page["@odata.nextLink"] || null;
  }
  return users;
}

function shape(users) {
  const keep = users.filter(u => {
    if (u.accountEnabled === false) return false;
    if (u.userType === "Guest") return false;
    if (REQUIRE_JOB_TITLE && !u.jobTitle) return false;
    if (u.department && EXCLUDE_DEPARTMENTS.includes(u.department.toLowerCase())) return false;
    const upn = (u.userPrincipalName || "").toLowerCase();
    if (EXCLUDE_UPN_CONTAINS.some(f => upn.includes(f))) return false;
    return true;
  });
  const ids = new Set(keep.map(u => u.id));
  return keep.map(u => ({
    id: u.id,
    name: u.displayName || u.userPrincipalName,
    title: u.jobTitle || "",
    dept: u.department || "",
    office: u.officeLocation || "",
    mail: u.mail || "",
    upn: u.userPrincipalName || "",
    // A manager who has been filtered out (disabled, no job title) is dropped so the chart stays connected to real people
    mgr: u.manager && ids.has(u.manager.id) ? u.manager.id : null,
  }));
}

app.http("people", {
  methods: ["GET"],
  authLevel: "anonymous", // Access is enforced by Static Web Apps sign-in (see staticwebapp.config.json)
  handler: async (request, context) => {
    // Defence in depth: Static Web Apps adds this header only for signed-in users
    if (!request.headers.get("x-ms-client-principal")) {
      return { status: 401, jsonBody: { error: "Sign in required" } };
    }
    try {
      if (!cache.data || Date.now() - cache.at > CACHE_MINUTES * 60000) {
        const token = await getToken();
        cache = { at: Date.now(), data: shape(await getAllUsers(token)) };
        context.log(`People Finder: loaded ${cache.data.length} people from Graph`);
      }
      return {
        status: 200,
        headers: { "Cache-Control": "private, max-age=300" },
        jsonBody: cache.data,
      };
    } catch (err) {
      context.error(err);
      // The detail helps diagnose set-up problems (missing settings, consent not granted). It never contains the secret or token.
      return { status: 502, jsonBody: { error: "Could not load the staff list", detail: String(err.message).slice(0, 600) } };
    }
  },
});
