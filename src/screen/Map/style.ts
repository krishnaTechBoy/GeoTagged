import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  calloutContainer: {
    width: width * 0.5,
    padding: width * 0.02,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  calloutImage: {
    width: width * 0.3,
    height: height * 0.1,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  calloutText: {
    fontSize: width * 0.03,
    color: '#333',
    marginVertical: height * 0.005,
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: height * 0.015,
    fontSize: width * 0.04,
    color: '#555',
  },
  fab: {
    position: 'absolute',
    bottom: height * 0.04,
    right: width * 0.05,
    backgroundColor: '#007bff',
    borderRadius: width * 0.15,
    padding: width * 0.04,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  fabImage: {
    width: width * 0.05,
    height: width * 0.05,
    tintColor: '#fff',
  },
  customCallout: {
    position: 'absolute',
    bottom: height * 0.08,
    left: width * 0.1,
    right: width * 0.1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: width * 0.025,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 20,
  },
  customCalloutImage: {
    width: '100%',
    height: height * 0.15,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  closeText: {
    marginTop: height * 0.01,
    fontSize: width * 0.035,
    color: '#007bff',
    fontWeight: 'bold',
  },
});
