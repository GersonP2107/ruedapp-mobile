import { supabase } from '../../../lib/supabase';

export interface RuntVehicleData {
  licensePlate: string;
  ownerDocumentType: string;
  ownerDocumentNumber: string;
  ownerFullName: string;
  ownerPhone?: string;
  ownerAddress?: string;
  ownerCity?: string;
  
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  vehicleType: string;
  vehicleClass?: string;
  vehicleService?: string;
  vehicleVin?: string;
  vehicleEngineNumber?: string;
  vehicleCylinderCapacity?: number;
  vehicleFuelType?: string;
  
  soatCompany?: string;
  soatPolicyNumber?: string;
  soatExpiryDate?: string;
  rtmExpiryDate?: string;
  rtmCenter?: string;
  
  vehicleStatus?: string;
  hasRestrictions?: boolean;
  restrictionsDescription?: string;
}

export interface RuntQueryParams {
  licensePlate: string;
  ownerDocumentType: string;
  ownerDocumentNumber: string;
}

export interface RuntApiResponse {
  success: boolean;
  data?: RuntVehicleData;
  error?: string;
  message?: string;
}

/**
 * Servicio que simula la API del RUNT para consulta de vehículos
 * En producción, este servicio se conectaría a la API real de Mis Datos
 */
export class RuntSimulationService {
  
  /**
   * Simula la consulta a la API del RUNT
   * @param params Parámetros de consulta (placa, tipo y número de documento)
   * @returns Datos del vehículo y propietario
   */
  static async consultVehicle(params: RuntQueryParams): Promise<RuntApiResponse> {
    try {
      // Simular delay de red (como una API real)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const { data, error } = await supabase
        .from('runt_vehicle_data')
        .select('*')
        .eq('license_plate', params.licensePlate.toUpperCase())
        .eq('owner_document_type', params.ownerDocumentType)
        .eq('owner_document_number', params.ownerDocumentNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'VEHICLE_NOT_FOUND',
            message: 'No se encontró información del vehículo con los datos proporcionados'
          };
        }
        throw error;
      }

      // Mapear datos de la base de datos al formato de respuesta
      const vehicleData: RuntVehicleData = {
        licensePlate: data.license_plate,
        ownerDocumentType: data.owner_document_type,
        ownerDocumentNumber: data.owner_document_number,
        ownerFullName: data.owner_full_name,
        ownerPhone: data.owner_phone,
        ownerAddress: data.owner_address,
        ownerCity: data.owner_city,
        
        vehicleBrand: data.vehicle_brand,
        vehicleModel: data.vehicle_model,
        vehicleYear: data.vehicle_year,
        vehicleColor: data.vehicle_color,
        vehicleType: data.vehicle_type,
        vehicleClass: data.vehicle_class,
        vehicleService: data.vehicle_service,
        vehicleVin: data.vehicle_vin,
        vehicleEngineNumber: data.vehicle_engine_number,
        vehicleCylinderCapacity: data.vehicle_cylinder_capacity,
        vehicleFuelType: data.vehicle_fuel_type,
        
        soatCompany: data.soat_company,
        soatPolicyNumber: data.soat_policy_number,
        soatExpiryDate: data.soat_expiry_date,
        rtmExpiryDate: data.rtm_expiry_date,
        rtmCenter: data.rtm_center,
        
        vehicleStatus: data.vehicle_status,
        hasRestrictions: data.has_restrictions,
        restrictionsDescription: data.restrictions_description
      };

      return {
        success: true,
        data: vehicleData,
        message: 'Consulta exitosa'
      };

    } catch (error: any) {
      console.error('Error en RuntSimulationService:', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Error interno del servidor. Intente nuevamente.'
      };
    }
  }

  /**
   * Valida el formato de la placa colombiana
   */
  static validateLicensePlate(plate: string): boolean {
    // Formato colombiano: ABC123 o ABC12D (3 letras + 3 números o 2 números + 1 letra)
    const plateRegex = /^[A-Z]{3}[0-9]{2}[0-9A-Z]$/;
    return plateRegex.test(plate.toUpperCase());
  }

  /**
   * Valida el número de documento
   */
  static validateDocumentNumber(documentNumber: string): boolean {
    // Validar que sea numérico y tenga entre 6 y 12 dígitos
    const docRegex = /^[0-9]{6,12}$/;
    return docRegex.test(documentNumber);
  }

  /**
   * Obtiene los tipos de documento válidos
   */
  static getValidDocumentTypes(): Array<{value: string, label: string}> {
    return [
      { value: 'CC', label: 'Cédula de Ciudadanía' },
      { value: 'CE', label: 'Cédula de Extranjería' },
      { value: 'PA', label: 'Pasaporte' },
      { value: 'TI', label: 'Tarjeta de Identidad' }
    ];
  }
}