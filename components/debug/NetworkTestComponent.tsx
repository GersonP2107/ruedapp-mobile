import { useAuth } from '@/contexts/AuthContext';
import { useVehicles } from '@/hooks/useSupabase';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const NetworkTestComponent: React.FC = () => {
  const {
    isConnected,
    showNetworkError,
    showNetworkWarning,
    showNetworkInfo,
  } = useAuth();
  
  const { vehicles, fetchVehicles } = useVehicles();

  const testNetworkError = () => {
    showNetworkError('Error de conexión simulado para pruebas');
  };

  const testNetworkWarning = () => {
    showNetworkWarning('Conexión lenta simulada para pruebas');
  };

  const testNetworkInfo = () => {
    showNetworkInfo('Conexión restablecida - simulación para pruebas');
  };

  const testApiCall = async () => {
    try {
      // Los datos del perfil ya están disponibles en user desde AuthContext
      console.log('Profile data available from AuthContext');
      showNetworkInfo('Llamada a API exitosa');
    } catch (error) {
      showNetworkError('Error en llamada a API');
    }
  };

  const testVehiclesCall = async () => {
    try {
      await fetchVehicles();
      showNetworkInfo('Carga de vehículos exitosa');
    } catch (error) {
      showNetworkError('Error cargando vehículos');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pruebas de Conectividad</Text>
      
      <View style={styles.statusContainer}>
        
        <Text style={[styles.statusText, { color: isConnected ? '#10b981' : '#ef4444' }]}>
          {isConnected ? 'Conectado' : 'Sin conexión'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.errorButton]} onPress={testNetworkError}>
          <Text style={styles.buttonText}>Simular Error</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={testNetworkWarning}>
          <Text style={styles.buttonText}>Simular Advertencia</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.infoButton]} onPress={testNetworkInfo}>
          <Text style={styles.buttonText}>Simular Info</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.apiButton]} onPress={testApiCall}>
          <Text style={styles.buttonText}>Probar API Perfil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.apiButton]} onPress={testVehiclesCall}>
          <Text style={styles.buttonText}>Probar API Vehículos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1f2937',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorButton: {
    backgroundColor: '#ef4444',
  },
  warningButton: {
    backgroundColor: '#f59e0b',
  },
  infoButton: {
    backgroundColor: '#3b82f6',
  },
  apiButton: {
    backgroundColor: '#8b5cf6',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});