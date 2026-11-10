import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface TripStop {
  lat: number;
  lng: number;
  title: string;
}

/** Hartë me pika të numëruara dhe vijë rruge mes tyre (itinerari). */
export const TripMap = ({ stops }: { stops: TripStop[] }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || stops.length === 0) return;
    const map = L.map(ref.current);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const points: L.LatLngTuple[] = stops.map((s) => [s.lat, s.lng]);
    stops.forEach((s, i) => {
      const icon = L.divIcon({
        html: `<div style="background:linear-gradient(to right,#2D5BE3,#12297A);color:#fff;width:30px;height:30px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px">${i + 1}</div>`,
        className: "",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      const el = document.createElement("span");
      el.textContent = s.title; // textContent: asnjë HTML nga përmbajtja e AI
      L.marker([s.lat, s.lng], { icon }).addTo(map).bindPopup(el);
    });
    if (points.length > 1) L.polyline(points, { color: "#2D5BE3", weight: 3, dashArray: "6 8" }).addTo(map);
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 12 });
    return () => {
      map.remove();
    };
  }, [stops]);

  return <div ref={ref} className="w-full h-[360px] rounded-2xl overflow-hidden z-0" />;
};
