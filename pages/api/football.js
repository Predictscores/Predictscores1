import { makePicks } from "@/football/core";
import { readLocked } from "@/football/locked";
import { ymdLocal } from "@/lib/time";
import { CFG } from "@/football/config";

export default async function handler(req,res){
  const hours = Number(req.query.hours || 24);
  const ymd = ymdLocal();
  const locked = await readLocked(ymd, req.query.slot || null);
  const hasLocked = (locked?.items || []).length > 0;

  if (hasLocked) {
    return res.status(200).json({ ok:true, hours, source:"locked", football: locked.items });
  }
  if (!hasLocked && CFG.lockedFallbackToLive) {
    const items = await makePicks({ hours });
    return res.status(200).json({ ok:true, hours, source:"live", football: items });
  }
  return res.status(200).json({ ok:true, hours, source:"locked-empty", football: [] });
}
