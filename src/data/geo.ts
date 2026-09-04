// Simplified / mock geographic reference data for the FRA Monitor demo.
// Boundaries are deliberately coarse polygons — SYNTHETIC, not survey-grade.

export type DistrictGeo = {
  district: string;
  state: string;
  center: [number, number];
};

export type StateGeo = {
  state: string;
  code: string;
  center: [number, number];
  /** coarse polygon ring [lat, lng][] */
  ring: [number, number][];
  districts: DistrictGeo[];
};

function box(
  lat: number,
  lng: number,
  dy: number,
  dx: number,
  jitter: number[],
): [number, number][] {
  // Slightly irregular polygon around a center so boundaries don't look like squares.
  const pts: [number, number][] = [
    [lat + dy, lng - dx],
    [lat + dy * 0.6, lng + dx * 0.5],
    [lat + dy * 0.1, lng + dx],
    [lat - dy * 0.5, lng + dx * 0.7],
    [lat - dy, lng + dx * 0.1],
    [lat - dy * 0.7, lng - dx * 0.6],
    [lat - dy * 0.1, lng - dx],
    [lat + dy * 0.5, lng - dx * 0.8],
  ];
  return pts.map(([a, b], i) => [
    a + (jitter[i % jitter.length] ?? 0) * 0.15,
    b + (jitter[(i + 3) % jitter.length] ?? 0) * 0.2,
  ]);
}

const J = [0.2, -0.35, 0.1, 0.4, -0.2, 0.3, -0.1];

export const STATES: StateGeo[] = [
  {
    state: "Madhya Pradesh",
    code: "MP",
    center: [23.3, 78.4],
    ring: box(23.3, 78.4, 2.6, 3.6, J),
    districts: [
      { district: "Mandla", state: "Madhya Pradesh", center: [22.6, 80.37] },
      { district: "Dindori", state: "Madhya Pradesh", center: [22.94, 81.08] },
      { district: "Betul", state: "Madhya Pradesh", center: [21.9, 77.9] },
      { district: "Jhabua", state: "Madhya Pradesh", center: [22.77, 74.59] },
    ],
  },
  {
    state: "Odisha",
    code: "OD",
    center: [20.6, 84.6],
    ring: box(20.6, 84.6, 2.2, 2.2, J),
    districts: [
      { district: "Mayurbhanj", state: "Odisha", center: [21.93, 86.44] },
      { district: "Kandhamal", state: "Odisha", center: [20.13, 84.01] },
      { district: "Koraput", state: "Odisha", center: [18.81, 82.71] },
    ],
  },
  {
    state: "Chhattisgarh",
    code: "CG",
    center: [21.0, 82.0],
    ring: box(21.0, 82.0, 2.4, 1.9, J),
    districts: [
      { district: "Bastar", state: "Chhattisgarh", center: [19.31, 81.96] },
      { district: "Surguja", state: "Chhattisgarh", center: [23.12, 83.19] },
      { district: "Kanker", state: "Chhattisgarh", center: [20.27, 81.49] },
    ],
  },
  {
    state: "Jharkhand",
    code: "JH",
    center: [23.6, 85.3],
    ring: box(23.6, 85.3, 1.5, 1.7, J),
    districts: [
      { district: "Khunti", state: "Jharkhand", center: [23.07, 85.28] },
      { district: "Gumla", state: "Jharkhand", center: [23.04, 84.54] },
      { district: "West Singhbhum", state: "Jharkhand", center: [22.57, 85.8] },
    ],
  },
  {
    state: "Maharashtra",
    code: "MH",
    center: [19.6, 76.0],
    ring: box(19.6, 76.0, 2.3, 3.0, J),
    districts: [
      { district: "Gadchiroli", state: "Maharashtra", center: [19.99, 80.0] },
      { district: "Nandurbar", state: "Maharashtra", center: [21.37, 74.24] },
      { district: "Palghar", state: "Maharashtra", center: [19.69, 72.77] },
    ],
  },
  {
    state: "Telangana",
    code: "TS",
    center: [17.9, 79.3],
    ring: box(17.9, 79.3, 1.6, 1.6, J),
    districts: [
      { district: "Bhadradri", state: "Telangana", center: [17.6, 80.6] },
      { district: "Adilabad", state: "Telangana", center: [19.66, 78.53] },
    ],
  },
  {
    state: "Gujarat",
    code: "GJ",
    center: [22.3, 72.6],
    ring: box(22.3, 72.6, 2.2, 2.0, J),
    districts: [
      { district: "Dang", state: "Gujarat", center: [20.75, 73.68] },
      { district: "Narmada", state: "Gujarat", center: [21.87, 73.5] },
    ],
  },
  {
    state: "Andhra Pradesh",
    code: "AP",
    center: [16.3, 80.5],
    ring: box(16.3, 80.5, 1.9, 1.9, J),
    districts: [
      { district: "Alluri Sitharama Raju", state: "Andhra Pradesh", center: [17.9, 82.3] },
      { district: "Parvathipuram", state: "Andhra Pradesh", center: [18.78, 83.42] },
    ],
  },
];

export const ALL_DISTRICTS: DistrictGeo[] = STATES.flatMap((s) => s.districts);

export function stateOf(name: string) {
  return STATES.find((s) => s.state === name);
}
