import { useState } from 'react';
import { RuntSimulationService, RuntQueryParams, RuntApiResponse } from '../../infrastructure/services/RuntSimulationService';

export interface UseRuntConsultationReturn {
  consultVehicle: (params: RuntQueryParams) => Promise<RuntApiResponse>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook para consultar información de vehículos en el RUNT
 */
export const useRuntConsultation = (): UseRuntConsultationReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const consultVehicle = async (params: RuntQueryParams): Promise<RuntApiResponse> => {
    setLoading(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!RuntSimulationService.validateLicensePlate(params.licensePlate)) {
        const errorResponse: RuntApiResponse = {
          success: false,
          error: 'INVALID_PLATE',
          message: 'Formato de placa inválido. Use el formato ABC123'
        };
        setError(errorResponse.message!);
        return errorResponse;
      }

      if (!RuntSimulationService.validateDocumentNumber(params.ownerDocumentNumber)) {
        const errorResponse: RuntApiResponse = {
          success: false,
          error: 'INVALID_DOCUMENT',
          message: 'Número de documento inválido'
        };
        setError(errorResponse.message!);
        return errorResponse;
      }

      const response = await RuntSimulationService.consultVehicle(params);
      
      if (!response.success && response.message) {
        setError(response.message);
      }

      return response;

    } catch (err: any) {
      const errorMessage = 'Error al consultar el RUNT. Intente nuevamente.';
      setError(errorMessage);
      return {
        success: false,
        error: 'CONSULTATION_ERROR',
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    consultVehicle,
    loading,
    error,
    clearError
  };
};