# Configuración de Supabase para RuedApp

Esta guía te ayudará a configurar Supabase para tu aplicación RuedApp.

## 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Haz clic en "New Project"
3. Selecciona tu organización
4. Completa los datos del proyecto:
   - **Name**: RuedApp
   - **Database Password**: Genera una contraseña segura (guárdala)
   - **Region**: Selecciona la región más cercana a tus usuarios
5. Haz clic en "Create new project"

## 2. Obtener Credenciales

1. Una vez creado el proyecto, ve a **Settings > API**
2. Copia los siguientes valores:
   - **Project URL**: `https://tu-proyecto.supabase.co`
   - **anon public key**: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...`

## 3. Configurar Variables de Entorno

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza los valores placeholder:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

## 4. Ejecutar Scripts de Base de Datos

Ejecuta los siguientes scripts en el **SQL Editor** de Supabase (en orden):

### 4.1 Esquema Principal
1. Ve a **SQL Editor** en el dashboard de Supabase
2. Copia y pega el contenido de `schema.sql`
3. Haz clic en "Run"

### 4.2 Políticas de Seguridad
1. Copia y pega el contenido de `policies.sql`
2. Haz clic en "Run"

### 4.3 Funciones Personalizadas
1. Copia y pega el contenido de `functions.sql`
2. Haz clic en "Run"

## 5. Configurar Autenticación

### 5.1 Configuración Básica
1. Ve a **Authentication > Settings**
2. Configura las siguientes opciones:
   - **Site URL**: `http://localhost:8081` (para desarrollo)
   - **Redirect URLs**: Agrega las URLs de tu app

### 5.2 Proveedores de Autenticación (Opcional)
Puedes habilitar proveedores adicionales como Google, Facebook, etc.

1. Ve a **Authentication > Providers**
2. Habilita los proveedores que desees
3. Configura las credenciales correspondientes

## 6. Configurar Storage (Opcional)

Si necesitas almacenar archivos (fotos de perfil, imágenes de vehículos, etc.):

1. Ve a **Storage**
2. Crea un bucket llamado `avatars`
3. Configura las políticas de acceso según tus necesidades

## 7. Verificar Configuración

### 7.1 Probar Conexión
1. Ejecuta tu aplicación React Native
2. Verifica que no hay errores de conexión en la consola
3. Intenta registrar un usuario de prueba

### 7.2 Verificar Datos
1. Ve a **Table Editor** en Supabase
2. Verifica que las tablas se crearon correctamente
3. Verifica que el perfil del usuario se creó automáticamente

## 8. Configuración de Producción

Cuando estés listo para producción:

1. **Variables de Entorno**:
   - Actualiza las URLs en `.env` para producción
   - Asegúrate de que las variables estén configuradas en tu servicio de hosting

2. **Configuración de Auth**:
   - Actualiza **Site URL** con tu dominio de producción
   - Agrega todas las URLs de redirect necesarias

3. **Políticas de Seguridad**:
   - Revisa todas las políticas RLS
   - Asegúrate de que no hay accesos no autorizados

## 9. Funcionalidades Implementadas

### ✅ Autenticación
- Registro de usuarios
- Inicio de sesión
- Gestión de sesiones
- Perfiles de usuario

### ✅ Gestión de Vehículos
- CRUD completo de vehículos
- Tipos de vehículos predefinidos
- Vehículo activo por usuario

### ✅ Proveedores de Servicios
- Registro de proveedores
- Gestión de servicios ofrecidos
- Sistema de calificaciones
- Búsqueda por ubicación

### ✅ Solicitudes de Servicio
- Creación de solicitudes
- Estados de solicitud
- Historial de servicios
- Sistema de reseñas

## 10. Funciones Útiles

El proyecto incluye varias funciones SQL personalizadas:

- `get_nearby_providers()`: Buscar proveedores cercanos
- `get_user_stats()`: Estadísticas del usuario
- `get_provider_stats()`: Estadísticas del proveedor
- `get_user_request_history()`: Historial de solicitudes
- `check_provider_availability()`: Verificar disponibilidad
- `get_popular_services()`: Servicios más populares

## 11. Solución de Problemas

### Error de Conexión
- Verifica que las variables de entorno estén correctas
- Asegúrate de que el proyecto de Supabase esté activo

### Error de Autenticación
- Verifica la configuración de Auth en Supabase
- Revisa las políticas RLS

### Error de Permisos
- Verifica que las políticas RLS estén configuradas correctamente
- Asegúrate de que el usuario esté autenticado

## 12. Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de React Native](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Políticas RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Funciones SQL](https://supabase.com/docs/guides/database/functions)

---

¡Tu configuración de Supabase para RuedApp está lista! 🚀