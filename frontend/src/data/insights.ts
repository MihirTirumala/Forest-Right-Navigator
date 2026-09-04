// Data-grounded narrative generation. Every sentence is derived from the
// filtered dataset by explicit computation — no external model, no speculation.
// All output is ADVISORY and intended for human review only.

import type { Claim } from "./claims";
import { computeKpis, districtStats, flagsForClaims, stateStats } from "./analytics";
import { RULE_BY_CODE, RULES } from "./anomalies";

export type Insight = {
  id: string;
  title: string;
  body: string;
  evidence: string[];
  severity: "high" | "medium" | "low";
};

const pct = (n: number) => `${n.toFixed(1)}%`;

export function generateInsights(claims: Claim[]): Insight[] {
  const k = computeKpis(claims);
  const districts = districtStats(claims).filter((d) => d.total >= 15);
  const flags = flagsForClaims(claims);
  const out: Insight[] = [];

  if (!claims.length) return out;

  out.push({
    id: "overview",
    title: "Portfolio overview",
    body: `${k.total.toLocaleString()} claims are in scope. ${k.titled.toLocaleString()} hold titles (${pct(
      k.titleRate,
    )}), ${k.rejected.toLocaleString()} are rejected (${pct(k.rejectionRate)}) and ${k.pending.toLocaleString()} remain in process, averaging ${k.avgDaysPending} days in their current stage. Recorded granted area is ${k.areaGranted.toLocaleString()} ha.`,
    evidence: [
      `Counts by status over the filtered set`,
      `Average of daysInCurrentStage across ${k.pending} in-process claims`,
    ],
    severity: "low",
  });

  const slow = [...districts].sort((a, b) => b.avgDaysPending - a.avgDaysPending).slice(0, 3);
  if (slow.length)
    out.push({
      id: "bottleneck",
      title: "Processing bottlenecks",
      body: `${slow[0]!.name} (${slow[0]!.state}) shows the longest average wait at ${slow[0]!.avgDaysPending} days in stage, followed by ${slow
        .slice(1)
        .map((d) => `${d.name} (${d.avgDaysPending} d)`)
        .join(" and ")}. ${k.overdue} claims across the selection have been static for over a year.`,
      evidence: slow.map((d) => `${d.name}: ${d.pending} pending, avg ${d.avgDaysPending} days`),
      severity: k.overdue > 40 ? "high" : "medium",
    });

  const highReject = [...districts].sort((a, b) => b.rejectionRate - a.rejectionRate)[0];
  if (highReject && highReject.rejectionRate > 25)
    out.push({
      id: "rejection",
      title: "Rejection concentration",
      body: `${highReject.name} rejects ${pct(highReject.rejectionRate)} of claims against a selection-wide rate of ${pct(
        k.rejectionRate,
      )}. A concentration of this size usually reflects either documentation practice or committee interpretation rather than claim quality, and is worth a manual file audit.`,
      evidence: [
        `${highReject.rejected} rejected of ${highReject.total} claims in ${highReject.name}`,
        `Selection-wide rejection rate ${pct(k.rejectionRate)}`,
      ],
      severity: "high",
    });

  const byRule = RULES.map((r) => ({ rule: r, n: flags.filter((f) => f.code === r.code).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  if (byRule.length)
    out.push({
      id: "anomaly",
      title: "Anomaly signal mix",
      body: `${flags.length} rule hits cover ${k.flagged} distinct claims. The dominant signal is "${byRule[0]!.rule.title}" (${byRule[0]!.n} hits), followed by ${byRule
        .slice(1, 3)
        .map((x) => `"${x.rule.title}" (${x.n})`)
        .join(", ")}. Each hit names the rule that produced it, so reviewers can confirm or dismiss it directly against the file.`,
      evidence: byRule.slice(0, 4).map((x) => `${x.rule.code} · ${x.rule.title}: ${x.n} hits — ${x.rule.rule}`),
      severity: byRule[0]!.n > 60 ? "high" : "medium",
    });

  const missingRes = flags.filter((f) => f.code === "R4").length;
  if (missingRes > 0)
    out.push({
      id: "process",
      title: "Process-integrity watch",
      body: `${missingRes} advanced-stage claims carry no Gram Sabha resolution on record. Under the Act the Gram Sabha resolution is the originating document, so these files should not progress until the record is located or reconstructed.`,
      evidence: [`Rule R4 — ${RULE_BY_CODE["R4"]!.rule}`],
      severity: "high",
    });

  const states = stateStats(claims);
  if (states.length > 1)
    out.push({
      id: "states",
      title: "State comparison",
      body: `${states[0]!.name} leads on title conversion at ${pct(states[0]!.titleRate)}, while ${states[states.length - 1]!.name} trails at ${pct(
        states[states.length - 1]!.titleRate,
      )}. The gap of ${(states[0]!.titleRate - states[states.length - 1]!.titleRate).toFixed(1)} points is large enough to justify a practice exchange between the two administrations.`,
      evidence: states.slice(0, 3).map((s) => `${s.name}: ${s.titled}/${s.total} titled (${pct(s.titleRate)})`),
      severity: "medium",
    });

  return out;
}

/* ------------------- grounded assistant ------------------- */

export type Answer = { text: string; evidence: string[] };

export function answerQuestion(q: string, claims: Claim[]): Answer {
  const query = q.toLowerCase();
  const k = computeKpis(claims);
  const districts = districtStats(claims).filter((d) => d.total >= 10);
  const states = stateStats(claims);
  const flags = flagsForClaims(claims);

  const has = (...words: string[]) => words.some((w) => query.includes(w));

  if (has("delay", "slow", "pending", "bottleneck", "overdue")) {
    const slow = [...districts].sort((a, b) => b.avgDaysPending - a.avgDaysPending).slice(0, 5);
    return {
      text: `Within the current filters, ${k.pending} claims are still in process with an average of ${k.avgDaysPending} days in their present stage, and ${k.overdue} have not moved in over a year. The slowest districts are ${slow
        .map((d) => `${d.name} (${d.avgDaysPending} d)`)
        .join(", ")}. Treat this as a prompt for a file-location check, not as a finding.`,
      evidence: slow.map((d) => `${d.name}: ${d.pending} pending · avg ${d.avgDaysPending} days`),
    };
  }

  if (has("reject", "refus")) {
    const worst = [...districts].sort((a, b) => b.rejectionRate - a.rejectionRate).slice(0, 5);
    return {
      text: `The selection-wide rejection rate is ${pct(k.rejectionRate)} (${k.rejected} of ${k.total}). Rejections cluster in ${worst
        .map((d) => `${d.name} (${pct(d.rejectionRate)})`)
        .join(", ")}. Clustering of this kind warrants a sample audit of rejection orders by a human reviewer.`,
      evidence: worst.map((d) => `${d.name}: ${d.rejected}/${d.total} rejected`),
    };
  }

  if (has("anomal", "flag", "irregular", "suspicious", "fraud")) {
    const counts = RULES.map((r) => ({ r, n: flags.filter((f) => f.code === r.code).length })).filter((x) => x.n);
    return {
      text: `${flags.length} rule hits are active on ${k.flagged} claims. Breakdown: ${counts
        .map((c) => `${c.r.code} ${c.r.title} — ${c.n}`)
        .join("; ")}. Every hit is a deterministic rule match; none of them establishes wrongdoing on its own.`,
      evidence: counts.map((c) => `${c.r.code}: ${c.r.rule}`),
    };
  }

  if (has("state", "compare", "best", "top", "worst", "performance")) {
    return {
      text: `Across ${states.length} states in scope, ${states[0]?.name} has the highest title conversion at ${pct(
        states[0]?.titleRate ?? 0,
      )} and ${states[states.length - 1]?.name} the lowest at ${pct(states[states.length - 1]?.titleRate ?? 0)}. Average time in stage ranges from ${Math.min(
        ...states.map((s) => s.avgDaysPending),
      )} to ${Math.max(...states.map((s) => s.avgDaysPending))} days.`,
      evidence: states.map((s) => `${s.name}: ${s.titled}/${s.total} titled · avg ${s.avgDaysPending} d`),
    };
  }

  if (has("cfr", "community")) {
    const cfr = claims.filter((c) => c.claimType !== "IFR");
    const kk = computeKpis(cfr);
    return {
      text: `Community claims (CR + CFR) account for ${cfr.length} of ${claims.length} filtered claims. ${kk.titled} are titled (${pct(
        kk.titleRate,
      )}) covering ${kk.areaGranted.toLocaleString()} ha, and ${kk.pending} remain in process at an average ${kk.avgDaysPending} days in stage.`,
      evidence: [`Filtered on claimType in {CR, CFR}`, `${kk.flagged} of these carry at least one anomaly flag`],
    };
  }

  if (has("women", "woman", "female", "gender")) {
    const f = claims.filter((c) => c.gender === "F");
    const kf = computeKpis(f);
    return {
      text: `${f.length} of ${claims.length} filtered claims (${pct((f.length / (claims.length || 1)) * 100)}) are recorded against women claimants, with a title rate of ${pct(
        kf.titleRate,
      )} against ${pct(k.titleRate)} overall.`,
      evidence: [`${kf.titled} titled of ${f.length} women-held claims`],
    };
  }

  if (has("area", "hectare", "land")) {
    const claimed = claims.reduce((s, c) => s + c.areaClaimedHa, 0);
    return {
      text: `Total area claimed in the selection is ${Math.round(claimed).toLocaleString()} ha, of which ${k.areaGranted.toLocaleString()} ha is recorded as granted — a recognition ratio of ${pct(
        (k.areaGranted / (claimed || 1)) * 100,
      )}.`,
      evidence: [`Sum of areaClaimedHa and areaGrantedHa across ${claims.length} claims`],
    };
  }

  return {
    text: `I answer only from the ${claims.length} claims currently in view. Try asking about delays and pending files, rejection patterns, anomaly flags, state comparisons, community (CFR) claims, women claimants, or area recognised. Current headline: ${pct(
      k.titleRate,
    )} titled, ${pct(k.rejectionRate)} rejected, ${k.pending} in process, ${k.flagged} flagged.`,
    evidence: [`Computed live from the filtered dataset`],
  };
}
