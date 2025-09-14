import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  showBanner: boolean;
  bannerMessage: string;
  bannerType: 'error' | 'warning' | 'info';
}

interface UseNetworkStatusReturn extends NetworkStatus {
  hideBanner: () => void;
  showNetworkError: (message: string) => void;
  showNetworkWarning: (message: string) => void;
  showNetworkInfo: (message: string) => void;
}

export const useNetworkStatus = (): UseNetworkStatusReturn => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    type: null,
    showBanner: false,
    bannerMessage: '',
    bannerType: 'info',
  });

  useEffect(() => {
    // Suscribirse a cambios de conectividad
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasConnected = networkStatus.isConnected;
      const isNowConnected = state.isConnected ?? false;
      
      setNetworkStatus(prev => ({
        ...prev,
        isConnected: isNowConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      }));

      // Mostrar banner cuando cambie el estado de conectividad
      if (wasConnected && !isNowConnected) {
        showNetworkError('Sin conexión a internet');
      } else if (!wasConnected && isNowConnected) {
        showNetworkInfo('Conexión restablecida');
      }
    });

    // Obtener estado inicial
    NetInfo.fetch().then(state => {
      setNetworkStatus(prev => ({
        ...prev,
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      }));
    });

    return () => unsubscribe();
  }, []);

  const hideBanner = useCallback(() => {
    setNetworkStatus(prev => ({
      ...prev,
      showBanner: false,
    }));
  }, []);

  const showNetworkError = useCallback((message: string) => {
    setNetworkStatus(prev => ({
      ...prev,
      showBanner: true,
      bannerMessage: message,
      bannerType: 'error',
    }));
  }, []);

  const showNetworkWarning = useCallback((message: string) => {
    setNetworkStatus(prev => ({
      ...prev,
      showBanner: true,
      bannerMessage: message,
      bannerType: 'warning',
    }));
  }, []);

  const showNetworkInfo = useCallback((message: string) => {
    setNetworkStatus(prev => ({
      ...prev,
      showBanner: true,
      bannerMessage: message,
      bannerType: 'info',
    }));
  }, []);

  return {
    ...networkStatus,
    hideBanner,
    showNetworkError,
    showNetworkWarning,
    showNetworkInfo,
  };
};

// Hook simplificado para solo verificar conectividad
export const useIsConnected = (): boolean => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
};