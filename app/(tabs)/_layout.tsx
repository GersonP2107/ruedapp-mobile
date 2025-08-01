import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import '@/global.css';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 80,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size || 24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documentos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size || 24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="pico-placa"
        options={{
          title: 'Pico y Placa',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size || 24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="services"
        options={{
          title: 'Servicios',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct-outline" size={size || 24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size || 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
