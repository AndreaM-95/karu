<h1 align-text:"center">KARU APP</h1>

<h3 align-text:"center">Plataforma de Transporte Seguro</h3>

# 📘 Documentación

## 📋 Descripción del Proyecto
Karu App es una plataforma de transporte tipo ride-sharing que conecta pasajeros con conductores, con un enfoque especial en seguridad y opciones de transporte exclusivo para mujeres. El sistema permite gestionar viajes, vehículos, pagos y calificaciones de manera integral.

---

## 🎯 Objetivos del Proyecto
### Objetivo General
Crear una aplicación backend robusta para gestionar servicios de transporte privado, facilitando la conexión entre pasajeros y conductores, con énfasis en la seguridad y trazabilidad de las operaciones.
### Objetivos Específicos
- Gestionar usuarios con múltiples roles (pasajero, conductor, propietario, administrador)
- Implementar un sistema de viajes con seguimiento en tiempo real
- Manejar pagos y distribución automática de ganancias
- Proveer opciones de transporte exclusivo para mujeres
- Mantener auditoría completa mediante sistema de logs
- Facilitar calificaciones y retroalimentación entre usuarios

---

## 👥 Tipos de Usuarios
`Pasajero (Passenger)`
- Solicita viajes
- Califica conductores
- Realiza pagos
- Visualiza historial de viajes
  
`Conductor (Driver)`
- Acepta y realiza viajes
- Recibe el 70% del valor del viaje
- Puede usar vehículos propios o de terceros
- Debe tener licencia de conducción vigente
  
`Propietario (Owner)`
- Registra vehículos en la plataforma
- Recibe el 30% del valor de los viajes realizados con su vehículo
- Asigna conductores a sus vehículos
- Gestiona el estado de sus vehículos

`Administrador (Admin)`
- Gestiona todos los usuarios
- Supervisa operaciones del sistema
- Procesa liquidaciones
- Accede a reportes y estadísticas

---

## 🔄 Flujo Principal de la Aplicación
### Fase 1: Registro y Configuración
```
Usuario nuevo
├─ Se registra con datos personales (nombre, email, cédula, teléfono, género)
├─ Recibe rol inicial de "pasajero"
└─ Si desea ser conductor u owner, completa información adicional
```

### Fase 2: Configuración de Conductor/Propietario
```
Conductor:
├─ Sube licencia de conducción
├─ Se asocia a un vehículo
└─ Queda disponible para aceptar viajes

Propietario:
├─ Registra vehículo (placa, marca, modelo, etc.)
├─ Marca si es exclusivo para mujeres (opcional)
├─ Asigna conductores
└─ Recibe ganancias del 30%
```

### Fase 3: Solicitud de Viaje
```
Pasajero:
├─ Ingresa coordenadas de origen (latitud, longitud)
├─ Ingresa coordenadas de destino (latitud, longitud)
├─ Sistema calcula distancia usando fórmula de Haversine
├─ Sistema calcula costo según pricingRules
├─ Viaje queda en estado "pending"
└─ Notifica a conductores disponibles
```

### Fase 4: Ejecución del Viaje
```
Conductor:
├─ Ve viajes pendientes
├─ Acepta viaje → estado "accepted"
├─ Inicia viaje → estado "in_progress"
├─ Completa viaje → estado "completed"
└─ Confirma pago
```

### Fase 5: Pago y Distribución
```
Sistema:
├─ Registra pago del pasajero
├─ Calcula distribución automática:
│   ├─ 70% para conductor
│   └─ 30% para propietario (si aplica)
├─ Genera registro en distributionPayment
└─ Acumula para liquidaciones periódicas
```

### Fase 6: Calificación
```
Pasajero:
├─ Califica al conductor (1-5 estrellas)
├─ Deja comentarios opcionales
└─ Calificación afecta reputación del conductor
```

---

## 🏗️ Arquitectura del Sistema
```
src/
 ├── common/
 │   ├── decorators
 │   │   └── user.decorator.ts
 │   ├── exceptions
 │   |   └── custom-http.exception.ts
 │   └── filters
 │       └── http-exception.filter.ts
 ├── migrations/
 │   ├── 1763051831226-InsertLocations.ts
 │   └── 1763082719673-InitMigration.ts
 ├── modules/
 |   ├── auth/
 │   |   ├── decorators/
 |   │   |   └── user.decorator.ts
 │   |   ├── guards/
 |   │   |   ├── jwt.guard.ts
 |   │   |   └── roles.guard.ts
 │   |   ├── strategies/
 |   │   |   └── jwt.strategy.ts
 │   |   ├── auth.controller.spec.ts
 │   |   ├── auth.controller.ts
 │   |   ├── auth.module.ts
 │   |   ├── auth.service.spec.ts
 │   |   └── auth.service.ts
 |   ├── payments/
 │   |   ├── dto/
 |   │   |   ├── create-payment-from-trip.dto.ts
 |   │   |   └── passenger-payment-history-query.dto.ts
 │   |   ├── entities/
 |   │   |   └── Payment.entity.ts
 │   |   ├── payment.controller.spec.ts
 │   |   ├── payment.controller.ts
 │   |   ├── payment.module.ts
 │   |   ├── payment.service.spec.ts
 │   |   └── payment.service.ts
 |   ├── ratings/
 │   |   ├── dto/
 |   │   |   ├── createRating.dto.ts
 |   │   |   └── updateRating.dto.ts
 │   |   ├── entities/
 |   │   |   └── Rating.entity.ts
 │   |   ├── ratings.controller.spec.ts
 │   |   ├── ratings.controller.ts
 │   |   ├── ratings.module.ts
 │   |   ├── ratings.service.spec.ts
 │   |   └── ratings.service.ts
 |   ├── trips/
 │   |   ├── dto/
 |   │   |   ├── create-trip.dto.ts
 |   │   |   └── update-trip.dto.ts
 │   |   ├── entities/
 |   │   |   ├── locations.entity.ts
 |   │   |   └── trip.entity.ts
 │   |   ├── trips.controller.spec.ts
 │   |   ├── trips.controller.ts
 │   |   ├── trips.module.ts
 │   |   ├── trips.service.spec.ts
 │   |   └── trips.service.ts
 |   ├── users/
 │   |   ├── dto/
 |   │   |   ├── change-password.dto.ts
 |   │   |   ├── createUser.dto.ts
 |   │   |   ├── recover-password.dto.ts
 |   │   |   └── updateUser.dto.ts
 │   |   ├── entities/
 |   │   |   └── User.entity.ts
 │   |   ├── users.controller.spec.ts
 │   |   ├── users.controller.ts
 │   |   ├── users.module.ts
 │   |   ├── users.service.spec.ts
 │   |   └── users.service.ts
 |   └──  vehicles/
 │       ├── dto/
 |       |   ├── create-vehicle.dto.ts
 |       |   ├── query-vehicle.dto.ts
 |       |   ├── response-vehicle.dto.ts
 |       |   └── update-vehicle.dto.ts
 │       ├── entities/
 |       |   └── Vehicle.entity.ts
 │       ├── vehicles.controller.spec.ts
 │       ├── vehicles.controller.ts
 │       ├── vehicles.module.ts
 │       ├── vehicles.service.spec.ts
 │       └── vehicles.service.ts
 ├── app.controller.spec.ts
 ├── app.controller.ts
 ├── app.module.ts
 ├── app.service.ts
 └── main.ts
```

---

## 🚀 Endpoints principales

### 🔐 Autenticación
| Método | Ruta | Descripción | Requiere Token |
|--------|-------|--------------|----------------|
| `POST` | `/api/auth/register` | Registra un nuevo usuario | ❌ |
| `POST` | `/api/auth/admin/create` | Crea un suario (Solo admin) | ✅ |
| `POST` | `/api/auth/login` | Inicia sesión y devuelve token JWT | ❌ |
| `POST` | `/api/auth/change-password` | Cambia la contraseña | ✅ |
| `GET` | `/api/auth/me` | Devuelve la informacion del usuario | ✅ |

---

### 👤 Usuarios
| Método | Ruta | Descripción | Requiere Token | Rol permitido |
|--------|-------|--------------|----------------|----------------|
| `GET` | `/api/users/:rol` | Listar todos los usuarios por el rol | ✅ | admin |
| `GET` | `/api/users/:idUser` | Listar un usuario por su id | ✅ | admin |
| `POST` | `/api/users` | Crear un usuario | ✅ | admin |
| `PATCH` | `/api/users/:idUser` | Actualizar la información de un usuario | ✅ | admin |

---

### 🚕 Vehículos
| Método | Ruta | Descripción | Requiere Token | Rol permitido |
|--------|-------|--------------|----------------|----------------|
| `GET` | `/api/vehicles` | Obtiene los vehículos | ✅ |  |
| `GET` | `/api/vehicles/owner/:ownerId` | Obtiene los vehículos de un propietario | ✅ |  |
| `GET` | `/api/vehicles/driver/:driverId` | Obtiene los vehículos de una conductora | ✅ |  |
| `GET` | `/api/vehicles/:id/trips` | Historial de viajes de un vehículo | ✅ |  |
| `GET` | `/api /vehicles/:id/stats` | Estadísticas del vehículo | ✅ |  |
| `GET` | `/api/vehicles/:id` | Información completa de un vehículo | ✅ |  |
| `POST` | `/api/vehicles` | Crear un vehículo | ✅ | admin |
| `POST` | `/api/vehicles/assign-driver` | Asignar un vehículo | ✅ | admin |
| `PATCH` | `/api/vehicles/:id/status` | Actualizar el estado de un vehículo | ✅ | admin |

---

### 🗺️ Viajes
| Método | Ruta | Descripción | Requiere Token | Rol permitido |
|--------|-------|--------------|----------------|----------------|
| `GET` | `/api/trips/locations` | Lista todas las ubicaciones disponibles | ✅ | Todos |
| `GET` | `/api/trips/locations/:nameLocality` | Lista los barrios de una localidad | ✅ | Todos |
| `GET` | `/api/trips/my-trips` | Historial de viajes del usuario autenticado | ✅ | Todos |
| `POST` | `/api/trips/request-trip` | Crear un viaje | ✅ | Pasajera |
| `PUT` | `/api/trips/complete-trip/:tripId` | Terminar el viaje | ✅ | Pasajera y conductora |
| `PUT` | `/api/trips/cancel-trip/:tripId` | Cancelar viaje | ✅ | Pasajera y conductora |

---

### 💰 Pagos
| Método | Ruta | Descripción | Requiere Token | Rol permitido |
|--------|-------|--------------|----------------|----------------|
| `GET` | `/api/payments` | Obtiene el historial de pagos | ✅ |  |
| `GET` | `/api/payments/earnings` | Obtiene la ganancia para cada usuario | ✅ |  |
| `GET` | `/api/settlements` | Obtiene la liquidación de un periodo | ✅ |  |
| `POST` | `/api/payments` | Crea un pago | ✅ |  |
| `POST` | `/api/settlements/generate` | Genera las liquidaciones de un usuario| ✅ |  |

---

### ✅ Calificaciones
| Método | Ruta | Descripción | Requiere Token | Rol permitido |
|--------|-------|--------------|----------------|----------------|
| `GET` | `/api/rating` | Lista todas las calificaciones de un usuario | ✅ | admin |
| `GET` | `/api/rating/all` | Devuelve un reporte con la información de las calificaciones | ✅ | Pasajera y conductora |
| `GET` | `/api/rating/:idRating` | Lista una calificacion por su id | ✅ | Pasajera y conductora |
| `POST` | `/api/rating` | Crea una calificación | ✅ | Pasajera y conductora |

---

## 🔑 Autenticación

- Los endpoints protegidos requieren un **token JWT** en el header:  
  ```
  Authorization: Bearer <token>
  ```
- Los tokens se generan al iniciar sesión (`/api/authM/login`).  
- Las contraseñas se almacenan **encriptadas con bcrypt** antes de guardarse en la base de datos.

---

## 🧪 Pruebas con Postman

- **Colección:** `Consultas-UsuariosProductos.postman_collection.json`
- **Variable de entorno:**  
  ```
  {{BASE_URL}} = http://localhost:4000
  ```

### Ejemplo de flujo de prueba

1. Registrar un usuario (`/api/authM/register`)
2. Iniciar sesión (`/api/authM/login`)
3. Copiar el token JWT devuelto
4. Usar el token para acceder a `/api/users`, `/api/tasks` o `/api/grades`

**Ejemplo de Login Request:**
```json
{
  "email": "user@ejemplo.com",
  "password": "123456"
}
```

**Ejemplo de Login Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## ⚙️ Configuración del entorno

Archivo `.env`:
```
PORT = 4000
APP_NAME= ManagerUsers
DB_HOST= localhost
DB_PORT= 3306
DB_USERNAME= nombre_de_usuario
DB_PASSWORD= contraseña
DB_NAME= nombre_base_de_datos
JWT_SECRET_KEY= llave_secreta
JWT_EXPIRES_IN= tiempo_expiracion_token
```

---


## 💾 Características de la Base de Datos
- ✅ Normalizada - Evita redundancia de datos
- ✅ Con índices - Optimizada para búsquedas rápidas
- ✅ Integridad referencial - Foreign keys con restricciones
- ✅ Auditable - Sistema completo de logs
- ✅ Escalable - Preparada para crecimiento
- ✅ Flexible - Roles y configuraciones dinámicas

---

## 🔐 Características de Seguridad
- Transporte Exclusivo para Mujeres
- Campo gender obligatorio en registro de usuarios
- Campo exclusiveForWomen en vehículos

### Validaciones en backend:
- Solo mujeres pueden solicitar viajes en vehículos exclusivos
- Solo conductoras pueden manejar vehículos exclusivos
- Sistema rechaza automáticamente solicitudes no válidas

### Auditoría y Trazabilidad:
- Todos los cambios importantes quedan registrados en activityLogs
- Registro de intentos de acceso no autorizado
- Tracking de cancelaciones con razón
- Historial completo de cambios en datos sensibles
- Validaciones de Negocio
- Conductores deben tener licencia vigente
- Vehículos deben estar activos para aceptar viajes
- Solo el propietario puede modificar su vehículo
- Validación de roles para cada operación

---

## 💰 Sistema de Pagos y Distribución
### Cálculo de Distancia (Fórmula de Haversine)
El sistema calcula la distancia entre dos puntos geográficos usando la Fórmula de Haversine, que considera la curvatura de la Tierra:

```
private calculateDistance( lat1: number, lon1: number, lat2: number, lon2: number, ): number {
  const R = 6371;
  const dLat = this.deg2rad(lat2 - lat1);
  const dLon = this.deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Number(distance.toFixed(2));
}

private deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
```

Ejemplo:
- Origen: 4.6097° N, -74.0817° W (Bogotá Centro)
- Destino: 4.7110° N, -74.0721° W (Bogotá Norte)
- Distancia: ~11.5 km

Ejemplo para Carro:
- Tarifa Base: $3,000
- Distancia: 11.5 KM
- Costo Total: (distancia * tarifa) = $34,500

### Distribución de Ganancias
`Escenario 1:` Conductor con vehículo propio
- Conductor recibe: 100% del valor del viaje

`Escenario 2:` Conductor con vehículo de tercero
- Conductor recibe: 70% del valor del viaje
- Propietario recibe: 30% del valor del viaje

### Liquidaciones
- Se generan periódicamente (configurable)
- Agrupan todas las ganancias del período
- Registran fecha de pago
- Permiten trazabilidad de pagos realizados

---

## 🛠️ Stack tecnológico
`Backend`
- Node.js + Express.js
- MySQL (base de datos)
- JWT (autenticación)
- Bcrypt (encriptación de contraseñas)

`Servicios Externos`
- Fórmula de Haversine para cálculo de distancias entre coordenadas

`Herramientas`
- Postman (testing de API)
- Git (control de versiones)
- Swagger (Documenatación)
- Vercel (Despliegue del backend)
- Render (Despliegue de la base de datos)

---

## Notas adicionales
- **Versión actual:** v1.0.0
- **Última actualización:** 18/11/2025  
- **Equipo de desarrollo:**
  - `Andrea Mejia`: Scrum Master - Dev Backend
  - `Marcela Ramirez`: Product owner - Dev Backend
  - `Valeria Vargas`: Dev Backend
  - `Heidy Romero`: Dev Backend

---

📄 **Fin de la documentación**