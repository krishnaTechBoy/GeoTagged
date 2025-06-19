import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  View,
  Text,
  Image,
} from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { LocationData, RootStackParamList } from '../../types/NavigationTypes';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { styles } from './style';
import { height, width } from '../../constants/size';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MapView'>;

const MemoizedMarker = memo(({ location }: { location: LocationData }) => (
  <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
    <Callout tooltip>
      <View style={styles.calloutContainer}>
        <Image
          source={{ uri: location.imageUri }}
          style={styles.calloutImage}
          resizeMode="contain"
        />
        <Text style={styles.calloutText}>
          {new Date(location.createdAt.toDate()).toLocaleString()}
        </Text>
      </View>
    </Callout>
  </Marker>
));

const MapScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const mapRef = useRef<MapView | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [visibleRegion, setVisibleRegion] = useState<Region | null>(null);

  const { location: userLocation, getCurrentLocation, loading: locationLoading } = useCurrentLocation();

  const fetchMarkers = useCallback(async () => {
    try {
      const snapshot = await firestore().collection('uploads').get();
      const fetchedLocations: LocationData[] = snapshot.docs
        .map(doc => {
          const data = doc.data();
          if (
            typeof data.latitude === 'number' &&
            typeof data.longitude === 'number' &&
            data.imageUri &&
            data.createdAt
          ) {
            return {
              id: doc.id,
              imageUri: data.imageUri,
              latitude: data.latitude,
              longitude: data.longitude,
              createdAt: data.createdAt,
            };
          }
          return null;
        })
        .filter(Boolean) as LocationData[];

      setLocations(fetchedLocations);

      if (fetchedLocations.length > 0 && mapRef.current) {
        mapRef.current.fitToCoordinates(
          fetchedLocations.map(loc => ({
            latitude: loc.latitude,
            longitude: loc.longitude,
          })),
          {
            edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
            animated: true,
          }
        );
      }
    } catch (error) {
      console.error('Error fetching markers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadEverything = async () => {
        if (isActive) {
          await getCurrentLocation();
          await fetchMarkers();
          setShowMap(true);
        }
      };

      loadEverything();

      return () => {
        isActive = false;
        setShowMap(false);
      };
    }, [getCurrentLocation, fetchMarkers])
  );

  const offsetLocations = locations.map((loc, index) => ({
    ...loc,
    latitude: loc.latitude + index * 0.00005,
    longitude: loc.longitude + index * 0.00005,
  }));

  const filteredLocations = visibleRegion
    ? offsetLocations.filter(loc =>
        Math.abs(loc.latitude - visibleRegion.latitude) < visibleRegion.latitudeDelta &&
        Math.abs(loc.longitude - visibleRegion.longitude) < visibleRegion.longitudeDelta
      )
    : offsetLocations;

  const handleRegionChange = (region: Region) => {
    setVisibleRegion(region);
  };

  const handleNavigateToUpload = useCallback(() => {
    navigation.navigate('UploadImage');
  }, [navigation]);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  }, [userLocation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {showMap && userLocation && (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider="google"
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          toolbarEnabled={true}
          loadingEnabled={true}
          cacheEnabled={true}
          moveOnMarkerPress={true}
          onRegionChangeComplete={handleRegionChange}
        >
          {filteredLocations.map(location => (
            <MemoizedMarker key={location.id} location={location} />
          ))}
        </MapView>
      )}

      {(loading || locationLoading) && (
        <ActivityIndicator
          size="large"
          color="#000"
          style={{
            position: 'absolute',
            top: height / 2 - 20,
            left: width / 2 - 20,
            zIndex: 999,
          }}
        />
      )}

      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={handleNavigateToUpload}>
        <Image
          source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/camera.png' }}
          style={styles.fabImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MapScreen;
