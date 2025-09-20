import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../infrastructure/context/AuthContext';
import { useReviews } from '../hooks';

interface ReviewsManagerProps {
  providerId?: string;
  showCreateButton?: boolean;
  showUserReviews?: boolean;
}

const ReviewsManager: React.FC<ReviewsManagerProps> = ({
  providerId,
  showCreateButton = true,
  showUserReviews = false,
}) => {
  const { reviews, loading, error, fetchProviderReviews, createReview } = useReviews();
  const { supabaseUser } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReview, setNewReview] = useState({
    provider_id: providerId || '',
    service_request_id: '',
    rating: 5,
    comment: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (showUserReviews && supabaseUser) {
      fetchProviderReviews(supabaseUser.id);
    } else if (providerId) {
      fetchProviderReviews(providerId);
    }
  }, [providerId, showUserReviews, supabaseUser]);

  const renderStars = (rating: number, size: number = 16, color: string = '#FFD700') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={size}
          color={color}
        />
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderInteractiveStars = (rating: number, onRatingChange: (rating: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => onRatingChange(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={32}
            color={i <= rating ? '#FFD700' : '#ddd'}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.interactiveStarsContainer}>{stars}</View>;
  };

  const handleCreateReview = async () => {
    if (!newReview.comment.trim()) {
      Alert.alert('Error', 'Por favor escribe un comentario');
      return;
    }

    if (!newReview.provider_id) {
      Alert.alert('Error', 'ID del proveedor requerido');
      return;
    }

    setCreating(true);
    try {
      const result = await createReview(newReview);
      if (result.success) {
        setShowCreateModal(false);
        setNewReview({
          provider_id: providerId || '',
          service_request_id: '',
          rating: 5,
          comment: '',
        });
        Alert.alert('Éxito', 'Reseña creada correctamente');
        // Refresh reviews
        if (showUserReviews) {
          fetchProviderReviews(supabaseUser?.id || '');
        } else if (providerId) {
          fetchProviderReviews(providerId);
        }
      } else {
        Alert.alert('Error', result.error || 'Error al crear reseña');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al crear reseña');
    } finally {
      setCreating(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return diffInMinutes <= 1 ? 'Hace un momento' : `Hace ${diffInMinutes} minutos`;
      }
      return diffInHours === 1 ? 'Hace 1 hora' : `Hace ${diffInHours} horas`;
    } else if (diffInDays === 1) {
      return 'Hace 1 día';
    } else if (diffInDays < 30) {
      return `Hace ${diffInDays} días`;
    } else {
      return date.toLocaleDateString('es-ES');
    }
  };

  const renderReviewItem = ({ item }: { item: any }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {item.user?.full_name || 'Usuario'}
            </Text>
            <Text style={styles.reviewDate}>
              {getTimeAgo(item.created_at)}
            </Text>
          </View>
        </View>
        {renderStars(item.rating)}
      </View>

      <Text style={styles.reviewComment}>{item.comment}</Text>

      {showUserReviews && item.provider && (
        <View style={styles.providerInfo}>
          <Ionicons name="business-outline" size={16} color="#666" />
          <Text style={styles.providerName}>{item.provider.business_name}</Text>
        </View>
      )}

      {item.service_request && (
        <View style={styles.serviceInfo}>
          <Ionicons name="construct-outline" size={16} color="#666" />
          <Text style={styles.serviceText}>Servicio relacionado</Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="star-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>
        {showUserReviews ? 'No has escrito reseñas' : 'No hay reseñas disponibles'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {showUserReviews 
          ? 'Comparte tu experiencia con los servicios que has recibido'
          : 'Sé el primero en dejar una reseña para este proveedor'
        }
      </Text>
      {showCreateButton && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Escribir Reseña</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={64} color="#FF5252" />
      <Text style={styles.errorTitle}>Error al cargar reseñas</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton} 
        onPress={() => {
          if (showUserReviews) {
            fetchProviderReviews(supabaseUser?.id || '');
          } else if (providerId) {
            fetchProviderReviews(providerId);
          }
        }}
      >
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  const calculateAverageRating = () => {
    if (reviews.length === 0) return '0.0';
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowCreateModal(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Nueva Reseña</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Calificación</Text>
            {renderInteractiveStars(newReview.rating, (rating) => 
              setNewReview(prev => ({ ...prev, rating }))
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Comentario</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Comparte tu experiencia con este proveedor..."
              value={newReview.comment}
              onChangeText={(text) => setNewReview(prev => ({ ...prev, comment: text }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, creating && styles.submitButtonDisabled]}
            onPress={handleCreateReview}
            disabled={creating}
          >
            <Text style={styles.submitButtonText}>
              {creating ? 'Enviando...' : 'Enviar Reseña'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading && reviews.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando reseñas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {showUserReviews ? 'Mis Reseñas' : 'Reseñas'}
          </Text>
          {!showUserReviews && reviews.length > 0 && (
            <View style={styles.ratingContainer}>
              {renderStars(Math.round(parseFloat(calculateAverageRating())), 18)}
              <Text style={styles.averageRating}>
                {calculateAverageRating()} ({reviews.length})
              </Text>
            </View>
          )}
        </View>
        {showCreateButton && reviews.length > 0 && (
          <TouchableOpacity
            style={styles.headerCreateButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={20} color="#2196F3" />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        renderError()
      ) : reviews.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={() => {
            if (showUserReviews) {
              fetchProviderReviews(supabaseUser?.id || '');
            } else if (providerId) {
              fetchProviderReviews(providerId);
            }
          }}
        />
      )}

      {renderCreateModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageRating: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  headerCreateButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  providerName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  serviceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
    backgroundColor: '#FF5252',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  interactiveStarsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    padding: 4,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    height: 120,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReviewsManager;