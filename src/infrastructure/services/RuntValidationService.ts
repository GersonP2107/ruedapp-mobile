import { supabase } from '../../../lib/supabase';

export interface VehicleValidationResult {
  isValid: boolean;
  vehicleData?: {
    // Campos básicos
    brand: string;
    model: string;
    year: number;
    color: string;
    vehicleType: string;
    ownerName: string;
    ownerDocument: string;

    // Documentos
    soatExpiry?: string;
    rtmExpiry?: string;

    // Clasificación y servicio
    serviceType?: string;
    vehicleClass?: string;
    line?: string;
    bodyType?: string;
    classification?: string;

    // Especificaciones técnicas
    cylinderCapacity?: string;
    fuelType?: string;
    totalPassengers?: number;
    seatedPassengers?: string;
    doors?: string;
    numberOfAxles?: string;
    grossWeight?: string;
    loadCapacity?: string;

    // Números de identificación
    serialNumber?: string;
    engineNumber?: string;
    chassisNumber?: string;
    vin?: string;

    // Información de regrabado
    isEngineReEngraved?: string;
    isChassisReEngraved?: string;
    isSerialReEngraved?: string;
    isVinReEngraved?: string;
    reEngravingChassisNumber?: string;
    reEngravingEngineNumber?: string;
    reEngravingSerialNumber?: string;
    reEngravingVinNumber?: string;

    // Estado y documentación
    vehicleStatus?: string;
    registrationDate?: string;
    daysRegistered?: string;
    liens?: string;
    encumbrances?: string;
    transitOrganization?: string;
    isAntiqueClassic?: string;
    isTeachingVehicle?: string;
    isRepowered?: string;

    // Importación
    importStatus?: number;
    importLicenseIssueDate?: string;
    importLicenseExpiryDate?: string;

    // Validación y seguridad
    securityState?: string;
    dianValidation?: string;
    dianValidationVerified?: boolean;

    // Campos adicionales
    showRequests?: string;
    machineryType?: string;
    tariffSubheading?: string;
    registrationDateMatricula?: string;
    registrationCard?: string;
    identificationNumber?: string;
    vehicleIdAutomotor?: number;
    countryName?: string;
    licenseNumber?: string;
    serviceTypeId?: number;
    vehicleClassId?: number;
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

      // Consultar API real del RUNT
      const apiResponse = await this.fetchRuntData(licensePlate, userDocument);

      if (!apiResponse) {
        return {
          isValid: false,
          error: 'Vehículo no encontrado en el RUNT o servicio no disponible',
          errorCode: 'VEHICLE_NOT_FOUND'
        };
      }

      // Mapear datos del RUNT a nuestro formato
      const vehicleData = this.mapApiResponseToVehicleData(apiResponse);

      return {
        isValid: true,
        vehicleData
      };

    } catch (error: any) {
      console.error('Error en validación RUNT:', error);
      return {
        isValid: false,
        error: 'Error de conexión con el servicio RUNT. Intente nuevamente.',
        errorCode: 'SYSTEM_ERROR'
      };
    }
  }

  private static async fetchRuntData(licensePlate: string, userDocument: UserDocumentInfo): Promise<any> {
    try {
      const documentTypeSlug = this.getDocumentTypeSlug(userDocument.documentType);
      const compositeDocumentNumber = `${userDocument.documentNumber}/${licensePlate.toUpperCase()}`;

      const response = await fetch('http://localhost:8000/api/v1.0/requests/runt-vehicle-co/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_type: documentTypeSlug,
          document_number: compositeDocumentNumber
        }),
      });

      if (!response.ok) {
        console.error('RUNT API Error:', response.status, await response.text());
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch RUNT Data Error:', error);
      throw error;
    }
  }

  private static getDocumentTypeSlug(type: string): string {
    const mapping: { [key: string]: string } = {
      'CC': 'cedula',
      'TI': 'tarjeta_identidad',
      'CE': 'cedula_extranjeria',
      'NIT': 'nit',
      'PA': 'pasaporte',
      'PPT': 'permiso_proteccion_temporal',
      'RC': 'registro_civil',
      'CD': 'carnet_diplomatico',
    };
    return mapping[type] || 'cedula';
  }

  private static mapApiResponseToVehicleData(data: any): any {
    const info = data.infoVehiculo || data;

    return {
      brand: info.marca || info.brand || '',
      model: info.linea || info.model || '',
      year: parseInt(info.modelo || info.year || '0'),
      color: info.color || '',
      vehicleType: this.mapVehicleType(info.claseVehiculo || info.vehicleType || ''),
      ownerName: info.propietario || '',
      ownerDocument: info.nroDocumento || '',

      soatExpiry: info.soatFechaVencimiento,
      rtmExpiry: info.rtmFechaVencimiento,
      cylinderCapacity: info.cilindraje,
      fuelType: info.tipoCombustible,
      engineNumber: info.nroMotor,
      chassisNumber: info.nroChasis,
      vin: info.nroVin,
      vehicleClass: info.claseVehiculo,
      serviceType: info.tipoServicio,
      bodyType: info.tipoCarroceria,
      totalPassengers: info.nroPasajeros,
    };
  }

  /**
   * Verifica que el propietario del vehículo coincida con el usuario
   */
  private static verifyOwnership(runtData: any, userDocument: UserDocumentInfo): boolean {
    if (userDocument.documentType !== 'CC' || runtData.owner_document_type !== 'CC') {
      return false;
    }

    if (runtData.owner_document_number !== userDocument.documentNumber) {
      return false;
    }

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

    if (normalizedRunt === normalizedUser) {
      return true;
    }

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
    const docRegex = /^[A-Za-z0-9]{6,12}$/;
    return docRegex.test(documentNumber);
  }

  /**
   * Extrae el número de documento del perfil del usuario
   */
  static extractDocumentFromProfile(profile: any): UserDocumentInfo | null {
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