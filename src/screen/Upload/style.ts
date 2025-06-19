import { StyleSheet } from "react-native";
import { height, width } from "../../constants/size";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.05,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#222',
  },
  previewContainer: {
    width: '100%',
    height: height * 0.35,
    backgroundColor: '#eaeaea',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
  },
  locationText: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
