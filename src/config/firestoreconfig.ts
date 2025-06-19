import { getApp } from '@react-native-firebase/app';
import { getFirestore } from '@react-native-firebase/firestore';

export const app = getApp();
export const firestore = getFirestore(app);