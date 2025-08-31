export async function safeJson(url, opts={}) {
  try {
    const r = await fetch(url, opts);
    const ct = r.headers.get("content-type") || "";
    if (ct.includes("application/json")) return await r.json();
    const t = await r.text();
    try { return JSON.parse(t); } catch { return { ok:false, error:"non-JSON", raw:t, status:r.status }; }
  } catch (e) { return { ok:false, error:String(e?.message||e) }; }
}

export const clamp = (x,min,max)=>Math.max(min,Math.min(max,x));
export const pick = (obj, keys)=>Object.fromEntries(keys.filter(k=>k in obj).map(k=>[k,obj[k]]));

export const canon = s => (s||"").toLowerCase().replace(/[^a-z0-9]+/g,'').trim();

export function impliedProb(oddsDecimal) {
  const o = Number(oddsDecimal||0);
  return o>1 ? 1/o : 0;
}

export function toFixed2(n) { return Number.isFinite(n) ? Number(n.toFixed(2)) : 0; }
