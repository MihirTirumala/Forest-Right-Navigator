// Geographic reference data for the FRA Monitor demo.
// State boundaries follow realistic administrative border contours.

export type DistrictGeo = {
  district: string;
  state: string;
  center: [number, number];
};

export type StateGeo = {
  state: string;
  code: string;
  center: [number, number];
  /** Polygon ring coordinates [lat, lng][] following actual state borders */
  ring: [number, number][];
  districts: DistrictGeo[];
};

export const STATES: StateGeo[] = [
  {
    state: "Madhya Pradesh",
    code: "MP",
    center: [23.3, 78.4],
    ring: [
      [26.85, 78.05], [26.55, 78.85], [26.15, 79.25], [25.55, 79.62],
      [25.15, 80.25], [24.85, 81.15], [24.55, 82.25], [24.15, 82.85],
      [23.75, 82.65], [23.45, 81.95], [22.85, 81.55], [22.25, 81.05],
      [21.85, 80.35], [21.55, 79.65], [21.45, 78.85], [21.35, 77.85],
      [21.25, 76.85], [21.35, 75.85], [21.45, 74.85], [21.75, 74.35],
      [22.25, 74.25], [22.85, 74.45], [23.45, 74.65], [24.05, 75.25],
      [24.55, 75.65], [25.05, 76.55], [25.65, 77.15], [26.35, 77.55],
      [26.85, 78.05],
    ],
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
    ring: [
      [22.45, 86.25], [22.35, 87.15], [21.85, 87.35], [21.45, 86.95],
      [20.85, 86.85], [20.15, 86.55], [19.75, 85.85], [19.25, 85.05],
      [18.85, 84.55], [18.35, 84.05], [18.15, 83.25], [18.25, 82.45],
      [18.85, 81.95], [19.55, 82.15], [20.25, 82.45], [20.95, 82.65],
      [21.65, 83.15], [22.25, 83.35], [22.45, 84.45], [22.55, 85.45],
      [22.45, 86.25],
    ],
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
    ring: [
      [24.15, 83.35], [23.85, 83.85], [23.25, 84.15], [22.85, 83.65],
      [22.25, 83.35], [21.65, 83.15], [20.95, 82.65], [20.25, 82.45],
      [19.55, 82.15], [18.85, 81.95], [18.25, 81.65], [17.85, 81.25],
      [18.15, 80.75], [18.85, 80.45], [19.45, 80.55], [20.15, 80.75],
      [21.15, 81.05], [21.85, 81.35], [22.45, 81.65], [23.15, 82.05],
      [23.75, 82.65], [24.15, 83.35],
    ],
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
    ring: [
      [24.55, 83.65], [24.85, 84.55], [25.15, 85.65], [25.35, 86.85],
      [25.25, 87.55], [24.65, 87.85], [23.95, 87.15], [23.45, 86.85],
      [22.85, 86.85], [22.35, 86.55], [22.25, 85.75], [22.35, 84.85],
      [22.55, 84.15], [23.05, 83.95], [23.85, 83.85], [24.15, 83.35],
      [24.55, 83.65],
    ],
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
    ring: [
      [20.25, 72.85], [20.45, 73.15], [21.25, 73.65], [21.55, 74.45],
      [21.45, 75.85], [21.35, 77.85], [21.45, 78.85], [21.55, 79.65],
      [21.85, 80.35], [21.45, 80.55], [20.85, 80.65], [19.95, 80.45],
      [19.25, 80.15], [18.85, 79.85], [18.75, 78.65], [18.15, 77.55],
      [17.65, 76.85], [17.15, 75.85], [16.65, 75.15], [15.85, 74.35],
      [15.75, 73.75], [16.35, 73.45], [17.15, 73.25], [18.15, 72.95],
      [19.05, 72.82], [19.85, 72.75], [20.25, 72.85],
    ],
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
    ring: [
      [19.85, 78.45], [19.55, 79.25], [19.25, 79.85], [18.85, 80.25],
      [18.45, 80.75], [17.85, 80.95], [17.35, 80.45], [16.85, 80.15],
      [16.55, 79.45], [16.35, 78.65], [16.15, 77.85], [16.65, 77.35],
      [17.35, 77.45], [18.05, 77.65], [18.75, 77.85], [19.35, 78.15],
      [19.85, 78.45],
    ],
    districts: [
      { district: "Bhadradri", state: "Telangana", center: [17.6, 80.6] },
      { district: "Adilabad", state: "Telangana", center: [19.66, 78.53] },
    ],
  },
  {
    state: "Gujarat",
    code: "GJ",
    center: [22.3, 72.6],
    ring: [
      [24.72, 71.45], [24.45, 72.35], [24.15, 72.95], [23.65, 73.45],
      [23.08, 74.22], [22.55, 74.35], [21.85, 73.85], [21.25, 73.65],
      [20.45, 73.15], [20.25, 72.85], [20.85, 72.65], [21.45, 72.45],
      [21.75, 72.15], [21.05, 71.65], [20.75, 70.85], [21.25, 69.85],
      [21.85, 69.35], [22.45, 69.05], [22.85, 69.75], [23.05, 70.35],
      [22.85, 70.85], [23.15, 69.85], [23.45, 68.75], [23.85, 68.45],
      [24.25, 69.35], [24.55, 70.45], [24.72, 71.45],
    ],
    districts: [
      { district: "Dang", state: "Gujarat", center: [20.75, 73.68] },
      { district: "Narmada", state: "Gujarat", center: [21.87, 73.5] },
    ],
  },
  {
    state: "Andhra Pradesh",
    code: "AP",
    center: [16.3, 80.5],
    ring: [
      [18.85, 84.55], [18.35, 83.55], [17.85, 81.85], [17.35, 80.45],
      [16.85, 80.15], [16.55, 79.45], [16.15, 78.15], [15.45, 77.45],
      [14.75, 77.15], [14.05, 77.25], [13.45, 77.85], [13.15, 78.85],
      [13.25, 79.95], [13.75, 80.15], [14.45, 80.15], [15.25, 80.25],
      [16.05, 80.85], [16.85, 82.25], [17.55, 83.25], [18.25, 84.05],
      [18.85, 84.55],
    ],
    districts: [
      { district: "Alluri Sitharama Raju", state: "Andhra Pradesh", center: [17.9, 82.3] },
      { district: "Parvathipuram", state: "Andhra Pradesh", center: [18.78, 83.42] },
    ],
  },
  {
    state: "Rajasthan",
    code: "RJ",
    center: [26.5, 73.8],
    ring: [
      [29.95, 73.88], [30.15, 74.45], [29.62, 75.12], [28.95, 75.48],
      [28.45, 75.82], [28.18, 76.52], [27.75, 76.92], [27.35, 77.35],
      [26.85, 77.82], [26.68, 77.52], [26.45, 76.95], [26.15, 76.55],
      [25.55, 76.85], [24.95, 76.88], [24.55, 76.45], [24.15, 75.95],
      [24.05, 75.45], [23.85, 74.78], [23.45, 74.45], [23.08, 74.22],
      [23.35, 73.65], [23.85, 73.25], [24.25, 72.85], [24.55, 72.35],
      [24.72, 71.45], [25.15, 70.82], [25.65, 70.35], [26.25, 70.12],
      [26.85, 70.05], [27.45, 70.42], [27.95, 71.12], [28.55, 71.92],
      [29.15, 72.65], [29.65, 73.25], [29.95, 73.88],
    ],
    districts: [
      { district: "Udaipur", state: "Rajasthan", center: [24.58, 73.68] },
      { district: "Banswara", state: "Rajasthan", center: [23.54, 74.44] },
      { district: "Dungarpur", state: "Rajasthan", center: [23.84, 73.71] },
      { district: "Pratapgarh", state: "Rajasthan", center: [24.03, 74.78] },
    ],
  },
  {
    state: "Karnataka",
    code: "KA",
    center: [14.5, 75.8],
    ring: [
      [17.65, 76.85], [18.05, 77.45], [17.35, 77.45], [16.65, 77.35],
      [16.15, 77.45], [15.25, 76.95], [14.45, 76.85], [13.85, 77.35],
      [13.45, 77.85], [12.95, 78.25], [12.45, 77.65], [11.85, 77.15],
      [11.65, 76.45], [11.95, 75.85], [12.65, 74.95], [13.45, 74.65],
      [14.25, 74.35], [14.95, 74.15], [15.55, 74.25], [16.25, 74.75],
      [17.15, 75.65], [17.65, 76.85],
    ],
    districts: [
      { district: "Chamarajanagar", state: "Karnataka", center: [11.92, 76.94] },
      { district: "Kodagu", state: "Karnataka", center: [12.33, 75.8] },
      { district: "Uttara Kannada", state: "Karnataka", center: [14.8, 74.5] },
      { district: "Mysuru", state: "Karnataka", center: [12.29, 76.63] },
    ],
  },
  {
    state: "West Bengal",
    code: "WB",
    center: [23.8, 87.8],
    ring: [
      [27.15, 88.25], [27.05, 88.95], [26.75, 89.85], [26.35, 89.65],
      [26.15, 88.85], [25.45, 88.75], [24.85, 88.65], [24.15, 88.55],
      [23.55, 88.85], [22.85, 88.95], [22.25, 89.15], [21.65, 88.85],
      [21.55, 88.05], [21.65, 87.45], [21.85, 87.35], [22.35, 87.15],
      [22.85, 86.85], [23.45, 86.85], [23.95, 87.15], [24.65, 87.85],
      [25.25, 87.85], [25.85, 88.15], [26.55, 88.25], [27.15, 88.25],
    ],
    districts: [
      { district: "Alipurduar", state: "West Bengal", center: [26.49, 89.52] },
      { district: "Jalpaiguri", state: "West Bengal", center: [26.54, 88.71] },
      { district: "Purulia", state: "West Bengal", center: [23.33, 86.36] },
      { district: "Jhargram", state: "West Bengal", center: [22.45, 86.98] },
    ],
  },
  {
    state: "Kerala",
    code: "KL",
    center: [10.5, 76.5],
    ring: [
      [12.65, 74.95], [12.25, 75.35], [11.95, 75.85], [11.65, 76.45],
      [11.15, 76.75], [10.65, 76.95], [10.15, 77.15], [9.65, 77.25],
      [9.15, 77.25], [8.65, 77.25], [8.35, 77.05], [8.45, 76.85],
      [8.95, 76.55], [9.45, 76.35], [10.05, 76.15], [10.75, 75.85],
      [11.35, 75.55], [11.95, 75.25], [12.65, 74.95],
    ],
    districts: [
      { district: "Wayanad", state: "Kerala", center: [11.68, 76.13] },
      { district: "Idukki", state: "Kerala", center: [9.84, 76.97] },
      { district: "Palakkad", state: "Kerala", center: [10.78, 76.65] },
    ],
  },
  {
    state: "Tripura",
    code: "TR",
    center: [23.8, 91.6],
    ring: [
      [24.45, 92.15], [24.15, 92.35], [23.65, 92.25], [23.15, 92.15],
      [22.85, 91.85], [23.05, 91.45], [23.45, 91.25], [23.85, 91.25],
      [24.15, 91.45], [24.45, 91.85], [24.45, 92.15],
    ],
    districts: [
      { district: "Dhalai", state: "Tripura", center: [23.84, 91.85] },
      { district: "Khowai", state: "Tripura", center: [24.06, 91.6] },
    ],
  },
];

export const ALL_DISTRICTS: DistrictGeo[] = STATES.flatMap((s) => s.districts);

export function stateOf(name: string) {
  return STATES.find((s) => s.state === name);
}

