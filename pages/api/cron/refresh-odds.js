import { refreshOddsForDate } from "@/football/odds";
import { ymdLocal } from "@/lib/time";

export default async function handler(req,res){
  const ymd = ymdLocal();
  const data = await refreshOddsForDate(ymd);
  res.status(200).json({ ok:true, ymd, bookmakers: Object.values(data||{}).reduce((s,x)=>s+Object.keys(x).length,0) });
}
