"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

type MapPoint = {
  lat: number;
  lng: number;
  label?: string;
  kind?: "EXCEPTION" | "HOME";
};

interface SimpleMapProps {
  points: MapPoint[];
}

export default function SimpleMap({ points }: SimpleMapProps) {
  if (!points || points.length === 0) return null;

  const center: LatLngExpression = [points[0].lat, points[0].lng];

  return (
    <MapContainer
      center={center}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {points.map((p, i) => {
        const pos: LatLngExpression = [p.lat, p.lng];
        const label =
          p.label ||
          (p.kind === "HOME"
            ? "Client Home"
            : p.kind === "EXCEPTION"
            ? "Exception Location"
            : `Point ${i + 1}`);

        return (
          <Marker key={i} position={pos}>
            <Popup>{label}</Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
// "use client";

// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import type { LatLngExpression } from "leaflet";
// import "leaflet/dist/leaflet.css";

// type MapPoint = {
//   lat: number;
//   lng: number;
// };

// interface SimpleMapProps {
//   points: MapPoint[];
// }

// export default function SimpleMap({ points }: SimpleMapProps) {
//   if (!points || points.length === 0) return null;

//   // Convert to Leaflet-friendly type
//   const center: LatLngExpression = [points[0].lat, points[0].lng];

//   return (
//     <MapContainer
//       center={center}
//       zoom={15}
//       style={{ height: "100%", width: "100%" }}
//       scrollWheelZoom={false}
//     >
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         attribution="&copy; OpenStreetMap contributors"
//       />

//       {points.map((p, i) => {
//         const pos: LatLngExpression = [p.lat, p.lng];
//         return (
//           <Marker key={i} position={pos}>
//             <Popup>{i === 0 ? "GPS Exception" : `Point ${i + 1}`}</Popup>
//           </Marker>
//         );
//       })}
//     </MapContainer>
//   );
// }
