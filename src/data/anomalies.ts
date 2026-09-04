// Transparent, rule-based anomaly detection. Every flag states the rule that
// produced it. These are ADVISORY signals for human review — never decisions.

import { CLAIMS, type Claim } from "./claims";

export type Severity = "high" | "medium" | "low";

export type AnomalyRule = {
  code: string;
  title: string;
  description: string;
  rule: string;
  severity: Severity;
  reviewAction: string;
};

export const RULES: AnomalyRule[] = [
  {
    code: "R1",
    title: "Excessive stage delay",
    description: "Claim has been sitting in the same stage well beyond the statutory expectation.",
    rule: "daysInCurrentStage > 365 AND status is not 'Title Granted' / 'Rejected'",
    severity: "high",
    reviewAction: "Ask the district committee to confirm the current file location and next hearing date.",
  },
  {
    code: "R2",
    title: "Granted area exceeds claimed area",
    description: "Recorded granted area is larger than the area originally claimed.",
    rule: "areaGrantedHa > areaClaimedHa",
    severity: "high",
    reviewAction: "Re-check the entry against the original claim form and survey sketch.",
  },
  {
    code: "R3",
    title: "IFR above 4 ha ceiling",
    description: "Individual forest rights claim exceeds the 4 hectare ceiling in the Act.",
    rule: "claimType = 'IFR' AND areaClaimedHa > 4",
    severity: "medium",
    reviewAction: "Verify measurement units and whether the claim should be treated as a community claim.",
  },
  {
    code: "R4",
    title: "Approved without Gram Sabha resolution on file",
    description: "Claim moved past Gram Sabha stage but no resolution is recorded.",
    rule: "status in {SDLC Review, DLC Approved, Title Granted} AND gramSabhaResolution = false",
    severity: "high",
    reviewAction: "Request the Gram Sabha resolution copy before the file proceeds further.",
  },
  {
    code: "R5",
    title: "Title granted without recorded survey",
    description: "A title is recorded although the field survey is not marked complete.",
    rule: "status = 'Title Granted' AND surveyCompleted = false",
    severity: "high",
    reviewAction: "Confirm whether survey records exist offline and attach them to the file.",
  },
  {
    code: "R6",
    title: "Possible duplicate claim",
    description: "Another live claim exists with the same claimant name in the same village.",
    rule: "same claimant + village appears on more than one non-rejected claim",
    severity: "medium",
    reviewAction: "Compare the two files; merge or close the duplicate after verification.",
  },
  {
    code: "R7",
    title: "Incomplete documentation at advanced stage",
    description: "Supporting documents are marked incomplete though the claim has advanced.",
    rule: "documentsComplete = false AND status in {SDLC Review, DLC Approved, Title Granted}",
    severity: "medium",
    reviewAction: "Issue a document deficiency note to the block office.",
  },
];

export const RULE_BY_CODE = Object.fromEntries(RULES.map((r) => [r.code, r]));

export type Flag = { code: string; claimId: string; detail: string; severity: Severity };

const ADVANCED = new Set(["SDLC Review", "DLC Approved", "Title Granted"]);

function duplicateKeys(claims: Claim[]) {
  const seen = new Map<string, number>();
  for (const c of claims) {
    if (c.status === "Rejected") continue;
    const k = `${c.claimant}|${c.village}`;
    seen.set(k, (seen.get(k) ?? 0) + 1);
  }
  return seen;
}

export function detectFlags(claims: Claim[] = CLAIMS): Flag[] {
  const dupes = duplicateKeys(claims);
  const out: Flag[] = [];
  for (const c of claims) {
    if (c.daysInCurrentStage > 365 && c.status !== "Title Granted" && c.status !== "Rejected")
      out.push({ code: "R1", claimId: c.id, severity: "high", detail: `${c.daysInCurrentStage} days in "${c.status}"` });
    if (c.areaGrantedHa != null && c.areaGrantedHa > c.areaClaimedHa)
      out.push({
        code: "R2",
        claimId: c.id,
        severity: "high",
        detail: `granted ${c.areaGrantedHa} ha vs claimed ${c.areaClaimedHa} ha`,
      });
    if (c.claimType === "IFR" && c.areaClaimedHa > 4)
      out.push({ code: "R3", claimId: c.id, severity: "medium", detail: `${c.areaClaimedHa} ha claimed as IFR` });
    if (ADVANCED.has(c.status) && !c.gramSabhaResolution)
      out.push({ code: "R4", claimId: c.id, severity: "high", detail: `at "${c.status}" with no resolution recorded` });
    if (c.status === "Title Granted" && !c.surveyCompleted)
      out.push({ code: "R5", claimId: c.id, severity: "high", detail: "title recorded, survey not marked complete" });
    if ((dupes.get(`${c.claimant}|${c.village}`) ?? 0) > 1 && c.status !== "Rejected")
      out.push({ code: "R6", claimId: c.id, severity: "medium", detail: `${c.claimant} in ${c.village}` });
    if (ADVANCED.has(c.status) && !c.documentsComplete)
      out.push({ code: "R7", claimId: c.id, severity: "medium", detail: `documents incomplete at "${c.status}"` });
  }
  return out;
}

export const ALL_FLAGS = detectFlags();

export const FLAGS_BY_CLAIM = ALL_FLAGS.reduce<Record<string, Flag[]>>((acc, f) => {
  (acc[f.claimId] ??= []).push(f);
  return acc;
}, {});
