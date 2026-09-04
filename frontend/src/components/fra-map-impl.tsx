import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useCallback } from "react";
import type { PathOptions, Layer } from "leaflet";
import type { RegionStat } from "@/data/analytics";
import indiaGeoData from "@/data/india_states.json";

// Precise geographic centers and recommended zoom for all Indian states and UTs
const STATE_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  "Madhya Pradesh": { center: [23.97, 78.42], zoom: 6 },
  "Odisha": { center: [20.19, 84.44], zoom: 6 },
  "Chhattisgarh": { center: [20.94, 82.32], zoom: 6 },
  "Jharkhand": { center: [23.65, 85.65], zoom: 7 },
  "Maharashtra": { center: [18.82, 76.78], zoom: 6 },
  "Telangana": { center: [17.88, 79.28], zoom: 7 },
  "Gujarat": { center: [22.42, 71.29], zoom: 6 },
  "Andhra Pradesh": { center: [15.9, 80.76], zoom: 6 },
  "Rajasthan": { center: [26.63, 73.88], zoom: 6 },
  "Karnataka": { center: [15.02, 76.34], zoom: 6 },
  "West Bengal": { center: [24.35, 87.85], zoom: 6 },
  "Kerala": { center: [10.54, 76.14], zoom: 7 },
  "Tripura": { center: [23.74, 91.74], zoom: 8 },
  "Assam": { center: [26.05, 92.86], zoom: 6 },
  "Arunachal Pradesh": { center: [28.06, 94.48], zoom: 6 },
  "Bihar": { center: [25.9, 85.8], zoom: 6 },
  "Goa": { center: [15.35, 74.01], zoom: 9 },
  "Himachal Pradesh": { center: [31.82, 77.3], zoom: 7 },
  "Jammu & Kashmir": { center: [33.7, 75.09], zoom: 6 },
  "Ladakh": { center: [34.71, 76.43], zoom: 6 },
  "Manipur": { center: [24.76, 93.87], zoom: 8 },
  "Meghalaya": { center: [25.57, 91.31], zoom: 8 },
  "Mizoram": { center: [23.23, 92.85], zoom: 8 },
  "Nagaland": { center: [26.12, 94.28], zoom: 8 },
  "Punjab": { center: [31.03, 75.41], zoom: 7 },
  "Sikkim": { center: [27.6, 88.47], zoom: 8 },
  "Tamil Nadu": { center: [10.82, 78.29], zoom: 6 },
  "Uttar Pradesh": { center: [27.14, 80.86], zoom: 6 },
  "Uttarakhand": { center: [30.09, 79.31], zoom: 7 },
  "Haryana": { center: [29.29, 76.04], zoom: 7 },
  "Delhi": { center: [28.64, 77.09], zoom: 9 },
};

function districtFillColor(rate: number) {
  if (rate >= 30) return "#047857";
  if (rate >= 20) return "#059669";
  return "#10b981";
}

function Recenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const [lat, lng] = center;
  const initializedRef = useRef(false);
  const lastTarget = useRef({ lat, lng, zoom });

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      lastTarget.current = { lat, lng, zoom };
      return;
    }
    if (
      lastTarget.current.lat !== lat ||
      lastTarget.current.lng !== lng ||
      lastTarget.current.zoom !== zoom
    ) {
      lastTarget.current = { lat, lng, zoom };
      map.flyTo([lat, lng], zoom, { duration: 0.8 });
    }
  }, [lat, lng, zoom, map]);

  return null;
}

const DEFAULT_MAP_CENTER: [number, number] = [22.8, 80.5];

export default function FraMapClient({
  states,
  districts,
  selectedState,
  onSelectState,
  onSelectDistrict,
}: {
  states: RegionStat[];
  districts: RegionStat[];
  selectedState: string | null;
  onSelectState: (name: string | null) => void;
  onSelectDistrict: (name: string) => void;
}) {
  const geoJsonRef = useRef<any>(null);
  const selectedStateRef = useRef(selectedState);
  selectedStateRef.current = selectedState;
  const onSelectStateRef = useRef(onSelectState);
  onSelectStateRef.current = onSelectState;
  const statesRef = useRef(states);
  statesRef.current = states;

  const focus = selectedState ? STATE_CENTERS[selectedState] : null;
  const center: [number, number] = focus ? focus.center : DEFAULT_MAP_CENTER;
  const zoom = focus ? focus.zoom : 5;

  const getFeatureStyle = useCallback(
    (feature: any): PathOptions => {
      const stateName = feature?.properties?.ST_NM;
      const stat = statesRef.current.find((x) => x.name === stateName);
      const isSel = selectedStateRef.current === stateName;

      if (isSel) {
        return {
          color: "#022c22",
          weight: 3.5,
          opacity: 1,
          fillColor: "#047857",
          fillOpacity: 0.65,
        };
      }

      if (stat) {
        const rate = stat.titleRate;
        let fill = "#34d399";
        let border = "#059669";
        if (rate >= 30) {
          fill = "#047857";
          border = "#064e3b";
        } else if (rate >= 20) {
          fill = "#10b981";
          border = "#047857";
        }
        return {
          color: border,
          weight: 1.8,
          opacity: 0.95,
          fillColor: fill,
          fillOpacity: 0.42,
        };
      }

      return {
        color: "#059669",
        weight: 1.2,
        opacity: 0.75,
        fillColor: "#a7f3d0",
        fillOpacity: 0.16,
      };
    },
    [],
  );

  // Smooth in-place style updates without tearing down or remounting GeoJSON layers
  useEffect(() => {
    if (geoJsonRef.current && typeof geoJsonRef.current.setStyle === "function") {
      geoJsonRef.current.setStyle(getFeatureStyle);
    }
  }, [selectedState, states, getFeatureStyle]);

  const onEachFeature = useCallback((feature: any, layer: Layer) => {
    const stateName = feature?.properties?.ST_NM;
    const stat = statesRef.current.find((x) => x.name === stateName);

    const tooltipHtml = `
      <div style="font-family: ui-sans-serif, system-ui, sans-serif; min-width: 175px; padding: 2px;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #d1fae5; padding-bottom: 4px; margin-bottom: 5px;">
          <span style="font-weight: 700; color: #064e3b; font-size: 13px;">${stateName}</span>
          ${stat ? `<span style="background-color: #d1fae5; color: #047857; font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 9999px;">${stat.titleRate.toFixed(1)}% Titled</span>` : `<span style="color: #6b7280; font-size: 10px;">Territory</span>`}
        </div>
        ${stat ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; color: #065f46;">
            <div>Total Claims: <b>${(stat.total ?? 0).toLocaleString()}</b></div>
            <div>Titled: <b>${(stat.titled ?? 0).toLocaleString()}</b></div>
            <div>Area Titled: <b>${Math.round(stat.areaGranted ?? 0).toLocaleString()} ha</b></div>
            <div>Anomalies: <b style="color: ${(stat.flagged ?? 0) > 0 ? '#b45309' : '#059669'}">${stat.flagged ?? 0}</b></div>
          </div>
          <div style="margin-top: 6px; font-size: 10px; color: #047857; font-weight: 600; text-align: center; background: #ecfdf5; padding: 2px 4px; border-radius: 4px;">
            Click to filter dashboard
          </div>
        ` : `
          <div style="font-size: 11px; color: #4b5563;">Official administrative boundary. No active demo claims registered.</div>
        `}
      </div>
    `;

    layer.bindTooltip(tooltipHtml, {
      sticky: false,
      direction: "auto",
      opacity: 0.98,
      className: "fra-state-tooltip",
    });

    layer.on({
      click: () => {
        const cur = selectedStateRef.current;
        onSelectStateRef.current(cur === stateName ? null : stateName);
      },
      mouseover: (e: any) => {
        const l = e.target;
        if (l && typeof l.setStyle === "function") {
          l.setStyle({
            weight: 3,
            color: "#022c22",
            fillOpacity: 0.65,
          });
        }
      },
      mouseout: (e: any) => {
        const l = e.target;
        if (l && typeof l.setStyle === "function") {
          l.setStyle(getFeatureStyle(feature));
        }
      },
    });
  }, [getFeatureStyle]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      preferCanvas={true}
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem", backgroundColor: "#f0fdf4" }}
    >
      <Recenter center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <GeoJSON
        key="india-geojson-static"
        ref={geoJsonRef}
        data={indiaGeoData as any}
        style={getFeatureStyle}
        onEachFeature={onEachFeature}
      />

      {districts.map((d) => (
        <CircleMarker
          key={d.name}
          center={d.center}
          radius={Math.max(7, Math.min(22, Math.sqrt(d.total) * 1.9))}
          pane="markerPane"
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: districtFillColor(d.titleRate),
            fillOpacity: 0.9,
          }}
          eventHandlers={{ click: () => onSelectDistrict(d.name) }}
        >
          <Tooltip sticky={false} direction="top" offset={[0, -10]} className="fra-district-tooltip">
            <div style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", padding: "2px", minWidth: "155px" }}>
              <div style={{ fontWeight: 700, color: "#064e3b", fontSize: "12px", display: "flex", justifyContent: "space-between" }}>
                <span>{d.name} District</span>
                <span style={{ color: "#047857", fontWeight: 600 }}>{d.titleRate.toFixed(1)}%</span>
              </div>
              <div style={{ fontSize: "11px", color: "#065f46", marginTop: "3px" }}>
                {(d.total ?? 0).toLocaleString()} claims · {d.flagged ?? 0} flagged
              </div>
              <div style={{ marginTop: "4px", fontSize: "10px", color: "#059669", fontWeight: 600 }}>
                Click to inspect district claims
              </div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

