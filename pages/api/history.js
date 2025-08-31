import { kvGet } from "@/lib/kv";

const KEY_SUM = "history:sum";
const KEY_LIST = "history:list"; // array of settled picks (14d window)

export default async function handler(req,res){
  const summary = (await kvGet(KEY_SUM)) || { roi_units:0, wins:0, losses:0, voids:0, hit_rate:0, avg_odds:0, avg_edge:0 };
  const list = (await kvGet(KEY_LIST)) || [];
  res.status(200).json({ ok:true, summary, list });
}
