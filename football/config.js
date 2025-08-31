export const CFG = {
  base: process.env.API_FOOTBALL_BASE_URL || "https://v3.football.api-sports.io",
  key:  process.env.API_FOOTBALL_KEY || process.env.API_FOOTBALL || "",
  minOdds: Number(process.env.MIN_ODDS || 1.50),
  trustedCsv: (process.env.TRUSTED_BOOKIES || process.env.TRUSTED_BOOKMAKERS || "pinnacle,bet365,betfair,unibet"),
  trustedOnly: Number(process.env.ODDS_TRUSTED_ONLY || 0) === 1,
  vbLimit: Number(process.env.VB_LIMIT || 25),
  vbMaxPerLeague: Number(process.env.VB_MAX_PER_LEAGUE || 2),
  lockedFallbackToLive: Number(process.env.LOCKED_FALLBACK_TO_LIVE || 1) === 1,
  oddsBatchMaxPages: Number(process.env.ODDS_BATCH_MAX_PAGES || 5),
};
export const TRUSTED = CFG.trustedCsv.split(",").map(s=>s.trim().toLowerCase()).filter(Boolean);
export const BAN_RE = new RegExp("(Women|U21|U23|Under|Reserve|Reserves|Girls|Youth|Academy)", "i");
export const HDRS = { "x-apisports-key": CFG.key, "Content-Type":"application/json" };
