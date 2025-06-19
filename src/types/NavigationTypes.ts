import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type RootStackParamList = {
  MapView: undefined;
  UploadImage: undefined;
};


export interface Location {
  latitude: number;
  longitude: number;
}

export interface LocationData {
  id: string;
  imageUri: string;
  latitude: number;
  longitude: number;
  createdAt: FirebaseFirestoreTypes.Timestamp;
}