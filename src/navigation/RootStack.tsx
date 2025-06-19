import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/NavigationTypes";
import MapScreen from "../screen/Map/MapScreen";
import UploadScreen from "../screen/Upload/UploadScreen";




const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <Stack.Navigator initialRouteName="MapView" screenOptions={{headerShown:false}}>
      <Stack.Screen name="MapView" 
      component={MapScreen}  
     />
      <Stack.Screen 
      name="UploadImage" 
 
      component={UploadScreen}
   
      />
    </Stack.Navigator>
  );
}
