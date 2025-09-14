-- Esquema de base de datos para RuedApp en Supabase
-- Este archivo contiene las tablas y configuraciones necesarias

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tipos de vehículos
CREATE TABLE public.vehicle_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de vehículos
CREATE TABLE public.vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_type_id UUID REFERENCES public.vehicle_types(id) NOT NULL,
  license_plate TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de servicios/categorías
CREATE TABLE public.services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de proveedores de servicios
CREATE TABLE public.service_providers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de servicios ofrecidos por proveedores
CREATE TABLE public.provider_services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(10, 2),
  estimated_duration INTEGER, -- en minutos
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_id, service_id)
);

-- Tabla de solicitudes de servicio
CREATE TABLE public.service_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) NOT NULL,
  provider_id UUID REFERENCES public.service_providers(id) NOT NULL,
  service_id UUID REFERENCES public.services(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  description TEXT,
  location_address TEXT,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  estimated_price DECIMAL(10, 2),
  final_price DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reseñas
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar tipos de vehículos por defecto
INSERT INTO public.vehicle_types (name, description, icon) VALUES
('Automóvil', 'Vehículo de pasajeros estándar', 'car'),
('Motocicleta', 'Vehículo de dos ruedas', 'motorcycle'),
('Camioneta', 'Vehículo utilitario', 'truck'),
('Bicicleta', 'Vehículo de pedales', 'bicycle');

-- Insertar servicios por defecto
INSERT INTO public.services (name, description, icon) VALUES
('Mecánica General', 'Reparaciones mecánicas generales', 'wrench'),
('Cambio de Aceite', 'Cambio de aceite y filtros', 'oil'),
('Llantas', 'Cambio y reparación de llantas', 'tire'),
('Electricidad Automotriz', 'Reparaciones eléctricas', 'bolt'),
('Lavado', 'Lavado y detallado de vehículos', 'wash'),
('Grúa', 'Servicio de grúa y remolque', 'truck-tow');

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON public.service_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();