// Clean Architecture hooks
export { useVehicleManagement } from './useVehicleManagement';
export { useUserManagement } from './useUserManagement';
export { useServiceManagement } from './useServiceManagement';

// Compatibility hooks (mantienen la misma interfaz que los hooks originales)
export {
  useVehicles,
  useProfile,
  useVehicleTypes,
  useServices,
  useProviders,
  useServiceRequests,
  useReviews
} from './useSupabaseCompat';