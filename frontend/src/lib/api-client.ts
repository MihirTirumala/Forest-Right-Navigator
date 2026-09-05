// src/lib/api-client.ts
import type { Claim, ClaimStatus } from "@/data/claims";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/claims/api";

export interface BackendClaim {
  id: number;
  claim_id: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  claim_type: "IFR" | "CFR" | "CR";
  area_claimed: number;
  area_recorded: number;
  submission_date: string | null;
  decision_date: string | null;
  status: "Approved" | "Rejected" | "Pending";
  land_record_match: boolean;
  created_at: string | null;
}

export interface BackendClaimsResponse {
  total: number;
  limit: number;
  offset: number;
  claims: BackendClaim[];
}

export interface DistrictSummary {
  state: string;
  district: string;
  total_claims: number;
  approved: number;
  rejected: number;
  pending: number;
  mismatched_land_records: number;
  avg_processing_days: number;
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
}

export interface NationalOverview {
  total_claims: number;
  approved_claims: number;
  rejected_claims: number;
  pending_claims: number;
  mismatched_land_records: number;
  total_claimed_area: number;
  total_recorded_area: number;
  avg_processing_days: number;
  districts_count: number;
  high_risk_districts_count: number;
  medium_risk_districts_count: number;
  low_risk_districts_count: number;
}

export interface DistrictAiAudit {
  state: string;
  district: string;
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  avg_processing_days: number;
  total_claims: number;
  approved: number;
  rejected: number;
  pending: number;
  mismatched_land_records: number;
  total_claimed_area: number;
  total_recorded_area: number;
  ai_summary: {
    anomaly_detected: boolean;
    primary_root_cause: string;
    audit_briefing: string;
    recommended_action: string;
  };
}

export function mapBackendClaimToFrontend(b: BackendClaim): Claim {
  const isApproved = b.status === "Approved";
  const isRejected = b.status === "Rejected";
  const statusFormatted: ClaimStatus = isApproved
    ? "Title Granted"
    : isRejected
    ? "Rejected"
    : "SDLC Review";

  const subDate = b.submission_date ? new Date(b.submission_date) : new Date();
  const decDate = b.decision_date ? new Date(b.decision_date) : new Date();
  const diffDays = Math.max(
    0,
    Math.round((decDate.getTime() - subDate.getTime()) / (1000 * 3600 * 24))
  );

  return {
    id: b.claim_id,
    claimant: `Claimant ${b.claim_id}`,
    gender: "M",
    claimType: b.claim_type,
    state: b.state,
    district: b.district,
    block: `${b.district} Block`,
    village: `${b.district} Gram Sabha`,
    community: "Forest Dweller Community",
    areaClaimedHa: b.area_claimed,
    areaGrantedHa: isApproved ? b.area_recorded : null,
    status: statusFormatted,
    submittedOn: b.submission_date || new Date().toISOString().split("T")[0] || "",
    lastUpdatedOn: b.decision_date || new Date().toISOString().split("T")[0] || "",
    daysInCurrentStage: diffDays || (isApproved ? 15 : 120),
    officer: "District Officer",
    gramSabhaResolution: true,
    surveyCompleted: b.land_record_match,
    documentsComplete: true,
    lat: b.latitude,
    lng: b.longitude,
  };
}

export async function fetchDistricts(): Promise<DistrictSummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/districts/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.districts || [];
  } catch (err) {
    console.error("Failed to fetch districts:", err);
    return [];
  }
}

export async function fetchNationalOverview(): Promise<NationalOverview | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/overview/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch national overview:", err);
    return null;
  }
}

export async function fetchClaims(params?: {
  state?: string;
  district?: string;
  status?: string;
  claim_type?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<BackendClaimsResponse> {
  try {
    const query = new URLSearchParams();
    if (params?.state) query.set("state", params.state);
    if (params?.district) query.set("district", params.district);
    if (params?.status) query.set("status", params.status);
    if (params?.claim_type) query.set("claim_type", params.claim_type);
    if (params?.search) query.set("search", params.search);
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.offset) query.set("offset", params.offset.toString());

    const url = `${API_BASE_URL}/claims/?${query.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch claims:", err);
    return { total: 0, limit: 100, offset: 0, claims: [] };
  }
}

export async function fetchMappedClaims(): Promise<Claim[]> {
  const resp = await fetchClaims({ limit: 200 });
  if (resp && resp.claims && resp.claims.length > 0) {
    return resp.claims.map(mapBackendClaimToFrontend);
  }
  return [];
}

export async function fetchDistrictAiAudit(
  state: string,
  district: string
): Promise<DistrictAiAudit | null> {
  try {
    const url = `${API_BASE_URL}/district-audit/?state=${encodeURIComponent(
      state
    )}&district=${encodeURIComponent(district)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch district AI audit:", err);
    return null;
  }
}

export async function fetchClaimsGeoJson(state?: string, district?: string) {
  try {
    const query = new URLSearchParams();
    if (state) query.set("state", state);
    if (district) query.set("district", district);
    const res = await fetch(`${API_BASE_URL}/geojson/?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch GeoJSON:", err);
    return { type: "FeatureCollection", features: [] };
  }
}
