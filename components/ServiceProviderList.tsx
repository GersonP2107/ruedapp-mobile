import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProviders } from '../hooks/useSupabase';
import * as Location from 'expo-location';

interface ServiceProviderListProps {
  onProviderSelect?: (provider: any) => void;
  serviceFilter?: string;
}

const ServiceProviderList: React.FC<ServiceProviderListProps> = ({
  onProviderSelect,
  serviceFilter,
}) => {
  const { providers, loading, error, searchNearbyProviders } = useProviders();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [searchRadius, setSearchRadius] = useState('10');
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (location && locationPermission) {
      searchProviders();
    }
  }, [location, serviceFilter]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } else {
        Alert.alert(
          'Permisos de ubicación',
          'Se necesitan permisos de ubicación para encontrar proveedores cercanos.'
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    }
  };

  const searchProviders = async () => {
    if (!location) return;

    const radius = parseInt(searchRadius) || 10;
    await searchNearbyProviders(
      location.coords.latitude,
      location.coords.longitude,
      radius,
      serviceFilter
    );
  };

  const handleRefresh = () => {
    if (location) {
      searchProviders();
    } else {
      requestLocationPermission();
    }
  };

  const renderProviderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.providerCard}
      onPress={() => onProviderSelect?.(item)}
    >
      <View style={styles.providerHeader}>
        <View style={styles.providerIcon}>
          <Ionicons name="business-outline" size={24} color="#2196F3" />
        </View>
        <View style={styles.providerInfo}>
          <Text style={styles.businessName}>{item.business_name}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.locationInfo}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.distance}>
              {item.distance_km} km • {item.city}
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>
              {item.rating ? item.rating.toFixed(1) : 'N/A'}
            </Text>
            <Text style={styles.reviewCount}>
              ({item.total_reviews || 0} reseñas)
            </Text>
          </View>
        </View>
        <View style={styles.contactInfo}>
          <TouchableOpacity style={styles.phoneButton}>
            <Ionicons name="call-outline" size={16} color="#2196F3" />
          </TouchableOpacity>
        </View>
      </View>
      
      {item.services && item.services.length > 0 && (
        <View style={styles.servicesContainer}>
          <Text style={styles.servicesTitle}>Servicios:</Text>
          <View style={styles.servicesList}>
            {item.services.slice(0, 3).map((service: any, index: number) => (
              <View key={index} style={styles.serviceTag}>
                <Text style={styles.serviceText}>{service.name}</Text>
                {service.price && (
                  <Text style={styles.servicePrice}>${service.price}</Text>
                )}
              </View>
            ))}
            {item.services.length > 3 && (
              <Text style={styles.moreServices}>
                +{item.services.length - 3} más
              </Text>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="business-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No se encontraron proveedores</Text>
      <Text style={styles.emptySubtitle}>
        {!locationPermission
          ? 'Se necesitan permisos de ubicación para buscar proveedores'
          : 'Intenta aumentar el radio de búsqueda o verifica tu ubicación'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
        <Text style={styles.retryButtonText}>
          {!locationPermission ? 'Permitir ubicación' : 'Buscar nuevamente'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={64} color="#FF5252" />
      <Text style={styles.errorTitle}>Error al buscar proveedores</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <Text style={styles.title}>Proveedores Cercanos</Text>
        <View style={styles.searchControls}>
          <View style={styles.radiusContainer}>
            <Text style={styles.radiusLabel}>Radio (km):</Text>
            <TextInput
              style={styles.radiusInput}
              value={searchRadius}
              onChangeText={setSearchRadius}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={searchProviders}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Buscando proveedores...</Text>
        </View>
      ) : error ? (
        renderError()
      ) : providers.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={providers}
          renderItem={renderProviderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchHeader: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  searchControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radiusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radiusLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  radiusInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    width: 60,
    textAlign: 'center',
  },
  searchButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  listContainer: {
    padding: 16,
  },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  distance: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  contactInfo: {
    alignItems: 'center',
  },
  phoneButton: {
    padding: 8,
  },
  servicesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  servicesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  serviceTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceText: {
    fontSize: 12,
    color: '#1976D2',
  },
  servicePrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
    marginLeft: 4,
  },
  moreServices: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5252',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default ServiceProviderList;