import { useState, useRef } from 'react';
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
          quality: 1,
          skipProcessing: false,
          exif: false,
          imageType: 'png',
          sound: false,
          autoFocus: true,
          focusDepth: 0,
          whiteBalance: 'auto',
          flashMode: 'auto',
          fixOrientation: true,
          forceUpOrientation: true,
          imageProcessing: {
            sharpness: 1.0,
            contrast: 1.0,
            brightness: 0.0,
          },
        });

        // Show preview with the captured image
        setCapturedImage(photo.uri);
        setShowPreview(true);
        
        // Process and analyze the image
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
      // Read the file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Add the data URL prefix
      const base64Data = `data:image/jpeg;base64,${base64}`;
      
      // Analyze the image
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
    return Alert.alert('Error', 'No access to camera');
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">📸 Pokémon Card Scanner</ThemedText>
      </ThemedView>

      <ThemedView style={styles.cameraContainer}>
        {!showPreview ? (
          <CameraView 
            style={styles.camera} 
            facing={type} 
            ref={cameraRef}
          >
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
                <Ionicons name="camera-reverse" size={30} color="white" />
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
          <ThemedView style={styles.previewContainer}>
            {capturedImage && (
              <Image 
                source={{ uri: capturedImage }} 
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
            {isLoading ? (
              <ActivityIndicator size="large" color="#007AFF" />
            ) : cardInfo ? (
              <ThemedView style={styles.cardInfo}>
                <ThemedText type="subtitle">Card Information</ThemedText>
                <ThemedText>Name: {cardInfo.name}</ThemedText>
                <ThemedText>Stage: {cardInfo.evolution}</ThemedText>
                <ThemedText style={styles.price}>Price: ${cardInfo.price}</ThemedText>
              </ThemedView>
            ) : null}
            <TouchableOpacity 
              style={[styles.button, styles.retakeButton]} 
              onPress={retakePicture}
            >
              <ThemedText style={styles.buttonText}>Retake</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
  },
  camera: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 50,
  },
  captureButton: {
    backgroundColor: '#007AFF',
  },
  retakeButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 20,
  },
  previewImage: {
    width: '100%',
    height: '60%',
    borderRadius: 10,
    marginBottom: 20,
  },
  cardInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },
  price: {
    color: '#2e7d32',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
}); 