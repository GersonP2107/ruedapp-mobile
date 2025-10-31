import React, { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingAnalytics } from '../../../infrastructure/services/OnboardingAnalytics';
import { useAuth } from '../../../infrastructure/context/AuthContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'slide-soat',
    title: 'Tu SOAT y Tecno Mecánica',
    description:
      'Recibe alertas de vencimientos y recordatorios de Pico y Placa. Evita multas y maneja sin preocupaciones.',
    image: require('../../../../assets/images/welcome-image.png'),
  },
  {
    key: 'slide-help',
    title: '¿Varado? Encuentra ayuda al instante.',
    description:
      'Explora talleres, montallantas y servicios confiables en el mapa. Contacta ayuda experta, donde sea que estés.',
    image: require('../../../../assets/images/login-image.png'),
  },
  {
    key: 'slide-market',
    title: 'Todo para tu vehículo, en un solo lugar.',
    description:
      'Compra repuestos y accesorios de negocios locales. Gestiona, repara y rueda con total comodidad.',
    image: require('../../../../assets/images/react-logo.png'),
  },
];

export default function OnboardingSlides() {
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const { user } = useAuth();
  const analytics = OnboardingAnalytics.getInstance();

  useEffect(() => {
    analytics.startSession(user?.id);
  }, []);

  useEffect(() => {
    analytics.track('slide_viewed', index, { key: SLIDES[index].key }, user?.id);
  }, [index]);

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      const next = index + 1;
      setIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    } else {
      analytics.track('cta_pressed', index, { cta: 'start_permissions' }, user?.id);
      router.push('/onboarding/permissions');
    }
  };

  const skip = () => {
    analytics.track('cta_pressed', index, { cta: 'skip' }, user?.id);
    router.push('/onboarding/permissions');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity
            accessible
            accessibilityRole="button"
            accessibilityLabel="Omitir onboarding"
            onPress={skip}
          >
            <Text style={styles.skipText}>Omitir</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
            if (newIndex !== index) setIndex(newIndex);
          }}
          scrollEventThrottle={16}
          style={styles.scroll}
        >
          {SLIDES.map((s) => (
            <View key={s.key} style={styles.slide}>
              <Image source={s.image} resizeMode="contain" style={styles.image} />
              <View accessible accessibilityRole="header" style={styles.textWrap}>
                <Text style={styles.title}>{s.title}</Text>
                <Text style={styles.description}>{s.description}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Dots */}
        <View style={styles.dotsWrap}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />)
          )}
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            accessible
            accessibilityRole="button"
            accessibilityLabel={index < SLIDES.length - 1 ? 'Siguiente' : 'Empezar ahora'}
            onPress={goNext}
            style={styles.nextButton}
          >
            <Text style={styles.nextText}>{index < SLIDES.length - 1 ? 'Siguiente' : 'Empezar ahora'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },
  topBar: { paddingHorizontal: 20, paddingTop: 8, alignItems: 'flex-end' },
  skipText: { color: '#6b7280', fontSize: 16 },
  scroll: { flex: 1 },
  slide: { width, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: 240, marginBottom: 16 },
  textWrap: { width: '100%', maxWidth: 520 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 },
  description: { fontSize: 16, color: '#374151' },
  dotsWrap: { flexDirection: 'row', alignSelf: 'center', gap: 6, marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#d1d5db' },
  dotActive: { backgroundColor: '#10b981', width: 12 },
  bottomBar: { paddingHorizontal: 24, paddingBottom: 16 },
  nextButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});