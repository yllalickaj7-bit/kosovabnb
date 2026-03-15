import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
  lat: number;
  lng: number;
  title?: string;
}

export const LeafletMap = ({ lat, lng, title }: LeafletMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([lat, lng], 13);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="background: linear-gradient(to right, #E61E4D, #D70466); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    L.marker([lat, lng], { icon }).addTo(map).bindPopup(title || "Vendndodhja");

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [lat, lng, title]);

  return <div ref={mapRef} className="w-full h-[400px] rounded-2xl overflow-hidden z-0" />;
};
