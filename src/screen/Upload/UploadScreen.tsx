import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  Linking,
} from 'react-native';
import { launchCamera, CameraOptions } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { serverTimestamp } from '@react-native-firebase/firestore';
import { styles } from './style';
import { firestore } from '../../config/firestoreconfig';
import { RootStackParamList } from '../../types/NavigationTypes';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'UploadImage'>;

const UploadScreen = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const {
    location,
    loading: loadingLocation,
    getCurrentLocation,
  } = useCurrentLocation();

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'ios') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission Required',
          message: 'This app needs camera access to take photos.',
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
          'Camera access is blocked. Please enable it from settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        Alert.alert('Permission Denied', 'Camera permission is required.');
      }

      return false;
    } catch (err) {
      console.warn('Camera permission error:', err);
      return false;
    }
  }, []);

  const handleTakePicture = useCallback(async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const options: CameraOptions = {
      mediaType: 'photo',
      cameraType: 'back',
      saveToPhotos: true,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Camera Error', response.errorMessage || 'Unknown error');
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) {
        setImageUri(uri);
      } else {
        Alert.alert('Error', 'No image URI found.');
      }
    });
  }, [requestCameraPermission]);

  const handleUpload = useCallback(async () => {
    if (!imageUri || !location) {
      Alert.alert('Incomplete Data', 'Both image and location are required.');
      return;
    }

    setUploading(true);
    try {
      await firestore.collection('uploads').add({
        imageUri,
        latitude: location.latitude,
        longitude: location.longitude,
        createdAt: serverTimestamp(),
      });

      Alert.alert('✅ Upload Successful', 'Data saved to Firestore!');
      navigation.goBack();
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'Failed to upload data.');
    } finally {
      setUploading(false);
      setImageUri(null);
    }
  }, [imageUri, location, navigation]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Upload Photo with Location</Text>

      <View style={styles.previewContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <Text style={styles.placeholderText}>No Image Selected</Text>
        )}
      </View>

      {loadingLocation ? (
        <ActivityIndicator color="#007bff" size="small" />
      ) : location ? (
        <Text style={styles.locationText}>
          📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </Text>
      ) : (
        <TouchableOpacity onPress={getCurrentLocation}>
          <Text style={[styles.locationText, { color: '#007bff' }]}>Retry Location</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.button} onPress={handleTakePicture}>
        <Text style={styles.buttonText}>Take Picture</Text>
      </TouchableOpacity>

      {imageUri && location && (
        <TouchableOpacity
          style={[styles.button, styles.uploadButton]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Upload to Firestore</Text>
          )}
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default UploadScreen;
