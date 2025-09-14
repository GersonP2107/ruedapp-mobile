import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={require('../assets/images/react-logo.png')} // Placeholder - puedes cambiar por tu imagen
        style={styles.backgroundImage}
        blurRadius={3}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="car-sport" size={40} color="#ffffff" />
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Millones de Servicios.</Text>
              <Text style={styles.subtitle}>Gratis en RuedApp</Text>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              Gestiona tu vehículo de manera inteligente con servicios de mantenimiento, 
              documentos y mucho más al alcance de tu mano.
            </Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.signUpButton}
                onPress={() => router.push('./signup')}
              >
                <Text style={styles.signUpButtonText}>Registrarse gratis</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.googleButton}
                onPress={() => {/* TODO: Implementar Google Sign In */}}
              >
                <Ionicons name="logo-google" size={20} color="#4285F4" />
                <Text style={styles.googleButtonText}>Continuar con Google</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.appleButton}
                onPress={() => {/* TODO: Implementar Apple Sign In */}}
              >
                <Ionicons name="logo-apple" size={20} color="#000000" />
                <Text style={styles.appleButtonText}>Continuar con Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.loginLink}
                onPress={() => router.push('./login')}
              >
                <Text style={styles.loginLinkText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22c55e',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#e5e7eb',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 50,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  signUpButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signUpButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  appleButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  appleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  loginLink: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});