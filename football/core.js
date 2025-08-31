import { CFG, HDRS, BAN_RE, TRUSTED } from "./config";
import { nowLocal, ymdLocal } from "@/lib/time";
import { impliedProb, canon, clamp } from "@/lib/util";
import { getCachedOdds } from "./odds";

/** Dohvati fixtures u sledećih N sati (default 24) */
export async function fetchFixtures(hours=24) {
  const from = new Date();
  const to = new Date(Date.now() + hours*3600*1000);
  const f = from.toISOString().slice(0,10);
  const t = to.toISOString().slice(0,10);
  const url = `${CFG.base}/fixtures?from=${f}&to=${t}&timezone=Europe/Belgrade`;
  const r = await fetch(url, { headers: HDRS });
  const j = await r.json().catch(()=>({}));
  const arr = (j?.response || []).filter(x => {
    const ln = x?.league?.name || "";
    return !BAN_RE.test(ln);
  });
  return arr;
}

/** Izračunaj pickove iz fixtures + cached odds */
export async function makePicks({ hours=24, minOdds=CFG.minOdds, limit=CFG.vbLimit }) {
  const fixtures = await fetchFixtures(hours);
  const odds = await getCachedOdds();
  const picks = [];
  const perLeague = {};
  for (const fx of fixtures) {
    const fid = fx?.fixture?.id;
    const league = fx?.league;
    const home = fx?.teams?.home?.name;
    const away = fx?.teams?.away?.name;
    const kickoffISO = fx?.fixture?.date;
    const kickoff = kickoffISO?.replace("T"," ").slice(0,16);

    const bookMap = odds?.[fid] || {};
    const entries = Object.entries(bookMap).filter(([b]) => !TRUSTED.length || TRUSTED.includes(b));
    if (!entries.length) continue;

    // Agregacija konsenzusa i najboljih kvota
    const agg = { home:[], draw:[], away:[] };
    for (const [,o] of entries) {
      if (o?.home>1) agg.home.push(o.home);
      if (o?.draw>1) agg.draw.push(o.draw);
      if (o?.away>1) agg.away.push(o.away);
    }
    const avg = k => (agg[k].length ? (agg[k].reduce((a,b)=>a+b,0)/agg[k].length) : 0);
    const best = k => (agg[k].length ? Math.max(...agg[k]) : 0);
    const selKeys = ["home","draw","away"];
    for (const k of selKeys) {
      const oddsAvg = avg(k), oddsBest = best(k);
      if (!oddsBest || oddsBest < minOdds) continue;
      const imp = impliedProb(oddsAvg || oddsBest); // fair ~ consensus
      const edge_pp = (oddsBest*imp) - 1;          // value vs consensus fair
      if (!Number.isFinite(edge_pp)) continue;
      const bookmaker = entries.find(([,o]) => (o?.[k]||0)===oddsBest)?.[0] || "n/a";
      // Conf% kao funkcija edge-a (0.40->60%, 0.10->52%, itd.)
      const conf_pct = clamp(50 + (edge_pp*100)/2, 40, 90);
      const ev_units = edge_pp * 1.0; // flat stake 1u

      // per-league cap
      const lid = `${league?.id||"L"}:${league?.name||"?"}`;
      perLeague[lid] = (perLeague[lid]||0) + 1;
      if (perLeague[lid] > CFG.vbMaxPerLeague) continue;

      picks.push({
        fixture_id: fid,
        league, teams: { home, away }, kickoff,
        market: "1X2",
        selection: k.toUpperCase(),
        conf_pct, edge_pp, ev_units,
        odds: oddsBest,
        bookmaker,
        info_url: `https://www.api-football.com/documentation#operation/get-fixtures` // referenca
      });
    }
  }

  // Rangiranje: Score = 0.5*conf + 0.4*edge_pp + 0.1*ev
  for (const p of picks) p.score = (0.5*(p.conf_pct/100)) + (0.4*p.edge_pp) + (0.1*p.ev_units);
  picks.sort((a,b)=> b.score - a.score);
  return picks.slice(0, limit);
}
