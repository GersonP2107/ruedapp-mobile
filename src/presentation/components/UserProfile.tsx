import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../infrastructure/context/AuthContext';
import { useProfile } from '../../infrastructure/hooks';

interface UserProfileProps {
  editable?: boolean;
  onSave?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  editable = true,
  onSave,
}) => {
  const { profile, isLoading, error, fetchProfile, updateProfile } = useProfile();
  const { supabaseUser, signOutFromSupabase } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (supabaseUser) {
      fetchProfile();
    }
  }, [supabaseUser]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
      });
    }
  }, [profile]);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      Alert.alert('Error', 'El nombre completo es requerido');
      return;
    }

    setSaving(true);
    try {
      const result = await updateProfile(formData);
      if (result) {
        setIsEditing(false);
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
        onSave?.();
      } else {
        Alert.alert('Error', 'Error al actualizar perfil');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
      });
    }
    setIsEditing(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOutFromSupabase();
            if (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const renderField = (label: string, field: string, icon: string, placeholder: string, keyboardType: any = 'default') => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name={icon as any} size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, !isEditing && styles.inputDisabled]}
          placeholder={placeholder}
          value={formData[field as keyof typeof formData]}
          onChangeText={(value) => updateFormData(field, value)}
          editable={isEditing}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  if (isLoading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF5252" />
        <Text style={styles.errorTitle}>Error al cargar perfil</Text>
        <Text style={styles.errorSubtitle}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#2196F3" />
          </View>
        </View>
        <Text style={styles.userName}>{profile?.full_name || 'Usuario'}</Text>
        <Text style={styles.userEmail}>{profile?.email || supabaseUser?.email}</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          {editable && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Ionicons
                name={isEditing ? "close" : "pencil"}
                size={20}
                color="#2196F3"
              />
            </TouchableOpacity>
          )}
        </View>

        {renderField('Nombre Completo', 'full_name', 'person-outline', 'Ingresa tu nombre completo')}
        {renderField('Teléfono', 'phone', 'call-outline', 'Ingresa tu número de teléfono', 'phone-pad')}
        {renderField('Dirección', 'address', 'location-outline', 'Ingresa tu dirección')}
        {renderField('Ciudad', 'city', 'business-outline', 'Ingresa tu ciudad')}

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Correo Electrónico</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={profile?.email || supabaseUser?.email || ''}
              editable={false}
            />
          </View>
          <Text style={styles.fieldNote}>El correo electrónico no se puede modificar</Text>
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#FF5252" />
          <Text style={styles.signOutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {profile?.created_at && (
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            Miembro desde {new Date(profile.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 20,
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
  errorContainer: {
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
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  inputDisabled: {
    backgroundColor: '#f8f8f8',
    color: '#666',
  },
  fieldNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    margin: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  signOutButtonText: {
    color: '#FF5252',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footerInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default UserProfile;