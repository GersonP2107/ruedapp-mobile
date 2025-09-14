-- Políticas de seguridad RLS (Row Level Security) para RuedApp
-- Estas políticas controlan el acceso a los datos basado en el usuario autenticado

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla profiles
-- Los usuarios pueden ver y editar solo su propio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para la tabla vehicles
-- Los usuarios pueden gestionar solo sus propios vehículos
CREATE POLICY "Users can view own vehicles" ON public.vehicles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles" ON public.vehicles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles" ON public.vehicles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles" ON public.vehicles
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para la tabla vehicle_types
-- Todos pueden leer los tipos de vehículos (datos de referencia)
CREATE POLICY "Anyone can view vehicle types" ON public.vehicle_types
  FOR SELECT USING (true);

-- Políticas para la tabla services
-- Todos pueden leer los servicios (datos de referencia)
CREATE POLICY "Anyone can view services" ON public.services
  FOR SELECT USING (true);

-- Políticas para la tabla service_providers
-- Todos pueden ver proveedores activos
CREATE POLICY "Anyone can view active providers" ON public.service_providers
  FOR SELECT USING (is_active = true);

-- Los usuarios pueden gestionar solo su propio perfil de proveedor
CREATE POLICY "Users can manage own provider profile" ON public.service_providers
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para la tabla provider_services
-- Todos pueden ver servicios de proveedores activos
CREATE POLICY "Anyone can view provider services" ON public.provider_services
  FOR SELECT USING (
    is_active = true AND 
    EXISTS (
      SELECT 1 FROM public.service_providers 
      WHERE id = provider_id AND is_active = true
    )
  );

-- Los proveedores pueden gestionar solo sus propios servicios
CREATE POLICY "Providers can manage own services" ON public.provider_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.service_providers 
      WHERE id = provider_id AND user_id = auth.uid()
    )
  );

-- Políticas para la tabla service_requests
-- Los usuarios pueden ver sus propias solicitudes
CREATE POLICY "Users can view own requests" ON public.service_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Los proveedores pueden ver solicitudes dirigidas a ellos
CREATE POLICY "Providers can view their requests" ON public.service_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.service_providers 
      WHERE id = provider_id AND user_id = auth.uid()
    )
  );

-- Los usuarios pueden crear solicitudes
CREATE POLICY "Users can create requests" ON public.service_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propias solicitudes
CREATE POLICY "Users can update own requests" ON public.service_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- Los proveedores pueden actualizar solicitudes dirigidas a ellos
CREATE POLICY "Providers can update their requests" ON public.service_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.service_providers 
      WHERE id = provider_id AND user_id = auth.uid()
    )
  );

-- Políticas para la tabla reviews
-- Todos pueden ver reseñas
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

-- Los usuarios pueden crear reseñas solo para sus propias solicitudes completadas
CREATE POLICY "Users can create reviews for own completed requests" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.service_requests 
      WHERE id = service_request_id 
      AND user_id = auth.uid() 
      AND status = 'completed'
    )
  );

-- Los usuarios pueden actualizar solo sus propias reseñas
CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Función para actualizar el rating promedio del proveedor
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.service_providers
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
    )
  WHERE id = COALESCE(NEW.provider_id, OLD.provider_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para actualizar rating automáticamente
CREATE TRIGGER update_provider_rating_on_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

CREATE TRIGGER update_provider_rating_on_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

CREATE TRIGGER update_provider_rating_on_delete
  AFTER DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();