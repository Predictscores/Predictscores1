import { makePicks } from "@/football/core";
import { writeLocked } from "@/football/locked";
import { ymdLocal } from "@/lib/time";

export default async function handler(req,res){
  const slot = (req.query.slot || "").toLowerCase();
  if (!["am","pm","late"].includes(slot)) return res.status(400).json({ ok:false, error:"slot=am|pm|late" });
  const ymd = ymdLocal();
  const items = await makePicks({ hours: 36 });
  await writeLocked(ymd, slot, items, { count: items.length });
  res.status(200).json({ ok:true, slot, ymd, count: items.length, wrote:true, football: items.slice(0,3) });
}
