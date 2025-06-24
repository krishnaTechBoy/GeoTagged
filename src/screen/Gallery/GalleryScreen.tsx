import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { LocationData } from '../../types/NavigationTypes';
import { styles } from './style';



const GalleryScreen = () => {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLocations = async () => {
    try {
      setError(null);
      const snapshot = await firestore().collection('uploads').get();
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<LocationData, 'id'>),
      }));
      setLocations(data);
    } catch (err) {
      setError('Failed to fetch gallery data');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const snapshot = await firestore().collection('uploads').get();
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<LocationData, 'id'>),
        }));
        if (isMounted) setLocations(data);
      } catch (err) {
        if (isMounted) setError('Failed to fetch gallery data');
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLocations();
  };

  const renderItem = useCallback(
    ({ item }: { item: LocationData }) => (
      <View style={styles.card}>
        <Image source={{ uri: item.imageUri }} style={styles.image} resizeMode="cover" />
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Latitude:</Text>
          <Text style={styles.text}>{item.latitude}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Longitude:</Text>
          <Text style={styles.text}>{item.longitude}</Text>
        </View>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item: LocationData) => item.id, []);

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading gallery...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>No gallery items found</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'white'} barStyle={'dark-content'}/>
      <FlatList
        data={locations}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          locations.length === 0 && styles.centeredContent,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
      />
    </SafeAreaView>
  );
};

export default GalleryScreen;

