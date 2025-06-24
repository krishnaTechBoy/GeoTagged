import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Alert,
  Linking,
  Platform,
} from 'react-native';
import Geolocation, {
} from '@react-native-community/geolocation';
import {
  check,
  request,
  openSettings,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export const useCurrentLocation = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const watchId = useRef<number | null>(null);

  // Configure on mount
  useEffect(() => {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
    });

    return () => {
      stopWatching(); // ensure cleanup
      Geolocation.stopObserving();
    };
  }, []);

  // Request location permissions
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    try {
      const status = await check(permission);

      if (status === RESULTS.GRANTED) return true;

      if (status === RESULTS.DENIED) {
        const result = await request(permission);
        return result === RESULTS.GRANTED;
      }

      if (status === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Blocked',
          'Please enable location permission in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: Linking.openSettings },
          ]
        );
      } else {
        Alert.alert('Permission Denied', 'Location permission is required.');
      }

      return false;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  }, []);

  // Get location once
  const getCurrentLocation = useCallback(async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    setLoading(true);

    Geolocation.getCurrentPosition(
      (position:any) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLoading(false);
      },
      (error:any) => {
        console.error('Location Error:', error);
        Alert.alert('Location Error', error.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        
      }
    );
  }, [requestLocationPermission]);

  // Start watching location
  const startWatching = useCallback(async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    watchId.current = Geolocation.watchPosition(
      (position:any) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
      },
      (error: any) => {
        console.error('Watch Error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
      }
    );
  }, [requestLocationPermission]);

  // Stop watching location
  const stopWatching = useCallback(() => {
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    Geolocation.stopObserving();
  }, []);

  return {
    location,
    loading,
    getCurrentLocation,
    startWatching,
    stopWatching,
  };
};
