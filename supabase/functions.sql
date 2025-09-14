-- Funciones útiles para RuedApp en Supabase
-- Estas funciones proporcionan lógica de negocio compleja

-- Función para buscar proveedores cercanos
CREATE OR REPLACE FUNCTION get_nearby_providers(
  user_lat DECIMAL(10, 8),
  user_lng DECIMAL(11, 8),
  radius_km INTEGER DEFAULT 10,
  service_filter UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  business_name TEXT,
  description TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2),
  total_reviews INTEGER,
  distance_km DECIMAL(10, 2),
  services JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.business_name,
    sp.description,
    sp.phone,
    sp.address,
    sp.city,
    sp.latitude,
    sp.longitude,
    sp.rating,
    sp.total_reviews,
    ROUND(
      (6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(sp.latitude)) * 
        cos(radians(sp.longitude) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(sp.latitude))
      ))::DECIMAL, 2
    ) AS distance_km,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'name', s.name,
          'price', ps.price,
          'estimated_duration', ps.estimated_duration
        )
      ) FILTER (WHERE s.id IS NOT NULL), 
      '[]'::jsonb
    ) AS services
  FROM public.service_providers sp
  LEFT JOIN public.provider_services ps ON sp.id = ps.provider_id AND ps.is_active = true
  LEFT JOIN public.services s ON ps.service_id = s.id
  WHERE 
    sp.is_active = true
    AND sp.is_verified = true
    AND sp.latitude IS NOT NULL
    AND sp.longitude IS NOT NULL
    AND (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(sp.latitude)) * 
        cos(radians(sp.longitude) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(sp.latitude))
      )
    ) <= radius_km
    AND (service_filter IS NULL OR EXISTS (
      SELECT 1 FROM public.provider_services ps2 
      WHERE ps2.provider_id = sp.id 
      AND ps2.service_id = service_filter 
      AND ps2.is_active = true
    ))
  GROUP BY sp.id, sp.business_name, sp.description, sp.phone, sp.address, sp.city, 
           sp.latitude, sp.longitude, sp.rating, sp.total_reviews
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas del usuario
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
  total_requests INTEGER,
  completed_requests INTEGER,
  pending_requests INTEGER,
  total_vehicles INTEGER,
  average_rating DECIMAL(3, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(sr.id)::INTEGER AS total_requests,
    COUNT(sr.id) FILTER (WHERE sr.status = 'completed')::INTEGER AS completed_requests,
    COUNT(sr.id) FILTER (WHERE sr.status = 'pending')::INTEGER AS pending_requests,
    COUNT(DISTINCT v.id)::INTEGER AS total_vehicles,
    COALESCE(AVG(r.rating), 0)::DECIMAL(3, 2) AS average_rating
  FROM public.profiles p
  LEFT JOIN public.service_requests sr ON p.id = sr.user_id
  LEFT JOIN public.vehicles v ON p.id = v.user_id AND v.is_active = true
  LEFT JOIN public.reviews r ON sr.id = r.service_request_id
  WHERE p.id = user_uuid
  GROUP BY p.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas del proveedor
CREATE OR REPLACE FUNCTION get_provider_stats(provider_uuid UUID)
RETURNS TABLE (
  total_requests INTEGER,
  completed_requests INTEGER,
  pending_requests INTEGER,
  total_services INTEGER,
  average_rating DECIMAL(3, 2),
  total_reviews INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(sr.id)::INTEGER AS total_requests,
    COUNT(sr.id) FILTER (WHERE sr.status = 'completed')::INTEGER AS completed_requests,
    COUNT(sr.id) FILTER (WHERE sr.status = 'pending')::INTEGER AS pending_requests,
    COUNT(DISTINCT ps.id)::INTEGER AS total_services,
    sp.rating AS average_rating,
    sp.total_reviews AS total_reviews
  FROM public.service_providers sp
  LEFT JOIN public.service_requests sr ON sp.id = sr.provider_id
  LEFT JOIN public.provider_services ps ON sp.id = ps.provider_id AND ps.is_active = true
  WHERE sp.id = provider_uuid
  GROUP BY sp.id, sp.rating, sp.total_reviews;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener historial de solicitudes del usuario
CREATE OR REPLACE FUNCTION get_user_request_history(
  user_uuid UUID,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  status TEXT,
  service_name TEXT,
  provider_name TEXT,
  vehicle_info TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  final_price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE,
  has_review BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sr.id,
    sr.status,
    s.name AS service_name,
    sp.business_name AS provider_name,
    CONCAT(v.brand, ' ', v.model, ' (', v.license_plate, ')') AS vehicle_info,
    sr.scheduled_date,
    sr.final_price,
    sr.created_at,
    EXISTS(SELECT 1 FROM public.reviews r WHERE r.service_request_id = sr.id) AS has_review
  FROM public.service_requests sr
  JOIN public.services s ON sr.service_id = s.id
  JOIN public.service_providers sp ON sr.provider_id = sp.id
  JOIN public.vehicles v ON sr.vehicle_id = v.id
  WHERE sr.user_id = user_uuid
  ORDER BY sr.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para validar disponibilidad de proveedor
CREATE OR REPLACE FUNCTION check_provider_availability(
  provider_uuid UUID,
  requested_date TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Verificar si hay conflictos de horario
  SELECT COUNT(*) INTO conflict_count
  FROM public.service_requests
  WHERE 
    provider_id = provider_uuid
    AND status IN ('accepted', 'in_progress')
    AND scheduled_date IS NOT NULL
    AND (
      -- El nuevo servicio empieza durante otro servicio
      (requested_date >= scheduled_date AND 
       requested_date < scheduled_date + INTERVAL '1 minute' * estimated_duration)
      OR
      -- El nuevo servicio termina durante otro servicio
      (requested_date + INTERVAL '1 minute' * estimated_duration > scheduled_date AND 
       requested_date + INTERVAL '1 minute' * estimated_duration <= scheduled_date + INTERVAL '1 minute' * estimated_duration)
      OR
      -- El nuevo servicio engloba completamente otro servicio
      (requested_date <= scheduled_date AND 
       requested_date + INTERVAL '1 minute' * estimated_duration >= scheduled_date + INTERVAL '1 minute' * estimated_duration)
    );
  
  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener servicios populares
CREATE OR REPLACE FUNCTION get_popular_services(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  icon TEXT,
  request_count BIGINT,
  average_price DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.description,
    s.icon,
    COUNT(sr.id) AS request_count,
    COALESCE(AVG(sr.final_price), 0)::DECIMAL(10, 2) AS average_price
  FROM public.services s
  LEFT JOIN public.service_requests sr ON s.id = sr.service_id
  WHERE s.is_active = true
  GROUP BY s.id, s.name, s.description, s.icon
  ORDER BY request_count DESC, s.name ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;