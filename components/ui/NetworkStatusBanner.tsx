import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NetworkStatusBannerProps {
  isVisible: boolean;
  message: string;
  type: 'error' | 'warning' | 'info';
  onHide?: () => void;
  autoHide?: boolean;
  duration?: number;
}

export const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({
  isVisible,
  message,
  type,
  onHide,
  autoHide = true,
  duration = 4000,
}) => {
  const [slideAnim] = useState(new Animated.Value(-100));
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible && !isShowing) {
      setIsShowing(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      if (autoHide) {
        const timer = setTimeout(() => {
          hideBanner();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else if (!isVisible && isShowing) {
      hideBanner();
    }
  }, [isVisible, isShowing]);

  const hideBanner = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsShowing(false);
      onHide?.();
    });
  };

  const getIconName = () => {
    switch (type) {
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  if (!isShowing && !isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={getIconName()}
          size={20}
          color="white"
          style={styles.icon}
        />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50, // Para el safe area
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  message: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
});