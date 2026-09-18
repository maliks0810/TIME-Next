import { mulberry32 } from "./mock";
import { SECS, BENCH, benchWeights } from "./universe";
import type { Portfolio, BenchKey, PortfolioRegion } from "./types";

const CLIENTS = [
  "Redwood Pension", "Cascade Endowment", "Atlas Insurance", "Blue Ridge Foundation",
  "Meridian Retirement", "Granite State Trust", "Harbor Point Capital", "Summit Health System",
  "Cedar Valley Fund", "Northwind Sovereign", "Lakeshore University", "Ironwood Family Office",
  "Copperfield Trust", "Silverline Assurance", "Evergreen Municipal", "Brightwater Pension",
  "Kestrel Holdings", "Old Mission Endowment", "Pinnacle Labor Union", "Sterling Diocese",
  "Whitfield Group", "Cobalt Retirement", "Marlowe Foundation", "Union Pacific Plan",
];

const MANAGERS = [
  "M. Chahal", "R. Barriger", "J. Lopez", "O. Mirzayev", "B. Bailey", "P. Gonzales",
  "M. Chahal", "M. Chahal", "J. Smith", "S. Kim", "D. Ross", "L. Wu", "T. Nguyen",
  "F. Alvarez", "G. Okoro",
];

export const ACCT = ["Institutional SMA", "Commingled Fund", "Mutual Fund", "Composite", "Sub-Advised"];

interface Strat {
  s: string;
  region: PortfolioRegion;
  b: BenchKey;
  tilt: number;
  names: number;
  team: string;
}

export const STRATS: Strat[] = [
  { s: "US Large-Cap Core", region: "US", b: "SPX", tilt: 0.35, names: 38, team: "US Equity" },
  { s: "US Large-Cap Growth", region: "US", b: "R1G", tilt: 0.8, names: 26, team: "US Equity" },
  { s: "US Large-Cap Value", region: "US", b: "SPX", tilt: 0.42, names: 34, team: "US Equity" },
  { s: "Concentrated Growth", region: "US", b: "R1G", tilt: 1, names: 15, team: "US Equity" },
  { s: "Mega-Cap Leaders", region: "US", b: "SPX", tilt: 1, names: 12, team: "US Equity" },
  { s: "Dividend Equity", region: "US", b: "SPX", tilt: 0.4, names: 34, team: "Income" },
  { s: "Focused Quality", region: "US", b: "SPX", tilt: 0.7, names: 24, team: "Quant" },
  { s: "Low Volatility", region: "US", b: "SPX", tilt: 0.45, names: 30, team: "Quant" },
  { s: "US SMID Core", region: "US", b: "SPX", tilt: 0.55, names: 36, team: "US Equity" },
  { s: "ESG Leaders", region: "US", b: "SPX", tilt: 0.5, names: 32, team: "US Equity" },
  { s: "Technology Leaders", region: "US", b: "R1G", tilt: 0.9, names: 16, team: "US Equity" },
  { s: "Health Care Focus", region: "Sector", b: "SPX", tilt: 0.7, names: 14, team: "US Equity" },
  { s: "Financials Income", region: "Sector", b: "SPX", tilt: 0.6, names: 12, team: "Income" },
  { s: "Global Equity Alpha", region: "Global", b: "MSCI", tilt: 0.5, names: 40, team: "Global Equity" },
  { s: "Global Innovation", region: "Global", b: "MSCI", tilt: 0.85, names: 22, team: "Global Equity" },
  { s: "Global Dividend", region: "Global", b: "MSCI", tilt: 0.42, names: 32, team: "Income" },
  { s: "International Equity", region: "Intl", b: "EAFE", tilt: 0.5, names: 20, team: "Global Equity" },
  { s: "International Value", region: "Intl", b: "EAFE", tilt: 0.5, names: 18, team: "Global Equity" },
];

/** The current signed-in user. */
export const ME = "M. Chahal";

/** Colleagues the workspace can be shared with (everyone on the desk but me). */
const ROLES = ["Portfolio Manager", "Research Analyst", "Risk & Research", "Client Portfolio Mgr", "Quant Strategist"];
export interface Colleague {
  name: string;
  role: string;
  initials: string;
}
/** Managers who should not appear in the share recipient list. */
const NOT_SHAREABLE = new Set(["S. Kim", "D. Ross"]);
export const COLLEAGUES: Colleague[] = MANAGERS.filter((m) => m !== ME)
  .map((name, i) => ({
    name,
    role: ROLES[i % ROLES.length],
    initials: name
      .replace(/[.]/g, "")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase(),
  }))
  .filter((c) => !NOT_SHAREABLE.has(c.name));

export const AUMBANDS: [string, number, number][] = [
  ["<$1B", 0, 1],
  ["$1–5B", 1, 5],
  ["$5–20B", 5, 20],
  [">$20B", 20, 1e9],
];

export function aumBand(a: number): string {
  return (AUMBANDS.find((b) => a >= b[1] && a < b[2]) || AUMBANDS[0])[0];
}

/** 700-portfolio firm master with entitlements (seed 7 — ported verbatim). */
export const PF: Portfolio[] = [];
(function buildMaster() {
  const rnd = mulberry32(7);
  for (let i = 0; i < 700; i++) {
    const st = STRATS[Math.floor(rnd() * STRATS.length)];
    const acRoll = rnd();
    const assetClass = acRoll < 0.72 ? "Equity" : acRoll < 0.88 ? "Fixed Income" : "Emerging Mkts";
    const ent = rnd() < 0.22;
    const me = ent && i % 6 === 2;
    const mgr = me ? ME : MANAGERS[1 + Math.floor(rnd() * (MANAGERS.length - 1))];
    const acct = ACCT[Math.floor(rnd() * ACCT.length)];
    const aum = +(0.2 + Math.pow(rnd(), 2) * 44).toFixed(1);
    const nameRoll = rnd();
    const nm =
      nameRoll < 0.5
        ? `${CLIENTS[Math.floor(rnd() * CLIENTS.length)]} — ${st.s}`
        : `TCW ${st.s} ${["Fund", "Composite", "Trust", "SMA"][Math.floor(rnd() * 4)]}`;
    const fav = ent && rnd() < 0.06;
    const recent = ent && rnd() < 0.09;
    PF.push({
      id: "P" + (1000 + i),
      name: nm,
      strategy: st.s,
      region: st.region,
      bench: st.b,
      assetClass: assetClass as Portfolio["assetClass"],
      manager: mgr,
      team: st.team,
      acct,
      aum,
      aband: aumBand(aum),
      ent,
      me,
      fav,
      recent,
      seed: i * 7 + 3,
      names: st.names,
      tilt: st.tilt,
      eq: assetClass === "Equity",
    });
  }
})();

export const PMAP: Record<string, Portfolio> = Object.fromEntries(PF.map((p) => [p.id, p]));
export const ENT = PF.filter((p) => p.ent); // entitled to this user
export const ENT_EQ = ENT.filter((p) => p.eq); // selectable (equity)

const PCACHE: Record<string, Map<string, number>> = {};

/** Deterministic portfolio holdings weights (%), memoized (ported verbatim). */
export function portWeights(pid: string): Map<string, number> {
  if (PCACHE[pid]) return PCACHE[pid];
  const p = PMAP[pid];
  const bk = p.bench;
  let pool = SECS.filter(BENCH[bk].elig);
  if (pool.length < 8) pool = SECS.filter((s) => s.spxElig || s.region !== "N. America");
  const rr = mulberry32(p.seed);
  const names = Math.min(p.names, pool.length);
  const bw = benchWeights(bk);
  const sc = pool.map((s) => ({ s, k: (bw.get(s.id) || 0.4) * (0.4 + rr() * p.tilt * 2) }));
  sc.sort((a, b) => b.k - a.k);
  const ch = sc.slice(0, names);
  const tot = ch.reduce((a, x) => a + x.k, 0) || 1;
  const m = new Map<string, number>();
  ch.forEach((x) => m.set(x.s.id, +((x.k / tot) * 100).toFixed(3)));
  return (PCACHE[pid] = m);
}
