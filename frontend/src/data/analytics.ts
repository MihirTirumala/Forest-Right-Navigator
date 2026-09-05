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
  const hasStates = f.states.length > 0;
  const hasDistricts = f.districts.length > 0;
  const hasClaimTypes = f.claimTypes.length > 0;
  const hasStatuses = f.statuses.length > 0;
  const minDays = f.minDaysPending;
  const onlyFlagged = f.onlyFlagged;

  return claims.filter((c) => {
    if (hasStates && !f.states.includes(c.state)) return false;
    if (hasDistricts && !f.districts.includes(c.district)) return false;
    if (hasClaimTypes && !f.claimTypes.includes(c.claimType)) return false;
    if (hasStatuses && !f.statuses.includes(c.status)) return false;
    if (minDays && c.daysInCurrentStage < minDays) return false;
    if (onlyFlagged && !FLAGS_BY_CLAIM[c.id]) return false;
    if (q) {
      const hay = c.searchStr ?? `${c.id} ${c.claimant} ${c.village} ${c.district} ${c.state} ${c.community}`.toLowerCase();
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
  const totalCount = claims.length;
  if (!totalCount) {
    return {
      total: 0,
      titled: 0,
      rejected: 0,
      pending: 0,
      titleRate: 0,
      rejectionRate: 0,
      avgDaysPending: 0,
      areaGranted: 0,
      flagged: 0,
      overdue: 0,
    };
  }

  let titled = 0;
  let rejected = 0;
  let pendingDaysSum = 0;
  let pendingCount = 0;
  let overdue = 0;
  let areaGranted = 0;
  let flagged = 0;

  for (let i = 0; i < totalCount; i++) {
    const c = claims[i]!;
    if (c.status === "Title Granted") {
      titled++;
      if (c.areaGrantedHa) areaGranted += c.areaGrantedHa;
    } else if (c.status === "Rejected") {
      rejected++;
    } else {
      pendingCount++;
      pendingDaysSum += c.daysInCurrentStage;
      if (c.daysInCurrentStage > 365) overdue++;
    }
    if (FLAGS_BY_CLAIM[c.id]) {
      flagged++;
    }
  }

  const pending = totalCount - titled - rejected;
  const avgDaysPending = pendingCount > 0 ? Math.round(pendingDaysSum / pendingCount) : 0;

  return {
    total: totalCount,
    titled,
    rejected,
    pending,
    titleRate: (titled / totalCount) * 100,
    rejectionRate: (rejected / totalCount) * 100,
    avgDaysPending,
    areaGranted: Math.round(areaGranted),
    flagged,
    overdue,
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
  for (let i = 0; i < claims.length; i++) {
    const c = claims[i]!;
    let list = byDistrict.get(c.district);
    if (!list) {
      list = [];
      byDistrict.set(c.district, list);
    }
    list.push(c);
  }

  const out: RegionStat[] = [];
  for (const s of STATES) {
    for (const d of s.districts) {
      const sub = byDistrict.get(d.district);
      if (sub && sub.length) {
        out.push(summarize(d.district, s.state, d.center, sub));
      }
    }
  }
  return out.sort((a, b) => b.total - a.total);
}

export function stateStats(claims: Claim[]): RegionStat[] {
  const byState = new Map<string, Claim[]>();
  for (let i = 0; i < claims.length; i++) {
    const c = claims[i]!;
    let list = byState.get(c.state);
    if (!list) {
      list = [];
      byState.set(c.state, list);
    }
    list.push(c);
  }

  const out: RegionStat[] = [];
  for (const s of STATES) {
    const sub = byState.get(s.state);
    if (sub && sub.length) {
      out.push(summarize(s.state, s.state, s.center, sub));
    }
  }
  return out.sort((a, b) => b.titleRate - a.titleRate);
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
