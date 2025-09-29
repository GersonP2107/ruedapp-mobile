-- Agregar campos de documento al perfil del usuario
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'CC',
ADD COLUMN IF NOT EXISTS document_number TEXT;

-- Crear índice para búsquedas por documento
CREATE INDEX IF NOT EXISTS idx_profiles_document 
ON public.profiles(document_type, document_number);

-- Actualizar algunos perfiles de ejemplo para pruebas
UPDATE public.profiles 
SET document_type = 'CC', document_number = '12345678'
WHERE email = 'test@example.com';

-- Agregar constraint para validar tipo de documento
ALTER TABLE public.profiles 
ADD CONSTRAINT check_document_type 
CHECK (document_type IN ('CC', 'CE', 'PA', 'TI'));