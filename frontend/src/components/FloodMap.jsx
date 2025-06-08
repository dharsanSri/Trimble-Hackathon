// src/components/FloodMap.jsx
import React, { useEffect, useRef } from "react";

const riskColorMap = {
  High: "#FF0000",
  Moderate: "#FFA500",
  Low: "#00FF00",
};

export default function FloodMap({ geoJson }) {
  const mapRef = useRef(null);
  const googleMap = useRef(null);
  const geoJsonLayer = useRef(null);

  useEffect(() => {
    if (!window.google) {
      console.error("Google Maps JS API not loaded");
      return;
    }

    if (!mapRef.current) return;

    if (!googleMap.current) {
      googleMap.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 11.0, lng: 79.0 },
        zoom: 8,
      });
    }

    if (geoJsonLayer.current) {
      geoJsonLayer.current.setMap(null);
    }

    geoJsonLayer.current = new window.google.maps.Data({ map: googleMap.current });

    geoJsonLayer.current.addGeoJson(geoJson);

    geoJsonLayer.current.setStyle((feature) => {
      const risk = feature.getProperty("risk_level");
      return {
        fillColor: riskColorMap[risk] || "#888",
        strokeColor: riskColorMap[risk] || "#555",
        strokeWeight: 2,
        fillOpacity: 0.5,
      };
    });
  }, [geoJson]);

  return <div ref={mapRef} style={{ height: "400px", width: "100%" }} />;
}
