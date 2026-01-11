import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Navigation, Pause, MapPin, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/layout/BottomNav";
import { useGeolocation } from "@/hooks/useGeolocation";
import { supabase } from "@/integrations/supabase/client";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapView() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  
  const [todayStats, setTodayStats] = useState({ distance: 0, streets: 0 });
  const [cityName, setCityName] = useState("Paris");
  
  const { position, isTracking, track, startTracking, stopTracking, error } = useGeolocation({
    minInterval: 15000, // 15 seconds
  });

  // Check auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      }
    });
  }, [navigate]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [2.3522, 48.8566], // Paris default
      zoom: 14,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update marker position
  useEffect(() => {
    if (!mapRef.current || !position) return;

    const { longitude, latitude } = position;

    if (!markerRef.current) {
      // Create custom marker element
      const el = document.createElement("div");
      el.className = "w-6 h-6 bg-primary rounded-full border-4 border-white shadow-lg";

      markerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([longitude, latitude])
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat([longitude, latitude]);
    }

    // Center map on position
    mapRef.current.flyTo({
      center: [longitude, latitude],
      zoom: 16,
      duration: 1000,
    });
  }, [position]);

  // Draw track line
  useEffect(() => {
    if (!mapRef.current || track.length < 2) return;

    const coordinates = track.map((p) => [p.longitude, p.latitude]);

    if (mapRef.current.getSource("track")) {
      (mapRef.current.getSource("track") as maplibregl.GeoJSONSource).setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates,
        },
      });
    } else {
      mapRef.current.addSource("track", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates,
          },
        },
      });

      mapRef.current.addLayer({
        id: "track",
        type: "line",
        source: "track",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#6366F1",
          "line-width": 4,
        },
      });
    }

    // Calculate distance
    let totalDistance = 0;
    for (let i = 1; i < track.length; i++) {
      totalDistance += calculateDistance(
        track[i - 1].latitude,
        track[i - 1].longitude,
        track[i].latitude,
        track[i].longitude
      );
    }
    setTodayStats((prev) => ({ ...prev, distance: totalDistance }));
  }, [track]);

  const handleToggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  return (
    <div className="relative h-screen w-full">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-card/90 backdrop-blur-sm border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate("/home")}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="font-semibold">{cityName}</h1>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Route className="w-4 h-4" />
              {todayStats.distance.toFixed(2)} km
              <span className="text-muted-foreground/50">•</span>
              <MapPin className="w-4 h-4" />
              {todayStats.streets} streets today
            </p>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Error Message */}
      {error && (
        <div className="absolute top-20 left-4 right-4 z-10 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4">
          <p className="text-sm font-medium">
            {error.code === 1
              ? "Veuillez autoriser la géolocalisation"
              : error.code === 2
              ? "Position non disponible"
              : "Timeout de géolocalisation"}
          </p>
        </div>
      )}

      {/* Start Tracking Button */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
        <Button
          onClick={handleToggleTracking}
          className={`w-32 h-32 rounded-full text-lg font-bold shadow-2xl transition-all duration-300 ${
            isTracking
              ? "bg-destructive hover:bg-destructive/90"
              : "bg-primary hover:bg-primary/90 animate-pulse-ring"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            {isTracking ? (
              <>
                <Pause className="w-8 h-8" />
                <span className="text-xs">STOP</span>
              </>
            ) : (
              <>
                <Navigation className="w-8 h-8" />
                <span className="text-xs">START</span>
              </>
            )}
          </div>
        </Button>
      </div>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
