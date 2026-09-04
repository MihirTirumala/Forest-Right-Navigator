// SYNTHETIC DEMO DATA — generated deterministically for the FRA Monitor prototype.
// No real claimant, village or administrative record is represented here.

import { ALL_DISTRICTS, STATES } from "./geo";

export type ClaimType = "IFR" | "CR" | "CFR";

export const CLAIM_TYPE_LABEL: Record<ClaimType, string> = {
  IFR: "Individual Forest Rights",
  CR: "Community Rights",
  CFR: "Community Forest Resource",
};

export const STATUSES = [
  "Submitted",
  "Under Verification",
  "Gram Sabha Approved",
  "SDLC Review",
  "DLC Approved",
  "Title Granted",
  "Rejected",
] as const;

export type ClaimStatus = (typeof STATUSES)[number];

export type Claim = {
  id: string;
  claimant: string;
  gender: "F" | "M";
  claimType: ClaimType;
  state: string;
  district: string;
  block: string;
  village: string;
  community: string;
  areaClaimedHa: number;
  areaGrantedHa: number | null;
  status: ClaimStatus;
  submittedOn: string; // ISO date
  lastUpdatedOn: string;
  daysInCurrentStage: number;
  officer: string;
  gramSabhaResolution: boolean;
  surveyCompleted: boolean;
  documentsComplete: boolean;
  lat: number;
  lng: number;
};

/* ---------------- deterministic PRNG ---------------- */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_F = ["Sita", "Radha", "Phulmani", "Lakshmi", "Budhni", "Sukhmani", "Jamuna", "Kanchan", "Devki", "Sarita"];
const FIRST_M = ["Ramlal", "Budhram", "Sukhdev", "Mangal", "Jaipal", "Hiralal", "Sonu", "Birsa", "Ganpat", "Dhansingh"];
const LAST = ["Baiga", "Gond", "Bhil", "Munda", "Oraon", "Santhal", "Korku", "Kondh", "Warli", "Koya"];
const COMMUNITIES = ["Gond", "Baiga", "Bhil", "Munda", "Oraon", "Santhal", "Kondh", "Warli", "Koya", "Korku"];
const VILLAGE_A = ["Bara", "Chhota", "Nava", "Rani", "Dev", "Sal", "Mahua", "Kusum", "Tendu", "Amba"];
const VILLAGE_B = ["pani", "gaon", "tola", "para", "khera", "beda", "guda", "palli", "toli", "dih"];
const OFFICERS = [
  "R. Meshram (SDLC)",
  "A. Patnaik (DLC)",
  "S. Kujur (FRC)",
  "M. Rathod (SDLC)",
  "V. Nayak (DLC)",
  "P. Tirkey (FRC)",
  "K. Bhagat (SDLC)",
  "N. Chauhan (DLC)",
];

function pick<T>(r: () => number, arr: T[]): T {
  return arr[Math.floor(r() * arr.length)]!;
}

const DAY = 86400000;
export const REFERENCE_DATE = new Date("2026-08-31T00:00:00Z");

function iso(d: number) {
  return new Date(d).toISOString().slice(0, 10);
}

/** District-level "personality" so anomalies cluster realistically. */
const DISTRICT_PROFILE: Record<string, { reject: number; slow: number; sloppy: number }> = {
  Kandhamal: { reject: 0.42, slow: 0.55, sloppy: 0.3 },
  Gadchiroli: { reject: 0.08, slow: 0.15, sloppy: 0.05 },
  Jhabua: { reject: 0.38, slow: 0.5, sloppy: 0.28 },
  Surguja: { reject: 0.3, slow: 0.45, sloppy: 0.22 },
  Koraput: { reject: 0.26, slow: 0.4, sloppy: 0.2 },
  Bastar: { reject: 0.12, slow: 0.2, sloppy: 0.08 },
};

function profile(d: string) {
  return DISTRICT_PROFILE[d] ?? { reject: 0.16, slow: 0.28, sloppy: 0.12 };
}

function generate(): Claim[] {
  const r = mulberry32(20260904);
  const claims: Claim[] = [];
  const total = 860;

  for (let i = 0; i < total; i++) {
    const geo = ALL_DISTRICTS[Math.floor(r() * ALL_DISTRICTS.length)]!;
    const p = profile(geo.district);
    const female = r() < 0.42;
    const claimant = `${pick(r, female ? FIRST_F : FIRST_M)} ${pick(r, LAST)}`;
    const typeRoll = r();
    const claimType: ClaimType = typeRoll < 0.66 ? "IFR" : typeRoll < 0.86 ? "CR" : "CFR";

    const submitted = REFERENCE_DATE.getTime() - Math.floor(r() * 1500 + 40) * DAY;

    // Status distribution shaped by district profile
    let status: ClaimStatus;
    const s = r();
    if (s < p.reject) status = "Rejected";
    else if (s < p.reject + 0.24) status = "Title Granted";
    else if (s < p.reject + 0.36) status = "DLC Approved";
    else if (s < p.reject + 0.5) status = "SDLC Review";
    else if (s < p.reject + 0.68) status = "Gram Sabha Approved";
    else if (s < p.reject + 0.86) status = "Under Verification";
    else status = "Submitted";

    const stageDays = Math.floor(
      (r() < p.slow ? 300 + r() * 620 : 15 + r() * 240) *
        (status === "Title Granted" || status === "Rejected" ? 0.2 : 1),
    );
    const lastUpdated = Math.min(
      REFERENCE_DATE.getTime(),
      Math.max(submitted, REFERENCE_DATE.getTime() - stageDays * DAY),
    );

    const areaClaimedHa =
      claimType === "IFR"
        ? Math.round((0.4 + r() * (r() < 0.06 ? 8 : 3.4)) * 100) / 100
        : Math.round((10 + r() * 380) * 100) / 100;

    const terminal = status === "Title Granted" || status === "DLC Approved";
    let areaGrantedHa: number | null = terminal
      ? Math.round(areaClaimedHa * (0.6 + r() * 0.45) * 100) / 100
      : null;
    // rare data-entry anomaly: granted exceeds claimed
    if (terminal && r() < 0.03) areaGrantedHa = Math.round(areaClaimedHa * (1.1 + r()) * 100) / 100;

    const sloppy = r() < p.sloppy;
    const gramSabhaResolution = sloppy ? r() > 0.55 : r() > 0.05;
    const surveyCompleted = sloppy ? r() > 0.45 : r() > 0.12;
    const documentsComplete = sloppy ? r() > 0.4 : r() > 0.1;

    claims.push({
      id: `FRA/${geo.state.slice(0, 2).toUpperCase()}/${new Date(submitted).getFullYear()}/${String(1000 + i)}`,
      claimant,
      gender: female ? "F" : "M",
      claimType,
      state: geo.state,
      district: geo.district,
      block: `${pick(r, VILLAGE_A)} Block`,
      village: `${pick(r, VILLAGE_A)}${pick(r, VILLAGE_B)}`,
      community: pick(r, COMMUNITIES),
      areaClaimedHa,
      areaGrantedHa,
      status,
      submittedOn: iso(submitted),
      lastUpdatedOn: iso(lastUpdated),
      daysInCurrentStage: Math.round((REFERENCE_DATE.getTime() - lastUpdated) / DAY),
      officer: pick(r, OFFICERS),
      gramSabhaResolution,
      surveyCompleted,
      documentsComplete,
      lat: geo.center[0] + (r() - 0.5) * 0.9,
      lng: geo.center[1] + (r() - 0.5) * 0.9,
    });
  }

  // Seed a few explicit duplicate-claimant scenarios for the demo
  for (let k = 0; k < 6; k++) {
    const src = claims[k * 37]!;
    claims.push({
      ...src,
      id: `${src.id}-D`,
      status: k % 2 === 0 ? "Under Verification" : "SDLC Review",
      areaGrantedHa: null,
      lat: src.lat + 0.02,
      lng: src.lng + 0.02,
    });
  }

  return claims;
}

export const CLAIMS: Claim[] = generate();

export const STATE_NAMES = STATES.map((s) => s.state);
