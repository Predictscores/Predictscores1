import { kvGet, kvSet } from "@/lib/kv";

/** Minimalni learning stub: prilagođava težine za rangiranje na osnovu poslednjeg ROI-a.
 *  Score = a*Conf + b*EdgePP + c*EV; ako ROI raste, blago povećaj b; ako opada, pojačaj a.
 */
const KEY = "learning:weights";
const DEF = { a:0.5, b:0.4, c:0.1, ts:0 };

export default async function handler(req,res){
  const w = (await kvGet(KEY)) || DEF;
  const hist = (await kvGet("history:sum")) || { roi_units:0 };
  const adj = Math.max(-0.02, Math.min(0.02, hist.roi_units/100)); // vrlo mali korak
  const a = Math.max(0.3, Math.min(0.7, w.a + (hist.roi_units<0 ? 0.01 : -0.005)));
  const b = Math.max(0.2, Math.min(0.6, w.b + (hist.roi_units>0 ? 0.01 : -0.005)));
  const c = 1 - (a+b);
  const nw = { a: Number(a.toFixed(3)), b: Number(b.toFixed(3)), c: Number(c.toFixed(3)), ts: Date.now() };
  await kvSet(KEY, nw, 30*24*3600);
  res.status(200).json({ ok:true, weights:nw });
}
