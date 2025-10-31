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
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Ionicons name="car-sport" size={32} color="#ffffff" />
                </View>
              </View>
    
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
                
              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o continúa con</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Buttons */}
              <TouchableOpacity 
                style={styles.googleButton}
                onPress={() => {
                  // Implementar Google Sign In
                  console.log('Google Sign In');
                }}
              >
                <Ionicons name="logo-google" size={20} color="#000000" style={styles.buttonIcon} />
                <Text style={styles.googleButtonText}>Continuar con Google</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.appleButton}
                onPress={() => {
                  // Implementar Apple Sign In
                  console.log('Apple Sign In');
                }}
              >
                <Ionicons name="logo-apple" size={20} color="#ffffff" style={styles.buttonIcon} />
                <Text style={styles.appleButtonText}>Continuar con Apple</Text>
              </TouchableOpacity>

    
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
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
  logoContainer: {
    marginBottom: 30,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#44F1A6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
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
    backgroundColor: '#44F1A6',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 6,
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
  googleButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  googleButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  appleButton: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  appleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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