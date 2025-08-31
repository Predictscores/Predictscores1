import { kvGet, kvSet } from "@/lib/kv";
import { CFG, TRUSTED } from "./config";
import { canon } from "@/lib/util";

/** Keš ključ za poslednje kvote */
const KKEY = "odds:last";

export async function getCachedOdds() {
  const j = await kvGet(KKEY);
  if (j && (Date.now() - (j.ts||0) < 10*60*1000)) return j.data || {};
  return {};
}

export async function refreshOddsForDate(ymd) {
  // Prefer The Odds API ako postoji ključ → ostavljeno za kasnije. Ovde koristimo API-Football /odds sa pagingom.
  const data = {};
  let page = 1, grabbed = 0;
  while (page <= CFG.oddsBatchMaxPages) {
    const url = `${CFG.base}/odds?date=${ymd}&page=${page}`;
    const r = await fetch(url, { headers: { "x-apisports-key": CFG.key }});
    const j = await r.json().catch(()=>({}));
    const arr = j?.response || [];
    for (const item of arr) {
      const fid = item?.fixture?.id;
      for (const bk of (item?.bookmakers || [])) {
        const bname = canon(bk?.name || "");
        if (TRUSTED.length && !TRUSTED.includes(bname)) continue;
        for (const m of (bk?.bets || [])) {
          if ((m?.name||"").toLowerCase().includes("match winner") || m?.id === 1) {
            // collect h2h odds
            const o = {};
            for (const v of (m?.values || [])) {
              const n = (v?.value || "").toLowerCase();
              if (n.includes("home")) o.home = Number(v?.odd);
              else if (n.includes("draw")) o.draw = Number(v?.odd);
              else if (n.includes("away")) o.away = Number(v?.odd);
            }
            if (!data[fid]) data[fid] = {};
            data[fid][bname] = o;
          }
        }
      }
    }
    grabbed += arr.length;
    if (!j?.paging || page >= (j?.paging?.total || 1)) break;
    page++;
  }
  await kvSet(KKEY, { ts: Date.now(), ymd, data }, 600);
  return data;
}
