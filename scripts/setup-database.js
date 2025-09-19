const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan las variables de entorno de Supabase');
  console.log('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
  console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ Faltante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSupabaseSetup() {
  console.log('🚀 Verificando configuración de Supabase...');
  console.log('📍 URL:', supabaseUrl);
  
  try {
    // Verificar conexión básica
    console.log('🔍 Verificando conexión...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error && !error.message.includes('session')) {
      throw new Error(`Error de conexión: ${error.message}`);
    }
    
    console.log('✅ Conexión con Supabase establecida correctamente');
    
    // Intentar acceder a las tablas para verificar si existen
    console.log('\n🔍 Verificando si las tablas existen...');
    
    let tablesExist = true;
    const tables = ['vehicle_types', 'user_profiles', 'vehicles'];
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (tableError) {
          console.log(`❌ Tabla '${table}' no existe:`, tableError.message);
          tablesExist = false;
        } else {
          console.log(`✅ Tabla '${table}' existe`);
        }
      } catch (err) {
        console.log(`❌ Error verificando tabla '${table}':`, err.message);
        tablesExist = false;
      }
    }
    
    if (!tablesExist) {
      console.log('\n❌ LAS TABLAS NO EXISTEN EN SUPABASE');
      console.log('\n📋 NECESITAS CREAR LAS TABLAS MANUALMENTE');
      console.log('\n🔧 INSTRUCCIONES:');
      console.log('1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard');
      console.log('2. Selecciona tu proyecto RuedApp');
      console.log('3. Ve a "SQL Editor" en el menú lateral izquierdo');
      console.log('4. Copia y pega el siguiente SQL:');
      
      console.log('\n' + '='.repeat(80));
      console.log('-- SCRIPT SQL PARA CREAR TODAS LAS TABLAS DE RUEDAPP');
      console.log('='.repeat(80));
      
      console.log(`
-- 1. Tabla de tipos de vehículos
CREATE TABLE vehicle_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar tipos por defecto
INSERT INTO vehicle_types (name, description) VALUES 
  ('Automóvil', 'Vehículo de pasajeros estándar'),
  ('Motocicleta', 'Vehículo de dos ruedas'),
  ('Camioneta', 'Vehículo utilitario deportivo'),
  ('Camión', 'Vehículo de carga pesada'),
  ('Bicicleta', 'Vehículo de propulsión humana');

-- 2. Tabla de perfiles de usuario
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Trigger para user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Tabla de vehículos
CREATE TABLE vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_type_id UUID REFERENCES vehicle_types(id) NOT NULL,
  license_plate VARCHAR(20) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
  color VARCHAR(30) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, license_plate)
);

-- 6. Trigger para vehicles
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Configurar Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_types ENABLE ROW LEVEL SECURITY;

-- 8. Políticas de seguridad para user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 9. Políticas de seguridad para vehicles
CREATE POLICY "Users can view own vehicles" ON vehicles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles" ON vehicles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles" ON vehicles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles" ON vehicles
  FOR DELETE USING (auth.uid() = user_id);

-- 10. vehicle_types es de solo lectura para todos los usuarios autenticados
CREATE POLICY "Anyone can view vehicle types" ON vehicle_types
  FOR SELECT USING (true);`);
      
      console.log('\n' + '='.repeat(80));
      console.log('\n📝 PASOS A SEGUIR:');
      console.log('1. Copia TODO el SQL de arriba (desde CREATE TABLE hasta el final)');
      console.log('2. Pégalo en el SQL Editor de Supabase');
      console.log('3. Haz clic en "Run" o presiona Ctrl+Enter');
      console.log('4. Verifica que no haya errores');
      console.log('5. Vuelve a ejecutar este script: node scripts/setup-database.js');
      console.log('\n⚠️  IMPORTANTE: Ejecuta TODO el script SQL de una vez, no por partes');
      
    } else {
      console.log('\n🎉 ¡Todas las tablas están configuradas correctamente!');
      
      // Verificar datos de ejemplo
      try {
        const { data: vehicleTypes, error: vtError } = await supabase
          .from('vehicle_types')
          .select('*');
        
        if (!vtError && vehicleTypes && vehicleTypes.length > 0) {
          console.log(`\n✅ ${vehicleTypes.length} tipos de vehículos disponibles:`);
          vehicleTypes.forEach(vt => console.log(`   - ${vt.name}: ${vt.description}`));
        } else {
          console.log('\n⚠️  La tabla vehicle_types está vacía. Ejecuta el SQL para insertar los datos.');
        }
      } catch (err) {
        console.log('\n⚠️  Error verificando datos:', err.message);
      }
      
      console.log('\n✅ La aplicación RuedApp está lista para usar con Supabase!');
      console.log('\n🚀 Ahora puedes:');
      console.log('   - Registrar usuarios en la app');
      console.log('   - Iniciar sesión');
      console.log('   - Agregar vehículos');
      console.log('   - Todas las funciones de la app funcionarán correctamente');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Verifica que las variables de entorno en .env estén correctas');
    console.log('2. Asegúrate de que tu proyecto de Supabase esté activo');
    console.log('3. Verifica tu conexión a internet');
    console.log('4. Revisa que la URL y la clave anónima sean correctas en Supabase Dashboard');
    process.exit(1);
  }
}

checkSupabaseSetup();