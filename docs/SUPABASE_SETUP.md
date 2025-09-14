# Guía de Configuración de Supabase para RuedApp

Esta guía te llevará paso a paso para configurar tu proyecto de Supabase y obtener las credenciales necesarias para RuedApp.

## 1. Crear Cuenta y Proyecto en Supabase

### Paso 1: Crear cuenta
1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Regístrate con GitHub, Google o email
4. Verifica tu email si es necesario

### Paso 2: Crear nuevo proyecto
1. En el dashboard, haz clic en "New Project"
2. Selecciona tu organización (o crea una nueva)
3. Completa los datos del proyecto:
   - **Name**: `RuedApp`
   - **Database Password**: Genera una contraseña segura (¡guárdala!)
   - **Region**: Selecciona la región más cercana a tus usuarios
   - **Pricing Plan**: Selecciona "Free" para desarrollo
4. Haz clic en "Create new project"
5. Espera 2-3 minutos mientras se configura el proyecto

## 2. Obtener Credenciales del Proyecto

### Paso 1: Acceder a la configuración
1. En el dashboard de tu proyecto, ve a **Settings** (⚙️) en la barra lateral
2. Selecciona **API** en el menú de configuración

### Paso 2: Copiar credenciales
Encontrarás las siguientes credenciales que necesitas:

```bash
# URL del proyecto
SUPABASE_URL=https://tu-proyecto-id.supabase.co

# Clave pública (anon key)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clave de servicio (service_role key) - ¡MANTENER SECRETA!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Paso 3: Configurar variables de entorno
1. Crea/actualiza el archivo `.env` en la raíz del proyecto:

```bash
# Supabase Configuration
SUPABASE_URL=https://tu-proyecto-id.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Expo Configuration
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

2. Asegúrate de que `.env` esté en tu `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.production
```

## 3. Configurar Base de Datos

### Paso 1: Ejecutar esquema inicial
1. Ve a **SQL Editor** en la barra lateral
2. Haz clic en "New query"
3. Copia y pega el contenido de `supabase/schema.sql`
4. Haz clic en "Run" para ejecutar el script
5. Verifica que no haya errores en la consola

### Paso 2: Configurar políticas de seguridad
1. En el SQL Editor, crea una nueva query
2. Copia y pega el contenido de `supabase/policies.sql`
3. Ejecuta el script
4. Verifica que las políticas RLS estén activas

### Paso 3: Agregar funciones personalizadas
1. En el SQL Editor, crea una nueva query
2. Copia y pega el contenido de `supabase/functions.sql`
3. Ejecuta el script
4. Verifica que las funciones se hayan creado correctamente

## 4. Configurar Autenticación

### Paso 1: Configuración básica
1. Ve a **Authentication** > **Settings** en la barra lateral
2. Configura las siguientes opciones:

```json
{
  "SITE_URL": "http://localhost:19006",
  "ADDITIONAL_REDIRECT_URLS": [
    "ruedapp://auth/callback",
    "exp://localhost:19000/--/auth/callback"
  ],
  "JWT_EXPIRY": 3600,
  "REFRESH_TOKEN_ROTATION_ENABLED": true,
  "SECURITY_REFRESH_TOKEN_REUSE_INTERVAL": 10
}
```

### Paso 2: Configurar proveedores de autenticación

#### Email/Password (ya habilitado por defecto)
- **Enable email confirmations**: ✅ Habilitado
- **Enable email change confirmations**: ✅ Habilitado
- **Enable secure password change**: ✅ Habilitado

#### Google OAuth (opcional)
1. Ve a **Authentication** > **Providers**
2. Habilita **Google**
3. Configura:
   - **Client ID**: Tu Google Client ID
   - **Client Secret**: Tu Google Client Secret
   - **Redirect URL**: `https://tu-proyecto-id.supabase.co/auth/v1/callback`

#### Apple OAuth (opcional)
1. Habilita **Apple**
2. Configura:
   - **Services ID**: Tu Apple Services ID
   - **Team ID**: Tu Apple Team ID
   - **Key ID**: Tu Apple Key ID
   - **Private Key**: Tu Apple Private Key

### Paso 3: Configurar templates de email
1. Ve a **Authentication** > **Email Templates**
2. Personaliza los templates según tu marca:

#### Confirm signup
```html
<h2>Confirma tu cuenta en RuedApp</h2>
<p>Hola,</p>
<p>Gracias por registrarte en RuedApp. Haz clic en el enlace de abajo para confirmar tu cuenta:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar cuenta</a></p>
<p>Si no creaste esta cuenta, puedes ignorar este email.</p>
<p>Saludos,<br>El equipo de RuedApp</p>
```

#### Reset password
```html
<h2>Restablecer contraseña - RuedApp</h2>
<p>Hola,</p>
<p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el enlace de abajo:</p>
<p><a href="{{ .ConfirmationURL }}">Restablecer contraseña</a></p>
<p>Si no solicitaste este cambio, puedes ignorar este email.</p>
<p>Saludos,<br>El equipo de RuedApp</p>
```

## 5. Configurar Storage (Almacenamiento)

### Paso 1: Crear buckets
1. Ve a **Storage** en la barra lateral
2. Crea los siguientes buckets:

#### Bucket: `avatars`
- **Name**: `avatars`
- **Public**: ✅ Público
- **File size limit**: 2MB
- **Allowed MIME types**: `image/jpeg,image/png,image/webp`

#### Bucket: `vehicle-images`
- **Name**: `vehicle-images`
- **Public**: ✅ Público
- **File size limit**: 5MB
- **Allowed MIME types**: `image/jpeg,image/png,image/webp`

#### Bucket: `service-images`
- **Name**: `service-images`
- **Public**: ✅ Público
- **File size limit**: 3MB
- **Allowed MIME types**: `image/jpeg,image/png,image/webp`

### Paso 2: Configurar políticas de storage
1. Ve a **Storage** > **Policies**
2. Para cada bucket, crea las siguientes políticas:

#### Política de lectura pública
```sql
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

#### Política de escritura autenticada
```sql
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);
```

#### Política de actualización del propietario
```sql
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 6. Configurar Edge Functions (Opcional)

### Paso 1: Instalar Supabase CLI
```bash
npm install -g supabase
```

### Paso 2: Autenticarse
```bash
supabase login
```

### Paso 3: Vincular proyecto
```bash
supabase link --project-ref tu-proyecto-id
```

### Paso 4: Desplegar funciones
```bash
supabase functions deploy
```

## 7. Configurar Variables de Entorno para Edge Functions

1. Ve a **Edge Functions** > **Settings**
2. Agrega las siguientes variables:

```bash
# Para notificaciones push
FCM_SERVER_KEY=tu_fcm_server_key

# Para envío de emails
RESEND_API_KEY=tu_resend_api_key

# Para pagos
STRIPE_SECRET_KEY=tu_stripe_secret_key
STRIPE_WEBHOOK_SECRET=tu_stripe_webhook_secret

# Para mapas
GOOGLE_MAPS_API_KEY=tu_google_maps_api_key
```

## 8. Verificar Configuración

### Paso 1: Probar conexión
1. Ejecuta la app en desarrollo:
```bash
npm start
```

2. Verifica que no haya errores de conexión en la consola

### Paso 2: Probar autenticación
1. Intenta registrar un nuevo usuario
2. Verifica que el usuario aparezca en **Authentication** > **Users**
3. Prueba el login con las credenciales creadas

### Paso 3: Probar base de datos
1. Ve a **Table Editor**
2. Verifica que todas las tablas estén creadas
3. Intenta insertar datos de prueba

### Paso 4: Probar storage
1. Intenta subir una imagen desde la app
2. Verifica que aparezca en **Storage**

## 9. Configuración de Producción

### Paso 1: Configurar dominio personalizado (opcional)
1. Ve a **Settings** > **Custom Domains**
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

### Paso 2: Configurar límites de rate limiting
1. Ve a **Settings** > **API**
2. Configura límites apropiados para producción:
   - **Requests per minute**: 100-1000 (según tu plan)
   - **Concurrent connections**: 50-200

### Paso 3: Configurar backups
1. Ve a **Settings** > **Database**
2. Habilita **Point-in-time Recovery** (planes pagos)
3. Configura **Daily Backups**

### Paso 4: Monitoreo
1. Ve a **Reports** para ver métricas
2. Configura alertas en **Settings** > **Billing**
3. Monitorea uso de recursos regularmente

## 10. Troubleshooting

### Problemas comunes

#### Error de conexión
- Verifica que las URLs y keys sean correctas
- Asegúrate de que no haya espacios extra en las variables
- Verifica que el proyecto esté activo en Supabase

#### Error de autenticación
- Verifica la configuración de SITE_URL
- Asegúrate de que las redirect URLs estén configuradas
- Verifica que el email esté confirmado

#### Error de permisos RLS
- Verifica que las políticas RLS estén configuradas
- Asegúrate de que el usuario esté autenticado
- Revisa los logs en **Logs** > **Database**

#### Error de storage
- Verifica que los buckets existan
- Asegúrate de que las políticas de storage estén configuradas
- Verifica los tipos MIME permitidos

### Logs útiles
- **Logs** > **Database**: Errores de base de datos
- **Logs** > **Auth**: Errores de autenticación
- **Logs** > **Storage**: Errores de almacenamiento
- **Logs** > **Edge Functions**: Errores de funciones

## 11. Recursos Adicionales

- [Documentación oficial de Supabase](https://supabase.com/docs)
- [Guías de Supabase](https://supabase.com/docs/guides)
- [Ejemplos de código](https://github.com/supabase/supabase/tree/master/examples)
- [Comunidad de Supabase](https://github.com/supabase/supabase/discussions)
- [Discord de Supabase](https://discord.supabase.com/)

## 12. Checklist de Configuración

- [ ] Proyecto creado en Supabase
- [ ] Variables de entorno configuradas
- [ ] Esquema de base de datos ejecutado
- [ ] Políticas RLS configuradas
- [ ] Funciones personalizadas creadas
- [ ] Autenticación configurada
- [ ] Templates de email personalizados
- [ ] Buckets de storage creados
- [ ] Políticas de storage configuradas
- [ ] Edge Functions desplegadas (opcional)
- [ ] Variables de entorno para Edge Functions (opcional)
- [ ] Conexión probada desde la app
- [ ] Autenticación probada
- [ ] Base de datos probada
- [ ] Storage probado
- [ ] Configuración de producción (cuando sea necesario)

¡Felicidades! Tu proyecto de Supabase está configurado y listo para usar con RuedApp.