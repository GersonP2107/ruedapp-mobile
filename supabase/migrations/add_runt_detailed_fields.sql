-- Migración: Agregar campos detallados del RUNT a la tabla vehicles
-- Esta migración extiende la tabla vehicles para almacenar toda la información
-- proporcionada por la API del RUNT de Colombia

-- Información del Propietario
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS owner_full_name TEXT,
ADD COLUMN IF NOT EXISTS owner_document_type TEXT,
ADD COLUMN IF NOT EXISTS owner_document_number TEXT;

-- Información del Servicio y Clasificación
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS service_type TEXT, -- Particular, Público, etc.
ADD COLUMN IF NOT EXISTS vehicle_class TEXT, -- MOTOCICLETA, AUTOMOVIL, etc.
ADD COLUMN IF NOT EXISTS line TEXT, -- Línea del vehículo (ej: FZ para Yamaha FZ)
ADD COLUMN IF NOT EXISTS body_type TEXT, -- Tipo de carrocería
ADD COLUMN IF NOT EXISTS classification TEXT; -- MOTO, AUTOMOVIL, etc.

-- Especificaciones Técnicas
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS cylinder_capacity TEXT, -- Cilindraje
ADD COLUMN IF NOT EXISTS fuel_type TEXT, -- Tipo de combustible
ADD COLUMN IF NOT EXISTS total_passengers INTEGER,
ADD COLUMN IF NOT EXISTS seated_passengers TEXT,
ADD COLUMN IF NOT EXISTS doors TEXT,
ADD COLUMN IF NOT EXISTS number_of_axles TEXT,
ADD COLUMN IF NOT EXISTS gross_weight TEXT,
ADD COLUMN IF NOT EXISTS load_capacity TEXT;

-- Números de Identificación del Vehículo
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS serial_number TEXT, -- Número de serie
ADD COLUMN IF NOT EXISTS engine_number TEXT, -- Número de motor
ADD COLUMN IF NOT EXISTS chassis_number TEXT, -- Número de chasis
ADD COLUMN IF NOT EXISTS vin TEXT; -- VIN

-- Información de Regrabado
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS is_engine_re_engraved TEXT, -- SI/NO
ADD COLUMN IF NOT EXISTS is_chassis_re_engraved TEXT, -- SI/NO
ADD COLUMN IF NOT EXISTS is_serial_re_engraved TEXT, -- SI/NO
ADD COLUMN IF NOT EXISTS is_vin_re_engraved TEXT, -- SI/NO
ADD COLUMN IF NOT EXISTS re_engraved_chassis_number TEXT,
ADD COLUMN IF NOT EXISTS re_engraved_engine_number TEXT,
ADD COLUMN IF NOT EXISTS re_engraved_serial_number TEXT,
ADD COLUMN IF NOT EXISTS re_engraved_vin_number TEXT;

-- Estado y Documentación del Vehículo
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS vehicle_status TEXT, -- ACTIVO, INACTIVO, etc.
ADD COLUMN IF NOT EXISTS registration_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS days_registered TEXT,
ADD COLUMN IF NOT EXISTS liens TEXT, -- Prendas (SI/NO)
ADD COLUMN IF NOT EXISTS encumbrances TEXT, -- Gravámenes (SI/NO)
ADD COLUMN IF NOT EXISTS transit_organization TEXT, -- Organismo de tránsito
ADD COLUMN IF NOT EXISTS is_antique_classic TEXT, -- SI/NO
ADD COLUMN IF NOT EXISTS is_teaching_vehicle TEXT, -- SI/NO
ADD COLUMN IF NOT EXISTS is_repowered TEXT; -- SI/NO

-- Información de Importación
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS import_status INTEGER,
ADD COLUMN IF NOT EXISTS import_license_issue_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS import_license_expiry_date TIMESTAMP WITH TIME ZONE;

-- Validación y Seguridad
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS security_state TEXT,
ADD COLUMN IF NOT EXISTS dian_validation TEXT,
ADD COLUMN IF NOT EXISTS dian_validation_verified BOOLEAN DEFAULT false;

-- Campos Adicionales del RUNT
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS show_requests TEXT,
ADD COLUMN IF NOT EXISTS machinery_type TEXT,
ADD COLUMN IF NOT EXISTS tariff_subheading TEXT,
ADD COLUMN IF NOT EXISTS registration_date_matricula TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS registration_card TEXT,
ADD COLUMN IF NOT EXISTS identification_number TEXT,
ADD COLUMN IF NOT EXISTS vehicle_id_automotor BIGINT,
ADD COLUMN IF NOT EXISTS country_name TEXT,
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS service_type_id INTEGER,
ADD COLUMN IF NOT EXISTS vehicle_class_id INTEGER;

-- Crear índices para mejorar el rendimiento de búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_vehicles_owner_document 
ON public.vehicles(owner_document_type, owner_document_number);

CREATE INDEX IF NOT EXISTS idx_vehicles_vin 
ON public.vehicles(vin) WHERE vin IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vehicles_serial_number 
ON public.vehicles(serial_number) WHERE serial_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vehicles_status 
ON public.vehicles(vehicle_status);

CREATE INDEX IF NOT EXISTS idx_vehicles_classification 
ON public.vehicles(classification);

-- Agregar comentarios a las columnas para documentación
COMMENT ON COLUMN public.vehicles.owner_full_name IS 'Nombre completo del propietario según RUNT';
COMMENT ON COLUMN public.vehicles.service_type IS 'Tipo de servicio: Particular, Público, etc.';
COMMENT ON COLUMN public.vehicles.vehicle_class IS 'Clase de vehículo según RUNT: MOTOCICLETA, AUTOMOVIL, etc.';
COMMENT ON COLUMN public.vehicles.line IS 'Línea del vehículo (modelo específico)';
COMMENT ON COLUMN public.vehicles.cylinder_capacity IS 'Cilindraje del motor';
COMMENT ON COLUMN public.vehicles.fuel_type IS 'Tipo de combustible: Gasolina, Diesel, Eléctrica, etc.';
COMMENT ON COLUMN public.vehicles.vin IS 'Número de Identificación Vehicular';
COMMENT ON COLUMN public.vehicles.vehicle_status IS 'Estado del vehículo en el RUNT: ACTIVO, INACTIVO, etc.';
COMMENT ON COLUMN public.vehicles.liens IS 'Indica si el vehículo tiene prendas (SI/NO)';
COMMENT ON COLUMN public.vehicles.encumbrances IS 'Indica si el vehículo tiene gravámenes (SI/NO)';
COMMENT ON COLUMN public.vehicles.transit_organization IS 'Organismo de tránsito donde está registrado';
COMMENT ON COLUMN public.vehicles.vehicle_id_automotor IS 'ID único del vehículo en el sistema RUNT';
