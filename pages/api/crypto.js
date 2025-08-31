import { cryptoSignals } from "@/crypto/core";

export default async function handler(req,res){
  const data = await cryptoSignals();
  const refreshIn = 600 - Math.min(600, Math.floor((Date.now() - (data?.ts || 0))/1000));
  res.status(200).json({ ok:true, refresh_sec: refreshIn, crypto: data });
}
