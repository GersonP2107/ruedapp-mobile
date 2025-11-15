import { router } from 'expo-router';
import React from 'react';
import {
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../../constants/Colors';
import SocialSignInButtons from '../../components/ui/SocialSignInButtons';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={require('../../../../assets/images/welcome-image.png')}
        style={styles.backgroundImage}
        blurRadius={2}
        resizeMode="cover" // Asegurar que la imagen cubra toda la pantalla
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.overlay}>
            <View style={styles.content}>
              {/* Logo */}
              <Image
                source={require('../../../../assets/images/ruedapp-icon.png')}
                style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 20 }}
                resizeMode="contain"
              />
    
              {/* Title */}
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Bienvenidos a RuedApp</Text>
              </View>
              {/* Description */}
              <Text style={styles.description}>
                Gestiona tu vehículo de manera inteligente.
                Encuentra servicios de mantenimiento, guarda tus documentos y recibe alertas importantes, todo desde tu mano.
              </Text>
    
              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.startButton}
                  onPress={() => router.push('./onboarding')}
                >
                  <Text style={styles.startButtonText}>Empezar ahora</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.signUpButton}
                  onPress={() => router.push('./signup')}
                >
                  <Text style={styles.signUpButtonText}>Registrarse gratis</Text>
                </TouchableOpacity>
                <SocialSignInButtons/>
                <TouchableOpacity 
                  style={styles.loginButton}
                  onPress={() => router.push('./login')}
                >
                  <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Color de respaldo
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: 'black',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 20,
    color: '#22c55e',
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    color: 'black',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 50,
    paddingHorizontal: 20,
    opacity: 0.9,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  signUpButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  startButton: {
    backgroundColor: '#10b981',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  signUpButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loginButton: {
    backgroundColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 4,
  },
  loginButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  buttonIcon: {
    marginRight: 4,
  },
  bottomIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#ffffff',
    borderRadius: 2.5,
    alignSelf: 'center',
    opacity: 0.8,
  },
});