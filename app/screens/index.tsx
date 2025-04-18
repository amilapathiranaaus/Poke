import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/pokemon-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText style={styles.title}>Pokémon Card Scanner</ThemedText>
        <ThemedText style={styles.subtitle}>Scan your Pokémon cards to identify them</ThemedText>
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => router.push('/card-scanner')}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="scan" size={32} color="white" />
            <ThemedText style={styles.buttonText}>Scan Card</ThemedText>
          </View>
        </TouchableOpacity>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Ionicons name="search" size={24} color="#FF3B30" />
            <ThemedText style={styles.featureText}>Identify any Pokémon card</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="information-circle" size={24} color="#FF3B30" />
            <ThemedText style={styles.featureText}>Get card details and evolution info</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="cash" size={24} color="#FF3B30" />
            <ThemedText style={styles.featureText}>Check current market value</ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FF3B30',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#FF3B30',
    padding: 20,
    borderRadius: 15,
    width: '80%',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  features: {
    width: '100%',
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
});
