"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// Only require Leaflet on the client side
let L;
if (typeof window !== "undefined") {
  L = require("leaflet");
}

export default function Map() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!L || !mapRef.current) return;

    const LONDON_CENTER = [51.5074, -0.1278];
    const ZOOM_LEVEL = 13;

    // Fix Leaflet's default icon path issues
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "/marker-icon.png",
      iconRetinaUrl: "/marker-icon-2x.png",
      shadowUrl: "/marker-shadow.png",
    });

    // Initialize the map
    const map = L.map(mapRef.current).setView(LONDON_CENTER, ZOOM_LEVEL);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add a marker
    L.marker(LONDON_CENTER).addTo(map).bindPopup(`
        <div class="text-center">
          <h3 class="font-semibold">SearchPro London Office</h3>
          <p class="text-sm text-gray-600">
            123 Business Street<br/>
            London, SW1A 1AA
          </p>
        </div>
      `);

    // Force the map to update its size
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    // Cleanup on unmount
    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        height: "400px",
        width: "100%",
        position: "relative",
        zIndex: 0,
      }}
    />
  );
}
