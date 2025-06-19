import { useState, useCallback } from 'react';
import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export const useCurrentLocation = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'ios') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Required',
          message: 'This app requires location access to center the map.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          'Permission Blocked',
          'You have permanently denied location access. Please enable it in app settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        Alert.alert('Permission Denied', 'Location permission is required to proceed.');
      }

      return false;
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    let granted = false;

    while (!granted) {
      granted = await requestLocationPermission();
      if (!granted) {
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setLoading(true);

    Geolocation.getCurrentPosition(
      (position: any) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLoading(false);
      },
      error => {
        console.error('Location error:', error);
        Alert.alert('Location Error', error.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
       
      }
    );
  }, [requestLocationPermission]);

  return { location, loading, getCurrentLocation };
};
