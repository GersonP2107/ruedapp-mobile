import { supabase } from '../../../lib/supabase';

export interface VehicleValidationResult {
  isValid: boolean;
  vehicleData?: {
    brand: string;
    model: string;
    year: number;
    color: string;
    vehicleType: string;
    ownerName: string;
    ownerDocument: string;
    soatExpiry?: string;
    rtmExpiry?: string;
  };
  error?: string;
  errorCode?: 'VEHICLE_NOT_FOUND' | 'OWNER_MISMATCH' | 'INVALID_PLATE' | 'INVALID_DOCUMENT' | 'SYSTEM_ERROR';
}

export interface UserDocumentInfo {
  documentType: string;
  documentNumber: string;
  fullName: string;
}

/**
 * Servicio para validación automática de vehículos con el RUNT
 * Funciona de manera transparente para el usuario
 */
export class RuntValidationService {
  
  /**
   * Valida automáticamente un vehículo contra el RUNT
   * @param licensePlate Placa del vehículo
   * @param userDocument Información del documento del usuario
   * @returns Resultado de la validación con datos del vehículo
   */
  static async validateVehicleOwnership(
    licensePlate: string, 
    userDocument: UserDocumentInfo
  ): Promise<VehicleValidationResult> {
    try {
      // Validaciones básicas
      if (!this.validateLicensePlate(licensePlate)) {
        return {
          isValid: false,
          error: 'Formato de placa inválido',
          errorCode: 'INVALID_PLATE'
        };
      }

      if (!this.validateDocumentNumber(userDocument.documentNumber)) {
        return {
          isValid: false,
          error: 'Número de documento inválido',
          errorCode: 'INVALID_DOCUMENT'
        };
      }

      // Simular delay de consulta real
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      // Consultar datos en la tabla de simulación del RUNT
      const { data, error } = await supabase
        .from('runt_vehicle_data')
        .select('*')
        .eq('license_plate', licensePlate.toUpperCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            isValid: false,
            error: 'Vehículo no encontrado en el RUNT',
            errorCode: 'VEHICLE_NOT_FOUND'
          };
        }
        throw error;
      }

      // Verificar que el propietario coincida
      const isOwnerMatch = this.verifyOwnership(data, userDocument);
      
      if (!isOwnerMatch) {
        return {
          isValid: false,
          error: 'El vehículo no está registrado a nombre del usuario',
          errorCode: 'OWNER_MISMATCH'
        };
      }

      // Mapear datos del RUNT a nuestro formato
      const vehicleData = {
        brand: data.vehicle_brand,
        model: data.vehicle_model,
        year: data.vehicle_year,
        color: data.vehicle_color,
        vehicleType: this.mapVehicleType(data.vehicle_type),
        ownerName: data.owner_full_name,
        ownerDocument: data.owner_document_number,
        soatExpiry: data.soat_expiry_date,
        rtmExpiry: data.rtm_expiry_date,
      };

      return {
        isValid: true,
        vehicleData
      };

    } catch (error: any) {
      console.error('Error en validación RUNT:', error);
      return {
        isValid: false,
        error: 'Error del sistema. Intente nuevamente.',
        errorCode: 'SYSTEM_ERROR'
      };
    }
  }

  /**
   * Verifica que el propietario del vehículo coincida con el usuario
   */
  private static verifyOwnership(runtData: any, userDocument: UserDocumentInfo): boolean {
    // Verificar tipo de documento (debe ser CC para Colombia)
    if (userDocument.documentType !== 'CC' || runtData.owner_document_type !== 'CC') {
      return false;
    }

    // Verificar número de documento
    if (runtData.owner_document_number !== userDocument.documentNumber) {
      return false;
    }

    // Verificar similitud de nombres (tolerante a diferencias menores)
    return this.compareNames(runtData.owner_full_name, userDocument.fullName);
  }

  /**
   * Compara nombres con tolerancia a diferencias menores
   */
  private static compareNames(runtName: string, userName: string): boolean {
    const normalize = (name: string) => 
      name.toLowerCase()
          .replace(/[áàäâ]/g, 'a')
          .replace(/[éèëê]/g, 'e')
          .replace(/[íìïî]/g, 'i')
          .replace(/[óòöô]/g, 'o')
          .replace(/[úùüû]/g, 'u')
          .replace(/ñ/g, 'n')
          .replace(/[^a-z\s]/g, '')
          .trim();

    const normalizedRunt = normalize(runtName);
    const normalizedUser = normalize(userName);

    // Verificar coincidencia exacta
    if (normalizedRunt === normalizedUser) {
      return true;
    }

    // Verificar si todos los nombres del usuario están en el RUNT
    const userWords = normalizedUser.split(/\s+/);
    const runtWords = normalizedRunt.split(/\s+/);

    return userWords.every(word => 
      word.length > 2 && runtWords.some(runtWord => 
        runtWord.includes(word) || word.includes(runtWord)
      )
    );
  }

  /**
   * Mapea el tipo de vehículo del RUNT a nuestros tipos internos
   */
  private static mapVehicleType(runtType: string): string {
    const typeMapping: { [key: string]: string } = {
      'Automóvil': 'car',
      'Motocicleta': 'motorcycle',
      'Camioneta': 'van',
      'Camión': 'truck',
    };
    return typeMapping[runtType] || 'car';
  }

  /**
   * Obtiene el ID del tipo de vehículo desde la base de datos
   */
  static async getVehicleTypeId(vehicleType: string): Promise<string | null> {
    try {
      const typeMapping: { [key: string]: string } = {
        'car': 'Automóvil',
        'motorcycle': 'Motocicleta',
        'van': 'Camioneta',
        'truck': 'Camión',
      };

      const typeName = typeMapping[vehicleType];
      if (!typeName) return null;

      const { data, error } = await supabase
        .from('vehicle_types')
        .select('id')
        .eq('name', typeName)
        .single();

      if (error) {
        console.error('Error obteniendo tipo de vehículo:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Error en getVehicleTypeId:', error);
      return null;
    }
  }

  /**
   * Valida el formato de placa colombiana
   */
  private static validateLicensePlate(plate: string): boolean {
    const plateRegex = /^[A-Z]{3}[0-9]{2}[0-9A-Z]$/;
    return plateRegex.test(plate.toUpperCase());
  }

  /**
   * Valida el número de documento
   */
  private static validateDocumentNumber(documentNumber: string): boolean {
    const docRegex = /^[0-9]{6,12}$/;
    return docRegex.test(documentNumber);
  }

  /**
   * Extrae el número de documento del perfil del usuario
   */
  static extractDocumentFromProfile(profile: any): UserDocumentInfo | null {
    // Aquí puedes implementar la lógica para extraer el documento del perfil
    // Por ahora, asumimos que está en el campo 'document_number' y 'document_type'
    if (profile.document_number && profile.document_type) {
      return {
        documentType: profile.document_type,
        documentNumber: profile.document_number,
        fullName: profile.full_name
      };
    }
    return null;
  }
}