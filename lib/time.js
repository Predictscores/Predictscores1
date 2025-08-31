export const TZ = process.env.TZ_DISPLAY || "Europe/Belgrade";

function toLocal(date = new Date()) {
  try {
    const s = date.toLocaleString("sv-SE", { timeZone: TZ, hour12:false });
    // sv-SE: "YYYY-MM-DD HH:mm:ss"
    const [d,t] = s.split(" ");
    return { ymd:d, hm:t?.slice(0,5), full:s };
  } catch { return { ymd:"", hm:"", full:"" }; }
}
export function nowLocal() { return toLocal(new Date()); }
export function ymdLocal() { return toLocal(new Date()).ymd; }
export function slotByHour(h) { if (h>=0 && h<10) return "late"; if (h<15) return "am"; return "pm"; }
export function currentSlot() { const d = new Date(); const h = Number(toLocal(d).full.slice(11,13)); return slotByHour(h); }
