import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  memo,
  useMemo,
} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  View,
  Text,
  Image,
  Dimensions,
  InteractionManager,
} from 'react-native';
import MapView, {
  Marker,
  Region,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LocationData, RootStackParamList } from '../../types/NavigationTypes';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { styles } from './style';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MapView'>;

const MemoizedMarker = memo(
  ({ location, onPress }: { location: LocationData; onPress: (loc: LocationData) => void }) => (
    <Marker
      coordinate={{ latitude: location.latitude, longitude: location.longitude }}
      onPress={() => onPress(location)}
    />
  ),
  (prev, next) => prev.location.id === next.location.id
);

const MapScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const mapRef = useRef<MapView | null>(null);
  const hasFitToCoords = useRef(false);

  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [visibleRegion, setVisibleRegion] = useState<Region | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  const {
    location: userLocation,
    getCurrentLocation,
    startWatching,
    stopWatching,
    loading: locationLoading,
  } = useCurrentLocation();

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

      if (fetchedLocations.length > 0 && mapRef.current && !hasFitToCoords.current) {
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
        hasFitToCoords.current = true;
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
          InteractionManager.runAfterInteractions(() => {
            fetchMarkers();
            startWatching();
            setShowMap(true);
          });
        }
      };

      loadEverything();

      return () => {
        isActive = false;
        stopWatching();
        setShowMap(false);
      };
    }, [getCurrentLocation, fetchMarkers, startWatching, stopWatching])
  );

  const offsetLocations = useMemo(
    () =>
      locations.map((loc, index) => ({
        ...loc,
        latitude: loc.latitude + index * 0.00005,
        longitude: loc.longitude + index * 0.00005,
      })),
    [locations]
  );

  const filteredLocations = useMemo(() => {
    if (!visibleRegion) return offsetLocations;
    return offsetLocations.filter(loc =>
      Math.abs(loc.latitude - visibleRegion.latitude) < visibleRegion.latitudeDelta &&
      Math.abs(loc.longitude - visibleRegion.longitude) < visibleRegion.longitudeDelta
    );
  }, [offsetLocations, visibleRegion]);

  const handleRegionChange = useCallback(
    (() => {
      let timeout: NodeJS.Timeout;
      return (region: Region) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => setVisibleRegion(region), 400);
      };
    })(),
    []
  );

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
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
          showsMyLocationButton
          showsCompass={false}
          showsScale={false}
         
          showsIndoors={false}
          toolbarEnabled
          loadingEnabled
          cacheEnabled
          moveOnMarkerPress
          onRegionChangeComplete={handleRegionChange}
        >
          {filteredLocations.map(location => (
            <MemoizedMarker
              key={location.id}
              location={location}
              onPress={setSelectedLocation}
            />
          ))}
        </MapView>
      )}

      {(loading || locationLoading) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading map data...</Text>
        </View>
      )}

      {selectedLocation && (
        <View style={styles.customCallout} removeClippedSubviews>
          <Image
            source={{ uri: selectedLocation.imageUri }}
            style={styles.customCalloutImage}
            resizeMode="cover"
          />
          <Text style={styles.calloutText}>
            {new Date(selectedLocation.createdAt.toDate()).toLocaleString()}
          </Text>
          <TouchableOpacity onPress={() => setSelectedLocation(null)}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={handleNavigateToUpload}>
        <Image
          source={{uri:'https://img.icons8.com/ios-filled/50/ffffff/camera.png'}}
          style={styles.fabImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default memo(MapScreen);
