# ⚡ Vue Base Template

Starter project listo para producción construido con **Vue 3 + Vite + TypeScript + Element Plus**, preparado para conectarse con un backend **Laravel** que use **Sanctum/JWT** y **OAuth con Google**.

---

## 🚀 Inicio rápido

```bash
# 1. Clonar / descargar el proyecto
# 2. Copiar variables de entorno
cp .env.example .env

# 3. Instalar dependencias
npm install

# 4. Lanzar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## 📁 Estructura del proyecto

```
src/
├── api/
│   ├── axios.ts          # Instancia Axios + interceptores
│   └── auth.ts           # Endpoints de autenticación
├── assets/
│   └── styles/
│       └── main.css      # Estilos globales
├── components/
│   └── layout/
│       └── MainLayout.vue  # Navbar + footer
├── composables/
│   └── useAuth.ts        # Lógica de auth + navegación
├── router/
│   └── index.ts          # Rutas + navigation guards
├── stores/
│   └── auth.ts           # Pinia store de autenticación
├── types/
│   ├── auth.ts           # Tipos TypeScript de auth
│   └── router.d.ts       # Extensión de tipos para meta
└── views/
    ├── HomeView.vue
    ├── LoginView.vue
    ├── RegisterView.vue
    ├── ProfileView.vue
    └── AuthCallbackView.vue  # Callback OAuth Google
```

---

## 🔌 Conectar con Laravel

### 1. Configurar la URL base

Edita `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 2. Endpoints del backend

| Método | Endpoint                      | Auth         | Descripción                      |
|--------|-------------------------------|--------------|----------------------------------|
| POST   | `/api/auth/register`          | No           | Registro (devuelve token + user) |
| POST   | `/api/auth/login`             | No           | Login (devuelve token + user)    |
| POST   | `/api/auth/logout`            | Bearer token | Revoca el token                  |
| GET    | `/api/user`                   | Bearer token | Perfil del usuario               |
| GET    | `/api/auth/google/redirect`   | No           | Inicia flujo OAuth Google        |
| GET    | `/api/auth/google/callback`   | No           | Callback OAuth (gestionado por el navegador) |

> **Usuarios de prueba (seeder):** `test@example.com` / `password`

### 3. Estructura de respuesta esperada

Todas las respuestas siguen el mismo envoltorio:

```json
{
  "success": true,
  "data": { ... },
  "message": "string"
}
```

```json
// POST /api/auth/login  |  POST /api/auth/register
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "avatar": null,
      "created_at": "2026-03-11T10:00:00.000000Z"
    },
    "token": "1|abc123xyz..."
  },
  "message": "Login successful."
}

// GET /api/user
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "avatar": null,
      "created_at": "2026-03-11T10:00:00.000000Z"
    }
  },
  "message": "User profile retrieved successfully."
}
```

OAuth Google — en caso de éxito el backend redirige a:
```
http://localhost:3000/auth/callback?token=3|ghi789rst...
```
En caso de error:
```
http://localhost:3000/auth/callback?error=google_auth_failed
```

### 4. CORS en Laravel

En `config/cors.php`:

```php
'allowed_origins' => ['http://localhost:3000'],
'supports_credentials' => true,
```

### 5. Laravel Sanctum

En `config/sanctum.php`:

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost:3000')),
```

En el controlador:

```php
// AuthController.php
public function login(Request $request)
{
    if (!Auth::attempt($request->only('email', 'password'))) {
        return response()->json([
            'success' => false,
            'data'    => null,
            'message' => 'Invalid credentials. Please check your email and password.',
        ], 401);
    }

    $user  = Auth::user();
    $token = $user->createToken('api-token')->plainTextToken;

    return response()->json([
        'success' => true,
        'data'    => ['user' => $user, 'token' => $token],
        'message' => 'Login successful.',
    ]);
}
```

---

## 🔐 OAuth con Google

### 1. Instalar Socialite en Laravel

```bash
composer require laravel/socialite
```

### 2. Configurar en `config/services.php`

```php
'google' => [
    'client_id'     => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect'      => env('GOOGLE_REDIRECT_URI'),
],
```

### 3. Rutas en Laravel

```php
Route::get('/api/auth/google/redirect', [AuthController::class, 'googleRedirect']);
Route::get('/api/auth/google/callback', [AuthController::class, 'googleCallback']);
```

### 4. Controlador

```php
public function googleRedirect()
{
    return Socialite::driver('google')->stateless()->redirect();
}

public function googleCallback()
{
    $googleUser = Socialite::driver('google')->stateless()->user();

    $user = User::updateOrCreate(
        ['email' => $googleUser->getEmail()],
        ['name'  => $googleUser->getName()]
    );

    $token = $user->createToken('google-token')->plainTextToken;

    // Redirigir al frontend con el token
    return redirect(env('FRONTEND_URL') . '/auth/callback?token=' . $token);
}
```

### 5. Variables de entorno en Laravel `.env`

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

---

## 🛠️ Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run preview   # Preview del build
npm run lint      # Linting con ESLint
npm run format    # Formateo con Prettier
```

---

## 📦 Stack tecnológico

| Tecnología     | Versión | Uso                          |
|----------------|---------|------------------------------|
| Vue 3          | ^3.4    | Framework UI                 |
| Vite           | ^5.1    | Build tool                   |
| TypeScript     | ^5.4    | Tipado estático              |
| Vue Router     | ^4.3    | Enrutamiento + guards        |
| Pinia          | ^2.1    | Estado global                |
| Element Plus   | ^2.6    | Componentes UI               |
| Axios          | ^1.6    | HTTP client + interceptores  |
| ESLint         | ^8.57   | Linting                      |
| Prettier       | ^3.2    | Formateo de código           |
