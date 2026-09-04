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

const searchCache = new WeakMap<Claim, string>();

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
      let hay = searchCache.get(c);
      if (!hay) {
        hay = `${c.id} ${c.claimant} ${c.village} ${c.district} ${c.state} ${c.community}`.toLowerCase();
        searchCache.set(c, hay);
      }
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
  let titled = 0, rejected = 0, pending = 0, overdue = 0, flagged = 0;
  let areaGranted = 0;
  let pendingDaysSum = 0;

  for (let i = 0; i < claims.length; i++) {
    const c = claims[i];
    if (c.status === "Title Granted") titled++;
    else if (c.status === "Rejected") rejected++;
    else {
      pending++;
      pendingDaysSum += c.daysInCurrentStage;
      if (c.daysInCurrentStage > 365) overdue++;
    }
    areaGranted += c.areaGrantedHa ?? 0;
    if (FLAGS_BY_CLAIM[c.id]) flagged++;
  }

  const total = claims.length || 1;
  const avgDaysPending = pending ? pendingDaysSum / pending : 0;

  return {
    total: claims.length,
    titled,
    rejected,
    pending,
    titleRate: (titled / total) * 100,
    rejectionRate: (rejected / total) * 100,
    avgDaysPending: Math.round(avgDaysPending),
    areaGranted: Math.round(areaGranted),
    flagged,
    overdue,
  };
}

export function statusBreakdown(claims: Claim[]) {
  const counts = new Map<string, number>();
  for (const c of claims) counts.set(c.status, (counts.get(c.status) || 0) + 1);
  return STATUSES.map((s) => ({ status: s, count: counts.get(s) || 0 }));
}

export function typeBreakdown(claims: Claim[]) {
  const counts = new Map<string, number>();
  for (const c of claims) counts.set(c.claimType, (counts.get(c.claimType) || 0) + 1);
  return (["IFR", "CR", "CFR"] as ClaimType[]).map((t) => ({ type: t, count: counts.get(t) || 0 }));
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
  areaGranted: number;
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
    areaGranted: k.areaGranted,
    center,
  };
}

export function districtStats(claims: Claim[]): RegionStat[] {
  const byDistrict = new Map<string, Claim[]>();
  for (const c of claims) {
    let arr = byDistrict.get(c.district);
    if (!arr) { arr = []; byDistrict.set(c.district, arr); }
    arr.push(c);
  }
  const out: RegionStat[] = [];
  for (const s of STATES) {
    for (const d of s.districts) {
      const sub = byDistrict.get(d.district);
      if (sub && sub.length) out.push(summarize(d.district, s.state, d.center, sub));
    }
  }
  return out.sort((a, b) => b.total - a.total);
}

export function stateStats(claims: Claim[]): RegionStat[] {
  const byState = new Map<string, Claim[]>();
  for (const c of claims) {
    let arr = byState.get(c.state);
    if (!arr) { arr = []; byState.set(c.state, arr); }
    arr.push(c);
  }
  return STATES.map((s) => summarize(s.state, s.state, s.center, byState.get(s.state) || []))
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
