const U = process.env.UPSTASH_REDIS_REST_URL || process.env.upstash_redis_rest_url || "";
const UT = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const KURL = process.env.KV_REST_API_URL || "";
const KTOK = process.env.KV_REST_API_TOKEN || "";

async function upstashGet(key) {
  if (!U || !UT) return null;
  const r = await fetch(`${U}/get/${encodeURIComponent(key)}`, { headers:{ Authorization:`Bearer ${UT}` }});
  const j = await r.json().catch(()=>null);
  return j?.result ?? null;
}
async function upstashSet(key, value, ttlSec) {
  if (!U || !UT) return false;
  const url = ttlSec ? `${U}/set/${encodeURIComponent(key)}?EX=${ttlSec}` : `${U}/set/${encodeURIComponent(key)}`;
  const r = await fetch(url, { method:"POST", headers:{ Authorization:`Bearer ${UT}`, "Content-Type":"application/json" }, body: JSON.stringify(value) });
  return r.ok;
}
async function vercelGet(key) {
  if (!KURL || !KTOK) return null;
  const r = await fetch(`${KURL}/get/${encodeURIComponent(key)}`, { headers:{ Authorization:`Bearer ${KTOK}` }});
  const j = await r.json().catch(()=>null);
  return j?.result ?? null;
}
async function vercelSet(key, value, ttlSec) {
  if (!KURL || !KTOK) return false;
  const url = ttlSec ? `${KURL}/set/${encodeURIComponent(key)}?EX=${ttlSec}` : `${KURL}/set/${encodeURIComponent(key)}`;
  const r = await fetch(url, { method:"POST", headers:{ Authorization:`Bearer ${KTOK}`, "Content-Type":"application/json" }, body: JSON.stringify(value) });
  return r.ok;
}

export async function kvGet(key) {
  const a = await upstashGet(key); if (a!==null) return parseMaybe(a);
  const b = await vercelGet(key); if (b!==null) return parseMaybe(b);
  return null;
}
export async function kvSet(key, value, ttlSec) {
  const v = JSON.stringify(value);
  const ok1 = await upstashSet(key, v, ttlSec);
  const ok2 = await vercelSet(key, v, ttlSec);
  return ok1 || ok2;
}
function parseMaybe(x) { try { return JSON.parse(x); } catch { return x; } }
