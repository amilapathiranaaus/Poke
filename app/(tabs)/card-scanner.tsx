import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Alert, ActivityIndicator, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import * as FileSystem from 'expo-file-system';

type CardInfo = {
  name: string;
  evolution: string;
  price: string;
} | null;

export default function CardScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [type, setType] = useState<'back' | 'front'>('back');
  const [isLoading, setIsLoading] = useState(false);
  const [cardInfo, setCardInfo] = useState<CardInfo>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  const toggleCameraType = () => {
    setType(current => current === 'back' ? 'front' : 'back');
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setIsLoading(true);
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.8,
          skipProcessing: true,
          exif: false,
        });

        setCapturedImage(photo.uri);
        setShowPreview(true);
        
        await processAndAnalyzeImage(photo.uri);
      } catch (error) {
        console.error('Capture error:', error);
        Alert.alert('Error', 'Failed to take picture');
        setIsLoading(false);
      }
    }
  };

  const processAndAnalyzeImage = async (uri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const base64Data = `data:image/jpeg;base64,${base64}`;
      await analyzeImage(base64Data);
    } catch (error) {
      console.error('Processing error:', error);
      Alert.alert('Error', 'Failed to process image');
      setIsLoading(false);
    }
  };

  const retakePicture = () => {
    setShowPreview(false);
    setCapturedImage(null);
    setCardInfo(null);
    setIsLoading(false);
  };

  const analyzeImage = async (base64Image: string) => {
    try {
      console.log('Sending image to backend...');
      const response = await fetch('https://poke-backend-osfk.onrender.com/process-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          imageBase64: base64Image,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      setIsLoading(false);

      if (data.name) {
        setCardInfo({
          name: data.name,
          evolution: data.evolution,
          price: data.price || 'N/A',
        });
      } else {
        Alert.alert('Warning', 'Could not identify the card');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to analyze the image');
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    Alert.alert('Error', 'No access to camera');
    return <View style={styles.container} />;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/pokemon-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {!showPreview && (
          <>
            <ThemedText type="title" style={styles.title}>📸 Scan Card</ThemedText>
            <ThemedText style={styles.subtitle}>Position your Pokémon card in the frame</ThemedText>
          </>
        )}
      </View>

      <View style={styles.cameraContainer}>
        {!showPreview ? (
          <CameraView 
            style={styles.camera} 
            facing={type} 
            ref={cameraRef}
          >
            <View style={styles.overlay}>
              <View style={styles.scanFrame} />
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.flipButton]} 
                onPress={toggleCameraType}
              >
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.captureButton]} 
                onPress={takePicture}
                disabled={isLoading}
              >
                <Ionicons name="camera" size={30} color="white" />
              </TouchableOpacity>
            </View>
          </CameraView>
        ) : (
          <View style={styles.previewContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.retakeButton]} 
              onPress={retakePicture}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <ThemedText style={styles.buttonText}>Retake</ThemedText>
            </TouchableOpacity>
            {capturedImage && (
              <Image 
                source={{ uri: capturedImage }} 
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF3B30" />
                <ThemedText style={styles.loadingText}>Analyzing card...</ThemedText>
              </View>
            ) : cardInfo ? (
              <View style={styles.cardInfo}>
                <ThemedText type="subtitle" style={styles.cardTitle}>Card Information</ThemedText>
                <View style={styles.infoRow}>
                  <Ionicons name="card" size={20} color="#FF3B30" />
                  <ThemedText style={styles.infoText}>Name: {cardInfo.name}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="arrow-forward" size={20} color="#34C759" />
                  <ThemedText style={styles.infoText}>Stage: {cardInfo.evolution}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="pricetag" size={20} color="#007AFF" />
                  <ThemedText style={styles.priceText}>Price: ${cardInfo.price}</ThemedText>
                </View>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: '#FF3B30',
  },
  logo: {
    width: 120,
    height: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#FFCB05',
    textShadowColor: '#2C72B8',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFCB05',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: '80%',
    height: '60%',
    borderWidth: 3,
    borderColor: '#FFCB05',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  button: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFCB05',
  },
  flipButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  captureButton: {
    backgroundColor: '#FF3B30',
    borderColor: '#FFCB05',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFCB05',
  },
  previewImage: {
    width: '100%',
    height: '60%',
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFCB05',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFCB05',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardInfo: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFCB05',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#FFCB05',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#FFFFFF',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  priceText: {
    fontSize: 18,
    color: '#FFCB05',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  retakeButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
    alignSelf: 'center',
    minWidth: 120,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFCB05',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 