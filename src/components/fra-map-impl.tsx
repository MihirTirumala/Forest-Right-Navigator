import { MapContainer, TileLayer, Polygon, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { STATES } from "@/data/geo";
import type { RegionStat } from "@/data/analytics";

function bandColor(rate: number) {
  if (rate >= 30) return "#059669";
  if (rate >= 20) return "#eab308";
  return "#dc2626";
}

function Recenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

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
  const focus = selectedState ? STATES.find((s) => s.state === selectedState) : null;
  const center: [number, number] = focus ? focus.center : [21.5, 80.0];
  const zoom = focus ? 6 : 5;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
    >
      <Recenter center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {STATES.map((s) => {
        const stat = states.find((x) => x.name === s.state);
        const rate = stat?.titleRate ?? 0;
        const isSel = selectedState === s.state;
        return (
          <Polygon
            key={s.state}
            positions={s.ring}
            pathOptions={{
              color: isSel ? "#0f766e" : bandColor(rate),
              weight: isSel ? 3 : 1.5,
              fillColor: bandColor(rate),
              fillOpacity: stat ? (isSel ? 0.45 : 0.28) : 0.08,
            }}
            eventHandlers={{ click: () => onSelectState(isSel ? null : s.state) }}
          >
            <Tooltip sticky>
              <span className="text-xs">
                <strong>{s.state}</strong>
                <br />
                {stat ? `${stat.total} claims · ${stat.titleRate.toFixed(1)}% titled` : "no claims in filter"}
              </span>
            </Tooltip>
          </Polygon>
        );
      })}

      {districts.map((d) => (
        <CircleMarker
          key={d.name}
          center={d.center}
          radius={Math.max(6, Math.min(20, Math.sqrt(d.total) * 1.8))}
          pathOptions={{
            color: "#ffffff",
            weight: 1.5,
            fillColor: bandColor(d.titleRate),
            fillOpacity: 0.85,
          }}
          eventHandlers={{ click: () => onSelectDistrict(d.name) }}
        >
          <Tooltip>
            <span className="text-xs">
              <strong>{d.name}</strong>
              <br />
              {d.total} claims · {d.titleRate.toFixed(1)}% titled · {d.flagged} flagged
            </span>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
