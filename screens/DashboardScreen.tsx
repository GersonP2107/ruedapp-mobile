import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReviewsManager from '../components/ReviewsManager';
import ServiceProviderList from '../components/ServiceProviderList';
import ServiceRequestManager from '../components/ServiceRequestManager';
import UserProfile from '../components/UserProfile';
import VehicleList from '../components/VehicleList';
import { useAuth } from '../contexts/AuthContext';

type TabType = 'vehicles' | 'providers' | 'requests' | 'reviews' | 'profile';

const DashboardScreen: React.FC = () => {
  const { user, supabaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('vehicles');

  const tabs = [
    {
      id: 'vehicles' as TabType,
      title: 'Vehículos',
      icon: 'car-outline',
      activeIcon: 'car',
    },
    {
      id: 'providers' as TabType,
      title: 'Proveedores',
      icon: 'business-outline',
      activeIcon: 'business',
    },
    {
      id: 'requests' as TabType,
      title: 'Solicitudes',
      icon: 'clipboard-outline',
      activeIcon: 'clipboard',
    },
    {
      id: 'reviews' as TabType,
      title: 'Reseñas',
      icon: 'star-outline',
      activeIcon: 'star',
    },
    {
      id: 'profile' as TabType,
      title: 'Perfil',
      icon: 'person-outline',
      activeIcon: 'person',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vehicles':
        return <VehicleList />;
      case 'providers':
        return <ServiceProviderList />;
      case 'requests':
        return <ServiceRequestManager />;
      case 'reviews':
        return <ReviewsManager showUserReviews={true} />;
      case 'profile':
        return <UserProfile />;
      default:
        return <VehicleList />;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getUserName = () => {
    if (supabaseUser?.user_metadata?.full_name) {
      return supabaseUser.user_metadata.full_name.split(' ')[0];
    }
    if (user?.name) {
      return user.name.split(' ')[0];
    }
    return 'Usuario';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{getUserName()}</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#333" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={activeTab === tab.id ? tab.activeIcon as any : tab.icon as any}
                size={20}
                color={activeTab === tab.id ? '#2196F3' : '#666'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Quick Actions FAB */}
      {activeTab !== 'profile' && (
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabScrollContainer: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#E3F2FD',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});

export default DashboardScreen;