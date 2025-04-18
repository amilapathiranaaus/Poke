import { Image, StyleSheet, Platform, TouchableOpacity, View } from 'react-native';
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
        <ThemedText type="title" style={styles.title}>Pokémon Card Scanner</ThemedText>
        <ThemedText style={styles.subtitle}>Scan your Pokémon cards to identify them!</ThemedText>
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

        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <Ionicons name="camera" size={24} color="#FF3B30" />
            <ThemedText style={styles.featureText}>Take a photo of your card</ThemedText>
          </View>
          
          <View style={styles.featureCard}>
            <Ionicons name="search" size={24} color="#34C759" />
            <ThemedText style={styles.featureText}>Identify the card instantly</ThemedText>
          </View>
          
          <View style={styles.featureCard}>
            <Ionicons name="information-circle" size={24} color="#007AFF" />
            <ThemedText style={styles.featureText}>Get card details and price</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Start your Pokémon card collection journey today!
        </ThemedText>
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
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: '#FF3B30',
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFCB05',
    textShadowColor: '#2C72B8',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  scanButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#FFCB05',
    shadowColor: '#FFCB05',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  featuresContainer: {
    gap: 15,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FFCB05',
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#FFCB05',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
