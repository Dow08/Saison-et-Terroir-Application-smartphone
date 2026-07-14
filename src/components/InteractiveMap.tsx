import { useState, useEffect, useRef } from "react";
import { Compass, Map as MapIcon, Milestone, ZoomIn, ZoomOut, Globe, ExternalLink } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Activity } from "../types";

interface InteractiveMapProps {
  activities: Activity[];
  selectedActivityId: string | null;
  onSelectActivity: (id: string) => void;
  centerName: string;
  darkMode?: boolean;
  userCoords?: { lat: number; lng: number } | null;
}

export default function InteractiveMap({
  activities,
  selectedActivityId,
  onSelectActivity,
  centerName,
  darkMode = true,
  userCoords = null
}: InteractiveMapProps) {
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 46.2276, lng: 2.2137 });
  const [mapZoom, setMapZoom] = useState<number>(12);

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Sync center and zoom state with selection
  useEffect(() => {
    if (selectedActivityId) {
      const active = activities.find((a) => a.id === selectedActivityId);
      if (active) {
        setMapCenter({ lat: active.lat, lng: active.lng });
        setMapZoom(14);
      }
    } else if (activities.length > 0) {
      // Default center is the average coordinates of all returned activities
      const avgLat = activities.reduce((sum, a) => sum + a.lat, 0) / activities.length;
      const avgLng = activities.reduce((sum, a) => sum + a.lng, 0) / activities.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
      setMapZoom(12);
    }
  }, [selectedActivityId, activities]);

  // Haversine formula to compute distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Color mapping for pins based on activity category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Nature":
        return "#10b981"; // Emerald
      case "Culture":
        return "#8b5cf6"; // Violet
      case "Gastronomy":
        return "#f59e0b"; // Amber
      case "Sport":
        return "#ef4444"; // Rose/Red
      case "Relaxation":
        return "#06b6d4"; // Cyan
      default:
        return "#f59e0b";
    }
  };

  // Initialize & synchronize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create the leaflet map once
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapContainerRef.current, {
        center: [mapCenter.lat, mapCenter.lng],
        zoom: mapZoom,
        zoomControl: false, // Custom buttons are placed
        attributionControl: false,
      });

      // Standard OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(leafletMapRef.current);

      markersGroupRef.current = L.layerGroup().addTo(leafletMapRef.current);
    }

    const map = leafletMapRef.current;
    const markersGroup = markersGroupRef.current;

    // Remove existing markers
    if (markersGroup) {
      markersGroup.clearLayers();
    }

    // Add activity markers to Leaflet Map
    activities.forEach((act) => {
      const isSelected = selectedActivityId === act.id;
      const pinColor = getCategoryColor(act.category);
      const dist = userCoords
        ? calculateDistance(userCoords.lat, userCoords.lng, act.lat, act.lng)
        : null;

      const markerInnerHtml = isSelected
        ? '<div style="position: absolute; width: 8px; height: 8px; border-radius: 50%; background-color: #ffffff; top: 9px; left: 13px; box-shadow: 0 1px 3px rgba(0,0,0,0.45);"></div>'
        : '';

      // HTML custom pin
      const svgIcon = L.divIcon({
        className: "custom-leaflet-pin-wrapper",
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; transform: translate(-17px, -34px);">
            <svg width="34" height="34" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 2C9.5 2 5 6.5 5 12C5 17.5 15 28 15 28C15 28 25 17.5 25 12C25 6.5 20.5 2 15 2ZM15 16C12.8 16 11 14.2 11 12C11 9.8 12.8 8 15 8C17.2 8 19 9.8 19 12C19 14.2 17.2 16 15 16Z" 
                fill="${pinColor}" 
                stroke="${isSelected ? "#000000" : "#ffffff"}" 
                stroke-width="${isSelected ? "2.5" : "1.2"}"
              />
            </svg>
            ${markerInnerHtml}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      const marker = L.marker([act.lat, act.lng], { icon: svgIcon });

      // Create detailed info cards inside Leaflet Popup
      const address = "📍 " + act.name + ", " + centerName;
      const distanceText = dist !== null
        ? `🏃 <strong>Distance :</strong> ${dist.toFixed(1)} km de vous`
        : "📍 <em>Activez la géolocalisation pour voir les km</em>";

      const websiteBtn = act.website
        ? `<a href="${act.website}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; margin-top: 8px; padding: 6px 12px; background-color: #f59e0b; color: #000000; font-weight: 800; font-size: 10px; text-decoration: none; border-radius: 6px; box-sizing: border-box; transition: background-color 0.2s;">
            Visiter le site officiel ↗
           </a>`
        : "";

      const gmapsBtn = `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.name + " " + centerName)}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; margin-top: 4px; padding: 6px 12px; background-color: #f1f5f9; color: #1e293b; font-weight: 800; font-size: 10px; text-decoration: none; border-radius: 6px; box-sizing: border-box; border: 1px solid #cbd5e1; transition: background-color 0.2s;">
          Voir sur Google Maps ↗
         </a>`;

      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 11px; line-height: 1.4; color: #1e293b; min-width: 200px; padding: 2px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="font-size: 8.5px; font-weight: bold; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; color: #ffffff; background-color: ${pinColor}; letter-spacing: 0.05em;">
              ${act.category}
            </span>
            <span style="font-weight: bold; color: #d97706; font-size: 11px; display: flex; align-items: center; gap: 2px;">
              ★ ${act.googleReviews?.rating || "4.5"}
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: bold; color: #0f172a; margin: 0 0 4px 0; font-family: Georgia, serif; font-style: italic; leading-snug: true;">
            ${act.name}
          </h4>
          <p style="margin: 0 0 8px 0; color: #475569; font-weight: 500;">
            ${address}
          </p>
          <div style="padding: 6px 8px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 8px;">
            ${distanceText}
          </div>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            ${websiteBtn}
            ${gmapsBtn}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false, minWidth: 200 });

      marker.on("click", () => {
        onSelectActivity(act.id);
      });

      if (markersGroup) {
        marker.addTo(markersGroup);
      }

      // If selected, auto open popup and center map
      if (isSelected) {
        setTimeout(() => {
          marker.openPopup();
          map.setView([act.lat, act.lng], 14, { animate: true });
        }, 150);
      }
    });

    // Handle User Location marker
    if (userCoords) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      const userIcon = L.divIcon({
        className: "custom-leaflet-user-pin",
        html: `
          <div style="position: relative; width: 18px; height: 18px; background-color: #3b82f6; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.45);">
            <div style="position: absolute; inset: -4px; border-radius: 50%; background-color: #3b82f6; opacity: 0.35; transform: scale(1.4); animation: pulse 1.8s infinite;"></div>
          </div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
        .bindPopup("<strong>Votre position</strong>")
        .addTo(map);
    }

  }, [activities, selectedActivityId, userCoords]);

  // Map viewport syncer for Leaflet
  useEffect(() => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([mapCenter.lat, mapCenter.lng], mapZoom, { animate: true });
    }
  }, [mapCenter, mapZoom]);

  // Color theme styles
  const themeStyles = {
    containerBg: darkMode ? "bg-[#0d0d0d] border-white/10" : "bg-white border-slate-200/80 shadow-md",
    mapCanvasBg: darkMode ? "bg-[#050505] border-white/10" : "bg-[#fcfbf7] border-slate-200",
    headerLabel: darkMode ? "text-slate-400" : "text-slate-500",
    headerCenter: darkMode ? "text-amber-500" : "text-amber-600",
  };

  // Zoom helpers
  const handleZoomIn = () => {
    setMapZoom((prev) => Math.min(18, prev + 1));
  };

  const handleZoomOut = () => {
    setMapZoom((prev) => Math.max(2, prev - 1));
  };

  return (
    <div
      id="interactive-map-container"
      className={`rounded-3xl p-5 relative overflow-hidden transition-all duration-300 border ${themeStyles.containerBg}`}
    >
      {/* Map Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 text-xs font-medium">
        <span className="font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-slate-500">
          <Compass className="w-4 h-4 text-amber-500 animate-spin-slow shrink-0" />
          Carte interactive
        </span>

        <div className="flex items-center gap-3">
          <span className={`font-serif italic font-semibold flex items-center gap-1 text-[13px] ${themeStyles.headerCenter}`}>
            <MapIcon className="w-3.5 h-3.5" />
            {centerName || "Région explorée"}
          </span>
        </div>
      </div>

      {/* Map Stage Canvas */}
      <div className={`relative h-[360px] rounded-2xl overflow-hidden border transition-all duration-300 ${themeStyles.mapCanvasBg}`}>
        <div className="w-full h-full relative" style={{ filter: "none" }}>
          <div
            ref={mapContainerRef}
            className="w-full h-full"
            style={{ zIndex: 1, backgroundColor: "#f1f5f9" }}
          />

          {/* Custom Overlay indicating standard interactive map mode */}
          <div className="absolute top-3 left-3 px-2.5 py-1.5 bg-white/95 dark:bg-[#0d0d0d]/95 border border-slate-250 dark:border-white/10 rounded-xl text-[10px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 z-10 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Format Libre (OpenStreetMap) Actif</span>
          </div>
        </div>

        {/* Float Control Buttons (Shared Zoom Controllers) */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-10">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-xl border text-slate-700 dark:text-slate-200 bg-white/95 dark:bg-black/85 hover:bg-slate-100 dark:hover:bg-white/10 border-slate-200 dark:border-white/10 shadow-sm transition-all"
            aria-label="Zoomer"
          >
            <ZoomIn className="w-4 h-4 text-amber-500" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-xl border text-slate-700 dark:text-slate-200 bg-white/95 dark:bg-black/85 hover:bg-slate-100 dark:hover:bg-white/10 border-slate-200 dark:border-white/10 shadow-sm transition-all"
            aria-label="Dézoomer"
          >
            <ZoomOut className="w-4 h-4 text-amber-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
