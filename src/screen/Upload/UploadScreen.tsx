import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { launchCamera, CameraOptions } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { check, request, openSettings, PERMISSIONS, RESULTS } from 'react-native-permissions';
import storage from '@react-native-firebase/storage';
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
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;

    const status = await check(permission);

    if (status === RESULTS.GRANTED) return true;

    if (status === RESULTS.DENIED) {
      const result = await request(permission);
      return result === RESULTS.GRANTED;
    }

    if (status === RESULTS.BLOCKED) {
      Alert.alert(
        'Camera Permission Blocked',
        'Please enable camera permission from settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => openSettings() },
        ]
      );
    } else {
      Alert.alert('Permission Denied', 'Camera access is required.');
    }

    return false;
  }, []);

  const handleNavigateToGallery= useCallback(() => {
      navigation.navigate('Gallery');
    }, [navigation]);


  const handleTakePicture = useCallback(async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const options: CameraOptions = {
      mediaType: 'photo',
      cameraType: 'front',
      saveToPhotos: true,
      quality:0.5

    };

    launchCamera(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Camera Error', response.errorMessage || 'Unknown error');
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri?.startsWith('file://') || uri?.startsWith('content://')) {
        setImageUri(uri);
      } else {
        Alert.alert('Error', 'No valid image URI found.');
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
      const fileName = `uploads/${Date.now()}.jpg`;
      const reference = storage().ref(fileName);

      await reference.putFile(imageUri);
      const downloadURL = await reference.getDownloadURL();

      await firestore.collection('uploads').add({
        imageUri: downloadURL,
        latitude: location.latitude,
        longitude: location.longitude,
        createdAt: serverTimestamp(),
      });

      Alert.alert('✅ Upload Successful', 'Image and location saved!');
      setImageUri(null);
      navigation.goBack();
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'Something went wrong. Try again.');
    } finally {
      setUploading(false);
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

      <View style={{ marginVertical: 10 }}>
        {loadingLocation ? (
          <ActivityIndicator color="#007bff" size="small" />
        ) : location ? (
          <Text style={styles.locationText}>
            📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        ) : (
          <TouchableOpacity onPress={getCurrentLocation}>
            <Text style={[styles.locationText, { color: '#007bff' }]}>
              Retry Location
            </Text>
          </TouchableOpacity>
        )}
      </View>

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
         <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={handleNavigateToGallery}>
              <Image
                source={{uri:'https://img.icons8.com/ios-filled/50/ffffff/image.png'}}
                style={styles.fabImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
    </SafeAreaView>
  );
};

export default UploadScreen;

