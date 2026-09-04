import { CLAIMS, STATUSES, type Claim, type ClaimStatus, type ClaimType } from "./claims";
import { ALL_FLAGS, FLAGS_BY_CLAIM } from "./anomalies";
import { STATES } from "./geo";

export type Filters = {
  states: string[];
  districts: string[];
  claimTypes: ClaimType[];
  statuses: ClaimStatus[];
  search: string;
  onlyFlagged: boolean;
  minDaysPending: number;
};

export const EMPTY_FILTERS: Filters = {
  states: [],
  districts: [],
  claimTypes: [],
  statuses: [],
  search: "",
  onlyFlagged: false,
  minDaysPending: 0,
};

export function applyFilters(f: Filters, claims: Claim[] = CLAIMS): Claim[] {
  const q = f.search.trim().toLowerCase();
  return claims.filter((c) => {
    if (f.states.length && !f.states.includes(c.state)) return false;
    if (f.districts.length && !f.districts.includes(c.district)) return false;
    if (f.claimTypes.length && !f.claimTypes.includes(c.claimType)) return false;
    if (f.statuses.length && !f.statuses.includes(c.status)) return false;
    if (f.minDaysPending && c.daysInCurrentStage < f.minDaysPending) return false;
    if (f.onlyFlagged && !FLAGS_BY_CLAIM[c.id]) return false;
    if (q) {
      const hay = `${c.id} ${c.claimant} ${c.village} ${c.district} ${c.state} ${c.community}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export type Kpis = {
  total: number;
  titled: number;
  rejected: number;
  pending: number;
  titleRate: number;
  rejectionRate: number;
  avgDaysPending: number;
  areaGranted: number;
  flagged: number;
  overdue: number;
};

export function computeKpis(claims: Claim[]): Kpis {
  const total = claims.length || 1;
  const titled = claims.filter((c) => c.status === "Title Granted").length;
  const rejected = claims.filter((c) => c.status === "Rejected").length;
  const pending = claims.length - titled - rejected;
  const pendingClaims = claims.filter((c) => c.status !== "Title Granted" && c.status !== "Rejected");
  const avg = pendingClaims.length
    ? pendingClaims.reduce((s, c) => s + c.daysInCurrentStage, 0) / pendingClaims.length
    : 0;
  return {
    total: claims.length,
    titled,
    rejected,
    pending,
    titleRate: (titled / total) * 100,
    rejectionRate: (rejected / total) * 100,
    avgDaysPending: Math.round(avg),
    areaGranted: Math.round(claims.reduce((s, c) => s + (c.areaGrantedHa ?? 0), 0)),
    flagged: claims.filter((c) => FLAGS_BY_CLAIM[c.id]).length,
    overdue: pendingClaims.filter((c) => c.daysInCurrentStage > 365).length,
  };
}

export function statusBreakdown(claims: Claim[]) {
  return STATUSES.map((s) => ({ status: s, count: claims.filter((c) => c.status === s).length }));
}

export function typeBreakdown(claims: Claim[]) {
  return (["IFR", "CR", "CFR"] as ClaimType[]).map((t) => ({
    type: t,
    count: claims.filter((c) => c.claimType === t).length,
  }));
}

export function monthlyTrend(claims: Claim[]) {
  const map = new Map<string, { month: string; submitted: number; titled: number }>();
  for (const c of claims) {
    const m = c.submittedOn.slice(0, 7);
    const row = map.get(m) ?? { month: m, submitted: 0, titled: 0 };
    row.submitted += 1;
    if (c.status === "Title Granted") row.titled += 1;
    map.set(m, row);
  }
  return [...map.values()].sort((a, b) => a.month.localeCompare(b.month)).slice(-24);
}

export type RegionStat = {
  name: string;
  state: string;
  total: number;
  titled: number;
  rejected: number;
  pending: number;
  titleRate: number;
  rejectionRate: number;
  avgDaysPending: number;
  flagged: number;
  center: [number, number];
};

function summarize(name: string, state: string, center: [number, number], claims: Claim[]): RegionStat {
  const k = computeKpis(claims);
  return {
    name,
    state,
    total: k.total,
    titled: k.titled,
    rejected: k.rejected,
    pending: k.pending,
    titleRate: k.titleRate,
    rejectionRate: k.rejectionRate,
    avgDaysPending: k.avgDaysPending,
    flagged: k.flagged,
    center,
  };
}

export function districtStats(claims: Claim[]): RegionStat[] {
  const out: RegionStat[] = [];
  for (const s of STATES)
    for (const d of s.districts) {
      const sub = claims.filter((c) => c.district === d.district);
      if (sub.length) out.push(summarize(d.district, s.state, d.center, sub));
    }
  return out.sort((a, b) => b.total - a.total);
}

export function stateStats(claims: Claim[]): RegionStat[] {
  return STATES.map((s) => summarize(s.state, s.state, s.center, claims.filter((c) => c.state === s.state)))
    .filter((r) => r.total > 0)
    .sort((a, b) => b.titleRate - a.titleRate);
}

export function performanceBand(titleRate: number) {
  if (titleRate >= 30) return { label: "On track", tone: "good" as const };
  if (titleRate >= 20) return { label: "Watch", tone: "warn" as const };
  return { label: "Needs attention", tone: "bad" as const };
}

export function flagsForClaims(claims: Claim[]) {
  const ids = new Set(claims.map((c) => c.id));
  return ALL_FLAGS.filter((f) => ids.has(f.claimId));
}
