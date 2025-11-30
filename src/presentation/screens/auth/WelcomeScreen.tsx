import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación de pulso continua para el logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Gradient Background */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated Circles Background */}
        <View style={styles.circlesContainer}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>

        <SafeAreaView style={styles.safeArea}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Image
                    source={require('../../../../assets/images/ruedapp-icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </LinearGradient>
                <View style={styles.logoGlow} />
              </Animated.View>

              <Text style={styles.title}>RuedApp</Text>
              <Text style={styles.tagline}>Tu vehículo, siempre bajo control</Text>
            </View>

            {/* Features Section */}
            <View style={styles.featuresSection}>
              {[
                { icon: 'shield-checkmark', text: 'Validación RUNT', color: '#10b981' },
                { icon: 'notifications', text: 'Alertas inteligentes', color: '#3b82f6' },
                { icon: 'document-text', text: 'Documentos seguros', color: '#f59e0b' },
              ].map((feature, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.featureCard,
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <BlurView intensity={20} style={styles.featureBlur}>
                    <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '20' }]}>
                      <Ionicons name={feature.icon as any} size={24} color={feature.color} />
                    </View>
                    <Text style={styles.featureText}>{feature.text}</Text>
                  </BlurView>
                </Animated.View>
              ))}
            </View>

            {/* Description */}
            <Text style={styles.description}>
              Gestiona tu vehículo de manera inteligente. Encuentra servicios, guarda documentos y recibe alertas importantes.
            </Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {/* Primary Button - Empezar ahora */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('./onboarding')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.primaryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="rocket" size={20} color="#ffffff" />
                  <Text style={styles.primaryButtonText}>Empezar ahora</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Secondary Button - Registrarse */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push('./signup')}
                activeOpacity={0.8}
              >
                <BlurView intensity={30} style={styles.secondaryBlur}>
                  <Ionicons name="person-add" size={20} color="#ffffff" />
                  <Text style={styles.secondaryButtonText}>Registrarse gratis</Text>
                </BlurView>
              </TouchableOpacity>

              {/* Login Link */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.push('./login')}
                activeOpacity={0.7}
              >
                <Text style={styles.loginButtonText}>
                  ¿Ya tienes cuenta? <Text style={styles.loginButtonTextBold}>Iniciar sesión</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  gradientBackground: {
    flex: 1,
  },
  circlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.1,
  },
  circle1: {
    width: width * 1.5,
    height: width * 1.5,
    backgroundColor: '#10b981',
    top: -width * 0.5,
    left: -width * 0.3,
  },
  circle2: {
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: '#3b82f6',
    bottom: -width * 0.4,
    right: -width * 0.4,
  },
  circle3: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: '#f59e0b',
    top: height * 0.3,
    right: -width * 0.2,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#10b981',
    opacity: 0.3,
    transform: [{ scale: 1.4 }],
    zIndex: -1,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginVertical: 32,
  },
  featureCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featureBlur: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 14,
  },
  description: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  loginButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '500',
  },
  loginButtonTextBold: {
    color: '#ffffff',
    fontWeight: '700',
  },
});