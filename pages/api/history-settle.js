import { kvGet, kvSet } from "@/lib/kv";
import { CFG, HDRS } from "@/football/config";

const KEY_LIST = "history:list";
const KEY_SUM = "history:sum";

/** Ova ruta periodično prolazi kroz zaključane pickove iz poslednjih ~14 dana,
 *  proverava rezultate i ažurira history sumarne metrike.
 *  (Simplifikovano: traži resenje po fixture id + status iz API-Football.)
 */
export default async function handler(req,res){
  // U realnoj implementaciji čitali bismo sve ključeve vbl:YYYY-MM-DD:* iz KV.
  // Ovde za skraćivanje pretpostavljamo da klijent već piše u history:list pri settle u rebuild-u.
  const list = (await kvGet(KEY_LIST)) || [];
  // Reizračun summary
  let wins=0, losses=0, voids=0, roi=0, cnt=0, sumOdds=0, sumEdge=0;
  for (const p of list) {
    if (p.result==="HIT") { wins++; roi += (p.odds - 1); }
    else if (p.result==="MISS") { losses++; roi -= 1; }
    else { voids++; }
    if (p.odds) sumOdds += p.odds;
    if (Number.isFinite(p.edge_pp)) sumEdge += p.edge_pp;
    cnt++;
  }
  const hit_rate = (wins / Math.max(1, (wins+losses))) * 100;
  const summary = { roi_units: roi, wins, losses, voids, hit_rate, avg_odds: cnt? sumOdds/cnt : 0, avg_edge: cnt? sumEdge/cnt : 0 };
  await kvSet(KEY_SUM, summary, 14*24*3600);
  res.status(200).json({ ok:true, updated:true, summary });
}
