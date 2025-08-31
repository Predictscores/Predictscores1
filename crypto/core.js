import { kvGet, kvSet } from "@/lib/kv";

/** Jednostavni LONG/SHORT signali iz Binance klina (bez ključa).
 *  Strategija: poredimo 5m momentum vs 1h momentum; score je multiplikativni odnos.
 */
const SYMS = ["BTCUSDT","ETHUSDT","BNBUSDT","ADAUSDT","XRPUSDT"];
const KKEY = "crypto:last";

async function binanceKlines(symbol, interval, limit=60) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const r = await fetch(url);
  const j = await r.json().catch(()=>[]);
  return Array.isArray(j) ? j : [];
}
function lastClose(kl) { const row = kl?.[kl.length-1]; return row ? Number(row[4]) : 0; }
function momentum(kl) {
  if (!kl?.length) return 0;
  const a = Number(kl[0][4]), b = Number(kl[kl.length-1][4]);
  if (!(a>0 && b>0)) return 0;
  return (b-a)/a;
}
export async function cryptoSignals() {
  const cached = await kvGet(KKEY);
  if (cached && (Date.now()-cached.ts < 10*60*1000)) return cached.data;

  const out = [];
  for (const s of SYMS) {
    const [m5, h1] = await Promise.all([binanceKlines(s,"5m",36), binanceKlines(s,"1h",48)]);
    const price = lastClose(m5) || lastClose(h1);
    const m5m = momentum(m5), h1m = momentum(h1);
    const score = (1 + m5m) * (1 + h1m) - 1;
    const signal = score >= 0 ? "LONG" : "SHORT";
    out.push({ symbol:s, price, horizon:"4h", signal, score, stop:null, target:null, note:`m5=${(m5m*100).toFixed(1)}% / h1=${(h1m*100).toFixed(1)}%` });
  }
  await kvSet(KKEY, { ts:Date.now(), data:out }, 600);
  return out;
}
