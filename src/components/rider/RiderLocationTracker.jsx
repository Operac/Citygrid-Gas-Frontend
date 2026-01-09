import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const MIN_DISTANCE_METERS = 50; // Update only if moved 50 meters
const MIN_TIME_MS = 30000; // Update at most every 30 seconds

export default function RiderLocationTracker() {
  const { user, isAuthenticated } = useAuthStore();
  const watchIdRef = useRef(null);
  const lastUpdateRef = useRef({ lat: 0, lng: 0, time: 0 });

  useEffect(() => {
    // Only track if user is authenticated and is a RIDER
    if (!isAuthenticated || user?.role !== 'RIDER') {
      stopTracking();
      return;
    }

    // Check if rider is strictly "online" or just logged in?
    // Usually only "Online" riders should be tracked for order assignment.
    // However, the `user` object in store might be stale regarding `isOnline`.
    // For now, we'll assume valid riders who are logged in should be tracked 
    // if their store state says they are online.
    
    // We can also double check via an API call or just trust proper state management updates.
    const isOnline = user?.rider?.isOnline;

    if (isOnline) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => stopTracking();
  }, [isAuthenticated, user?.role, user?.rider?.isOnline]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }

    if (watchIdRef.current) return; // Already watching

    console.log('📍 Starting location tracking...');
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      console.log('🛑 Stopping location tracking...');
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const handlePositionUpdate = async (position) => {
    const { latitude, longitude } = position.coords;
    const now = Date.now();
    const last = lastUpdateRef.current;

    // Calculate distance (Haversine formula approximation is enough for small distances) or just simple Euclidean for rough check?
    // Let's use simple check for now or basic distance func.
    const dist = calculateDistance(last.lat, last.lng, latitude, longitude);

    // Update if:
    // 1. Time elapsed > MIN_TIME_MS
    // 2. OR Distance moved > MIN_DISTANCE_METERS
    if (now - last.time > MIN_TIME_MS || dist > MIN_DISTANCE_METERS) {
      try {
        await api.patch('/rider/location', { latitude, longitude });
        console.log(`✅ Location updated: ${latitude}, ${longitude}`);
        lastUpdateRef.current = { lat: latitude, lng: longitude, time: now };
        
        // Reset error count on success
        if (watchIdRef.current) {
             watchIdRef.current.errorCount = 0;
        }
      } catch (error) {
        console.error('Failed to update location:', error);
        
        // Track consecutive failures
        if (!watchIdRef.current.errorCount) watchIdRef.current.errorCount = 0;
        watchIdRef.current.errorCount += 1;

        if (watchIdRef.current.errorCount === 3) {
            toast.error('Connection unstable: Location not updating on server.', { id: 'loc-sync-error' });
        }
      }
    }
  };

  const handlePositionError = (error) => {
    console.error('Geolocation error:', error);
    
    let errorMessage = 'Location tracking failed.';
    
    switch(error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable it in browser settings.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out.';
        break;
      default:
        errorMessage = error.message || 'Unknown location error.';
    }

    // Show toast to user, but debounce/limit if needed (here we just show it)
    // Using a custom ID prevents duplicate toasts spamming
    toast.error(errorMessage, { id: 'geo-error' });
  };

  // Helper to calculate distance in meters
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if ((lat1 === lat2) && (lon1 === lon2)) return 0;
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  return null; // This component handles side effects only
}
