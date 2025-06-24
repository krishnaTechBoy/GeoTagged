import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/NavigationTypes";
import MapScreen from "../screen/Map/MapScreen";
import UploadScreen from "../screen/Upload/UploadScreen";
import GalleryScreen from "../screen/Gallery/GalleryScreen";
import SplashScreen from "../screen/Splash/SplashScreen";




const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{headerShown:false}}>
         <Stack.Screen 
      name="Splash" 
      options={{
        headerShown:false
      }}
      component={SplashScreen}
   
      />
      <Stack.Screen name="MapView" 
      component={MapScreen}  
     />
      <Stack.Screen 
      name="UploadImage" 
 
      component={UploadScreen}
   
      />
        <Stack.Screen 
      name="Gallery" 
      options={{
        headerShown:false
      }}
      component={GalleryScreen}
   
      />
    </Stack.Navigator>
  );
}
