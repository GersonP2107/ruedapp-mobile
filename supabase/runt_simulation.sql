-- Tabla para simular datos del RUNT
-- Esta tabla simula la respuesta de la API de Mis Datos del RUNT
CREATE TABLE public.runt_vehicle_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  license_plate TEXT NOT NULL UNIQUE,
  owner_document_type TEXT NOT NULL DEFAULT 'CC',
  owner_document_number TEXT NOT NULL,
  owner_full_name TEXT NOT NULL,
  owner_phone TEXT,
  owner_address TEXT,
  owner_city TEXT,
  
  -- Datos del vehículo
  vehicle_brand TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER NOT NULL,
  vehicle_color TEXT NOT NULL,
  vehicle_type TEXT NOT NULL, -- Automóvil, Motocicleta, etc.
  vehicle_class TEXT, -- Particular, Público, etc.
  vehicle_service TEXT DEFAULT 'Particular',
  vehicle_vin TEXT,
  vehicle_engine_number TEXT,
  vehicle_cylinder_capacity INTEGER,
  vehicle_fuel_type TEXT DEFAULT 'Gasolina',
  
  -- Documentos y vigencias
  soat_company TEXT,
  soat_policy_number TEXT,
  soat_expiry_date DATE,
  rtm_expiry_date DATE,
  rtm_center TEXT,
  
  -- Estado del vehículo
  vehicle_status TEXT DEFAULT 'Activo',
  has_restrictions BOOLEAN DEFAULT false,
  restrictions_description TEXT,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_runt_license_plate ON public.runt_vehicle_data(license_plate);
CREATE INDEX idx_runt_owner_document ON public.runt_vehicle_data(owner_document_type, owner_document_number);

-- Insertar datos de ejemplo para pruebas
INSERT INTO public.runt_vehicle_data (
  license_plate, owner_document_number, owner_full_name, owner_phone, owner_address, owner_city,
  vehicle_brand, vehicle_model, vehicle_year, vehicle_color, vehicle_type,
  soat_company, soat_policy_number, soat_expiry_date, rtm_expiry_date, rtm_center
) VALUES 
('ABC123', '12345678', 'Juan Carlos Pérez', '3001234567', 'Calle 123 #45-67', 'Bogotá',
 'Toyota', 'Corolla', 2020, 'Blanco', 'Automóvil',
 'Seguros Bolívar', 'SOA123456789', '2024-12-31', '2024-06-30', 'CDA Bogotá'),

('DEF456', '87654321', 'María Elena García', '3109876543', 'Carrera 45 #12-34', 'Medellín',
 'Chevrolet', 'Spark', 2019, 'Rojo', 'Automóvil',
 'SURA', 'SOA987654321', '2024-11-15', '2024-08-20', 'CDA Medellín'),

('GHI789', '11223344', 'Carlos Alberto Rodríguez', '3201122334', 'Avenida 68 #89-12', 'Cali',
 'Honda', 'CB 150', 2021, 'Negro', 'Motocicleta',
 'Mapfre', 'SOA456789123', '2024-10-10', '2024-09-15', 'CDA Cali'),

('JKL012', '44332211', 'Ana Sofía Martínez', '3154433221', 'Calle 50 #23-45', 'Barranquilla',
 'Nissan', 'Frontier', 2018, 'Azul', 'Camioneta',
 'Liberty Seguros', 'SOA789123456', '2024-09-30', '2024-07-25', 'CDA Barranquilla'),

('MNO345', '55667788', 'Diego Fernando López', '3205566778', 'Carrera 15 #67-89', 'Bucaramanga',
 'Mazda', 'CX-5', 2022, 'Gris', 'Automóvil',
 'Seguros Bolívar', 'SOA321654987', '2025-01-20', '2024-12-10', 'CDA Bucaramanga');

-- Trigger para actualizar updated_at
CREATE TRIGGER update_runt_vehicle_data_updated_at 
  BEFORE UPDATE ON public.runt_vehicle_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();