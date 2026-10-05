// GET /api/people
// Returns the staff list from Entra ID (Microsoft Graph) in the shape the People Finder page expects:
//   [{ id, name, title, dept, office, mail, upn, mgr }]
// Uses app-only access (client credentials) with the Graph application permissions:
//   User.Read.All          – read users and their managers
//   GroupMember.Read.All   – read the members of the "hide from People Finder" group (only needed if HIDDEN_GROUP_ID is set)
//
// Who is left out:
//   - disabled accounts
//   - guests (userType Guest, or #EXT# in the sign-in name)
//   - partner and system accounts whose sign-in name, email or display name starts with a prefix in EXCLUDE_PREFIXES (default "_" and "PTR_")
//   - anyone in the HIDDEN_GROUP_ID group, including members of nested groups
//   - accounts with no job title (unless REQUIRE_JOB_TITLE=false)
//   - optional department and sign-in-name filters below

const { app } = require("@azure/functions");

const TENANT_ID = process.env.TENANT_ID;
const CLIENT_ID = process.env.AAD_CLIENT_ID;
const CLIENT_SECRET = process.env.AAD_CLIENT_SECRET;
const CACHE_MINUTES = Number(process.env.CACHE_MINUTES || 60);
const HIDDEN_GROUP_ID = (process.env.HIDDEN_GROUP_ID || "").trim();
const list = v => (v || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
// Comma-separated prefixes; matched against the start of the sign-in name, email address and display name, ignoring case
const EXCLUDE_PREFIXES = list(process.env.EXCLUDE_PREFIXES ?? "_,PTR_");
const REQUIRE_JOB_TITLE = (process.env.REQUIRE_JOB_TITLE || "true").toLowerCase() !== "false";
const EXCLUDE_DEPARTMENTS = list(process.env.EXCLUDE_DEPARTMENTS);
const EXCLUDE_UPN_CONTAINS = list(process.env.EXCLUDE_UPN_CONTAINS);

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

// Follows every page of a Graph list and waits when Graph asks it to slow down
async function getAll(token, url, what) {
  const items = [];
  let tries = 0;
  while (url) {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (r.status === 429 && tries++ < 5) {
      const wait = Number(r.headers.get("Retry-After") || 5);
      await new Promise(res => setTimeout(res, wait * 1000));
      continue;
    }
    if (!r.ok) throw new Error(`Graph request for ${what} failed (${r.status}): ${await r.text()}`);
    const page = await r.json();
    items.push(...page.value);
    url = page["@odata.nextLink"] || null;
  }
  return items;
}

const getUsers = token => getAll(token,
  "https://graph.microsoft.com/v1.0/users?$select=id,displayName,jobTitle,department,officeLocation,mail,userPrincipalName,accountEnabled,userType&$expand=manager($select=id)&$top=100",
  "users");

// If the hidden group is set but can't be read, this throws, so hidden people are never shown by mistake
async function getHiddenIds(token) {
  if (!HIDDEN_GROUP_ID) return new Set();
  const members = await getAll(token,
    `https://graph.microsoft.com/v1.0/groups/${encodeURIComponent(HIDDEN_GROUP_ID)}/transitiveMembers/microsoft.graph.user?$select=id&$top=999`,
    "the hidden group");
  return new Set(members.map(m => m.id));
}

const startsWithPrefix = u => {
  const names = [u.userPrincipalName, u.mail, u.displayName].map(s => (s || "").toLowerCase());
  return EXCLUDE_PREFIXES.some(p => names.some(n => n.startsWith(p)));
};

function shape(users, hidden) {
  const byId = new Map(users.map(u => [u.id, u]));
  const keep = users.filter(u => {
    const upn = (u.userPrincipalName || "").toLowerCase();
    if (u.accountEnabled === false) return false;
    if (u.userType === "Guest" || upn.includes("#ext#")) return false;
    if (hidden.has(u.id)) return false;
    if (startsWithPrefix(u)) return false;
    if (REQUIRE_JOB_TITLE && !u.jobTitle) return false;
    if (u.department && EXCLUDE_DEPARTMENTS.includes(u.department.toLowerCase())) return false;
    if (EXCLUDE_UPN_CONTAINS.some(f => upn.includes(f))) return false;
    return true;
  });
  const ids = new Set(keep.map(u => u.id));

  // Work out who each person reports to in the chart.
  // If their manager is in the hidden group, skip up to the next manager who is shown, so the chart has no gap that points to a hidden person.
  // If their manager is left out for any other reason (disabled, no job title), show no manager, so the data problem is visible and gets fixed.
  const managerFor = u => {
    let m = u.manager?.id, steps = 0;
    while (m && !ids.has(m) && hidden.has(m) && steps++ < 20) m = byId.get(m)?.manager?.id;
    return m && ids.has(m) && m !== u.id ? m : null;
  };

  return keep.map(u => ({
    id: u.id,
    name: u.displayName || u.userPrincipalName,
    title: u.jobTitle || "",
    dept: u.department || "",
    office: u.officeLocation || "",
    mail: u.mail || "",
    upn: u.userPrincipalName || "",
    mgr: managerFor(u),
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
        const [users, hidden] = await Promise.all([getUsers(token), getHiddenIds(token)]);
        cache = { at: Date.now(), data: shape(users, hidden) };
        context.log(`People Finder: ${cache.data.length} people shown, ${hidden.size} in the hidden group`);
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
