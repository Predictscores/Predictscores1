import { kvGet, kvSet } from "@/lib/kv";
export const lockedKey = (ymd, slot) => `vbl:${ymd}:${slot}`;

export async function readLocked(ymd, slot) {
  return (await kvGet(lockedKey(ymd,slot))) || { items:[], meta:{} };
}
export async function writeLocked(ymd, slot, items, meta={}) {
  return kvSet(lockedKey(ymd,slot), { items, meta, ymd, slot, ts:Date.now() }, 7*24*3600);
}
