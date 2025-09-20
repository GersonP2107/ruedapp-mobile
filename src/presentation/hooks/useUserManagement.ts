import { useEffect, useState } from 'react';
import { CreateUserUseCase } from '../../application/useCases/user/CreateUserUseCase';
import { GetUserByEmailUseCase } from '../../application/useCases/user/GetUserByEmailUseCase';
import { GetUserUseCase } from '../../application/useCases/user/GetUserUseCase';
import { UpdateUserUseCase } from '../../application/useCases/user/UpdateUserUseCase';
import { User } from '../../domain/entities/User';
import { useAuth } from '../../infrastructure/context/AuthContext';
import { SupabaseUserRepository } from '../../infrastructure/repositories';

export const useUserManagement = () => {
  const { supabaseUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Repository
  const userRepository = new SupabaseUserRepository();

  // Use Cases
  const createUserUseCase = new CreateUserUseCase(userRepository);
  const getUserUseCase = new GetUserUseCase(userRepository);
  const updateUserUseCase = new UpdateUserUseCase(userRepository);
  const getUserByEmailUseCase = new GetUserByEmailUseCase(userRepository);

  const fetchProfile = async () => {
    if (!supabaseUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const user = await getUserUseCase.execute(supabaseUser.id);
      setProfile(user);
    } catch (err: any) {
      // Si no existe el perfil, crear uno nuevo
      if (err.message.includes('not found') || err.message.includes('No user found')) {
        try {
          const newUser = await createUserUseCase.execute({
            // id is not needed as it's handled by the repository
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.full_name || '',
            phone: supabaseUser.user_metadata?.phone || '',
          });
          setProfile(newUser);
        } catch (createErr: any) {
          setError(createErr.message);
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<{
    fullName: string;
    phone: string;
    address: string;
    city: string;
  }>) => {
    if (!supabaseUser) return { success: false, error: 'Usuario no autenticado' };
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await updateUserUseCase.execute(supabaseUser.id, updates);
      setProfile(updatedUser);
      return { success: true, data: updatedUser };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getUserByEmail = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await getUserByEmailUseCase.execute(email);
      return { success: true, data: user };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message, data: null };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supabaseUser) {
      fetchProfile();
    }
  }, [supabaseUser]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    getUserByEmail
  };
};