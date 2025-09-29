import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
  onComplete?: () => void;
  duration?: number;
}

const { width, height } = Dimensions.get('window');

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  title = "CASI LISTO...",
  subtitle = "Preparando tu SOAT para el pago.",
  onComplete,
  duration = 3000,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación de rotación continua
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    // Timer para completar la carga
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => {
      clearTimeout(timer);
      rotateAnimation.stop();
    };
  }, [rotateAnim, fadeAnim, scaleAnim, onComplete, duration]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F4FD" />
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Círculo de fondo */}
          <View style={styles.logoBackground}>
            {/* Icono de automóvil */}
            <Ionicons name="car-sport" size={40} color="#1a365d" />
          </View>
          
          {/* Anillo de carga giratorio */}
          <Animated.View
            style={[
              styles.loadingRing,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <View style={styles.ringSegment} />
          </Animated.View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: Animated.multiply(fadeAnim, 0) }],
            },
          ]}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4FD',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 60,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingRing: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: 'transparent',
  },
  ringSegment: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 70,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: '#44F1A6',
    borderRightColor: '#44F1A6',
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: width * 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a365d',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
});

export default LoadingScreen;