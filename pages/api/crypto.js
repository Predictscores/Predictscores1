import { cryptoSignals } from "@/crypto/core";

export default async function handler(req, res) {
  const data = await cryptoSignals();
  const arr = Array.isArray(data) ? data : (data?.data || []);
  const ts = Array.isArray(data) ? Date.now() : (data?.ts || Date.now());
  const age = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  const refreshIn = Math.max(0, 600 - Math.min(600, age));
  res.status(200).json({ ok: true, refresh_sec: refreshIn, crypto: arr });
}
