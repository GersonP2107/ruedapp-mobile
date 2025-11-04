import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../../constants/Colors';
import { useAuth } from '../../../infrastructure/context/AuthContext';
import { OnboardingAnalytics } from '../../../infrastructure/services/OnboardingAnalytics';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'slide-soat',
    image: require('../../../../assets/images/onboarding/onboarding-1.webp'),
  },
  {
    key: 'slide-help',
    image: require('../../../../assets/images/onboarding/onboarding-2.webp'),
  },
  {
    key: 'slide-market',
    image: require('../../../../assets/images/onboarding/onboarding-3.webp'),
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
        <View style={styles.topBar} pointerEvents="box-none">
          <TouchableOpacity
            accessible
            accessibilityRole="button"
            accessibilityLabel="Omitir onboarding"
            onPress={skip}
          >
            <Text style={styles.skipText}>Omitir</Text>
          </TouchableOpacity>
        </View>

        {/* Carrusel con swipe */}
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
            <ImageBackground
              key={s.key}
              source={s.image}
              resizeMode="contain"
              style={styles.slideBg}
            />
          ))}
        </ScrollView>

        {/* Dots */}
        <View style={styles.dotsWrap} pointerEvents="none">
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />)
          )}
        </View>

        <View style={styles.bottomBar} pointerEvents="box-none">
          <TouchableOpacity
            accessible
            accessibilityRole="button"
            accessibilityLabel={index < SLIDES.length - 1 ? '→' : 'Empezar ahora →'}
            onPress={goNext}
            style={styles.nextButton}
          >
            <Text style={styles.nextText}>{index < SLIDES.length - 1 ? '→' : 'Empezar ahora →'}</Text>
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
  dotsWrap: { position: 'absolute', bottom: 35, left: 24, padding: 20, flexDirection: 'row', alignSelf: 'center', gap: 6, marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ACE5CD' },
  dotActive: { backgroundColor: Colors.primary, width: 12 },
  bottomBar: { paddingHorizontal: 24, paddingBottom: 16, position: 'absolute', bottom: 16, right: 10 },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    padding: 24,
    alignItems: 'center',
  },
  nextText: { color: 'black', fontSize: 16, fontWeight: '900' },
  // Nuevo estilo para cada slide en el ScrollView
  slideBg: { width, height: '100%', justifyContent: 'flex-end' }
});