import { StyleSheet } from "react-native";
import { height, width } from "../../constants/size";

export const FAB_SIZE = width * 0.14;
export const ICON_SIZE = FAB_SIZE * 0.45;
export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: height * 0.05,
    right: width * 0.05,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabImage: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
   calloutContainer: {
    width: 200,
    padding: 8,
  },
  calloutImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 5,
  },
  calloutText: {
    fontSize: 12,
    color: '#333',
  },
});
