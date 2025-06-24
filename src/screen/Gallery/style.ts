import { StyleSheet } from "react-native";
import { height, width } from "../../constants/size";

export const CARD_WIDTH = width * 0.94;
export const IMAGE_HEIGHT = width * 0.5;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical:width*0.1
  },
  listContent: {
    paddingVertical: height * 0.02,
    paddingBottom: height * 0.04,
    alignItems: 'center',
  },
  centeredContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: height * 0.02,
    padding: width * 0.04,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: IMAGE_HEIGHT,
    borderRadius: 12,
    marginBottom: height * 0.015,
    backgroundColor: '#e0e0e0',
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: height * 0.01,
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    fontSize: width * 0.04,
    color: '#555',
    width: width * 0.25,
  },
  text: {
    fontSize: width * 0.04,
    color: '#222',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.08,
    paddingTop: height * 0.12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: width * 0.045,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: width * 0.045,
    color: 'red',
    textAlign: 'center',
  },
});
