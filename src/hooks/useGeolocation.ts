import { useState, useEffect, useCallback, useRef } from "react";

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  minInterval?: number; // Minimum interval between position updates in ms
}

interface UseGeolocationReturn {
  position: GeoPosition | null;
  error: GeolocationPositionError | null;
  isTracking: boolean;
  track: GeoPosition[];
  startTracking: () => void;
  stopTracking: () => void;
  clearTrack: () => void;
}

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    minInterval = 15000, // 15 seconds default
  } = options;

  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [track, setTrack] = useState<GeoPosition[]>([]);

  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const handleSuccess = useCallback(
    (pos: GeolocationPosition) => {
      const now = Date.now();
      
      // Throttle updates based on minInterval
      if (now - lastUpdateRef.current < minInterval) {
        return;
      }
      
      lastUpdateRef.current = now;
      
      const newPosition: GeoPosition = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
      };

      setPosition(newPosition);
      setError(null);

      if (isTracking) {
        setTrack((prev) => [...prev, newPosition]);
      }
    },
    [isTracking, minInterval]
  );

  const handleError = useCallback((err: GeolocationPositionError) => {
    setError(err);
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported");
      return;
    }

    setIsTracking(true);
    setTrack([]);
    lastUpdateRef.current = 0;

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  }, [enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const clearTrack = useCallback(() => {
    setTrack([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    position,
    error,
    isTracking,
    track,
    startTracking,
    stopTracking,
    clearTrack,
  };
}
