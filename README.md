
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:ff6ec7,100:a964ff&height=180&section=header&text=KARU%20API&fontSize=50&fontColor=ffffff&animation=fadeIn&fontAlignY=40"/>

# 🎉 **Somos NovaHer Technologies — Bienvenidos**
### 🚗💜 *Plataforma de Transporte Seguro (Enfoque en Mujeres)*

---

</div>

---

## 📘 Documentación de la API

Este documento describe el backend de **Karu**, sus objetivos, la arquitectura del sistema, cómo ejecutarlo localmente, las variables de entorno requeridas y ejemplos de los endpoints principales.

Incluye:

✔ Descripción del proyecto  
✔ Objetivos del API  
✔ Roles del equipo  
✔ Instrucciones para ejecutar la API  
✔ Variables de entorno  
✔ Ejemplos reales de endpoints  
✔ Seguridad, pagos, arquitectura y más  

---

## 📋 Descripción del Proyecto

**Karu** es una plataforma de transporte tipo ride-sharing que conecta pasajeros con conductores, con un enfoque especial en seguridad y opciones de transporte exclusivo para mujeres. El sistema permite gestionar viajes, vehículos, pagos y calificaciones de manera integral.

La API permite:

- 👥 Gestión de usuarios (pasajeras, conductoras, propietarias, administradores)
- 🚘 Gestión de vehículos con exclusividad opcional para mujeres
- 🗺️ Solicitud y gestión de viajes en tiempo real
- ⭐ Calificaciones y reputación
- 💰 Historial de pagos, ganancias y distribución
- 📊 Auditoría, logs y control administrativo

---

## 🎯 Objetivo del API

### 🎯 Objetivo General  
Proveer un backend estable, seguro y escalable que gestione toda la lógica del ecosistema de movilidad de Karu.

### 🎯 Objetivos Específicos  
- Gestión robusta de usuarios con roles dinámicos  
- Módulo completo de viajes  
- Control total de vehículos  
- Pagos automáticos con distribución conductor/propietario  
- Auditoría completa de todas las operaciones  
- Trazabilidad del estado de cada viaje  

---

## 👥 Tipos de Usuarios

### 👤 Pasajera (Passenger)
- Solicita viajes  
- Realiza pagos  
- Califica a la conductora  
- Tiene historial de viajes  

### 🚘 Conductora (Driver)
- Acepta viajes  
- Completa rutas  
- Recibe 54% del viaje si el vehículo tiene propietaria
- Recibe **90%** del viaje si NO hay propietaria  
- Puede usar vehículo propio o asignado  

### 🚗 Propietaria (Owner)
- Registra vehículos  
- Asigna conductoras  
- Recibe 36% del valor del viaje cuando su vehículo es utilizado

### 🛡️ Administrador (Admin)
- Control total del sistema  
- Gestión de usuarios, vehículos, viajes y reportes  
- Recibe el 10% de las ganancias de los viajes

---

## 🔄 Flujo Principal de la Aplicación

### FASE 1 — Registro

```txt
Usuario nuevo
├─ Llena sus datos
├─ Se le asigna rol “pasajero”
└─ Puede actualizar para ser conductor u owner
```

### FASE 2 — Habilitación de conductor / propietario

```txt
Conductor:
├─ Sube documentación
├─ Se asocia a vehículo
└─ Queda habilitado

Propietario:
├─ Registra vehículo
├─ Marca exclusividad opcional
└─ Asigna conductoras
```

### FASE 3 — Solicitud del viaje

```txt
Pasajera:
├─ Indica origen
├─ Indica destino
├─ Sistema calcula costo (Haversine)
└─ Se notifica a conductoras disponibles
```

### FASE 4 — Ejecución

```txt
Conductor:
├─ Acepta viaje
├─ Llega al origen
├─ Inicia viaje
└─ Completa viaje
```

### FASE 5 — Pago

```txt
Sistema:
├─ Calcula distribución automática
│   ├─ 10% Administrador
│   ├─ 54% Conductora (si hay propietaria)
│   ├─ 36% Propietaria (si su vehículo es usado)
│   └─ 90% Conductora cuando NO hay propietaria
├─ Registra pago
└─ Actualiza historial financiero
```

### FASE 6 — Calificación

```txt
Pasajera:
├─ Califica
└─ Deja comentarios
```

---

## 🏗️ Arquitectura del Sistema

Basada en **NestJS + TypeORM + MySQL**.

```
src/
 ├── common/
 │   ├── decorators
 │   │   └── user.decorator.ts
 │   ├── exceptions
 │   |   └── custom-http.exception.ts
 │   ├── filters
 │   |   └── http-exception.filter.ts
 │   └── validators
 │       └── is-adult.decorator.ts
 ├── migrations
 │   ├── 1763051831226-InsertLocations.ts
 │   ├── 1763355062436-SeedVehicles.ts
 │   ├── 1763522992399-SeedUsers.ts
 │   └── 1763523631917-InitMigration.ts 
 ├── modules/
 |   ├── auth/
 │   |   ├── decorators/
 |   │   |   ├── match.decorator.ts
 |   │   |   └── user.decorator.ts 
 │   |   ├── dto/
 |   │   |   ├── admin-create-user.dto.ts
 |   │   |   ├── change-password-user.dto.ts
 |   │   |   ├── login-user.dto.ts
 |   │   |   └── register.dto.ts
 │   |   ├── guards/
 |   │   |   ├── test
 |   |   │   |   ├── jwt.guard.spec.ts
 |   |   │   |   └── roles.guard.spec.ts
 |   │   |   ├── jwt.guard.ts
 |   │   |   └── roles.guard.ts
 │   |   ├── strategies/
 |   │   |   ├── jwt.strategy.spec.ts
 |   │   |   └── jwt.strategy.ts
 │   |   ├── test/
 |   │   |   ├── auth.controller.spec.ts
 |   │   |   └── auth.service.spec.ts
 │   |   ├── auth.controller.ts
 │   |   ├── auth.module.ts
 │   |   └── auth.service.ts
 |   ├── payments/
 │   |   ├── dto/
 |   │   |   ├── create-payment-from-trip.dto.ts
 |   │   |   ├── earnings-query.dto.ts
 |   │   |   ├── passenger-payment-history-query.dto.ts
 |   │   |   └── payment-response.dto.ts
 │   |   ├── entities/
 |   │   |   └── Payment.entity.ts
 │   |   ├── test/
 |   │   |   ├── payment.controller.spec.ts
 |   │   |   └── payment.service.spec.ts
 │   |   ├── payment.controller.ts
 │   |   ├── payment.module.ts
 │   |   └── payment.service.ts
 |   ├── ratings/
 │   |   ├── dto/
 |   │   |   └── createRating.dto.ts
 │   |   ├── entities/
 |   │   |   └── Rating.entity.ts
 │   |   ├── test/
 |   │   |   ├── ratings.controller.spec.ts
 |   │   |   └── ratings.service.spec.ts
 │   |   ├── ratings.controller.ts
 │   |   ├── ratings.module.ts
 │   |   └── ratings.service.ts
 |   ├── trips/
 │   |   ├── dto/
 |   │   |   └── create-trip.dto.ts
 │   |   ├── entities/
 |   │   |   ├── locations.entity.ts
 |   │   |   └── trip.entity.ts
 │   |   ├── test/
 |   │   |   ├── trips.controller.spec.ts
 |   │   |   └── trips.service.spec.ts
 │   |   ├── trips.controller.ts
 │   |   ├── trips.module.ts
 │   |   └── trips.service.ts
 |   ├── users/
 │   |   ├── dto/
 |   │   |   ├── change-password.dto.ts
 |   │   |   ├── createUser.dto.ts
 |   │   |   ├── recover-password.dto.ts
 |   │   |   ├── updateDriverStatus.dto.ts
 |   │   |   ├── updateUserAdmin.dto.ts
 |   │   |   └── updateUserSelf.dto.ts
 │   |   ├── entities/
 |   │   |   └── User.entity.ts
 │   |   ├── test/
 |   │   |   ├── users.controller.spec.ts
 |   │   |   └── users.service.spec.ts
 │   |   ├── users.controller.ts
 │   |   ├── users.module.ts
 │   |   └── users.service.ts
 |   └──  vehicles/
 │       ├── dto/
 |       |   ├── assing-driver.dto.ts
 |       |   ├── create-vehicle.dto.ts
 |       |   ├── query-vehicle.dto.ts
 |       |   ├── update-vehicle-status.dto.ts
 |       |   └── vehicle-response.dto.ts
 │       ├── entities/
 |       |   └── Vehicle.entity.ts
 │       ├── test/
 |       |   ├── vehicles.controller.spec.ts
 |       |   └── vehicles.service.spec.ts
 │       ├── vehicles.controller.ts
 │       ├── vehicles.module.ts
 │       └── vehicles.service.ts
 ├── app.controller.spec.ts
 ├── app.controller.ts
 ├── app.module.ts
 ├── app.service.ts
 └── main.ts
```

---

## 🧪 Pruebas Unitarias y Evidencias

### 🧪 Pruebas Unitarias

Las pruebas unitarias se implementaron usando **Jest** sobre los módulos principales de la API:

- **Auth**  
- **Users**   
- **Trips**
- **Raitings**  
- **Payments**
- **Vehicles**

#### Ejecución de pruebas

```bash
npm run test
npm run test:cov
```
## Resultado de la ejecución
Todas las pruebas configuradas se ejecutan correctamente:
```bash
Test Suites: 16 passed, 16 total
Tests:       215 passed, 215 total
```
### Coverage
<img width="500" height="806" alt="Test-Coverage" src="https://github.com/user-attachments/assets/9086e835-56b8-4221-bbc4-813643a5e444" />

---

## 🛠️ Stack Tecnológico

- Node.js  
- NestJS  
- TypeORM  
- MySQL  
- JWT  
- Bcrypt  
- Swagger  
- Postman  
- Git  

---

## ⚙ Variables de Entorno

```env
PORT=4000
APP_NAME=app-karu
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=******
DB_NAME=karu_app
JWT_SECRET_KEY=mi_llave_segura
JWT_EXPIRES_IN=1h
```

---

## ▶️ Instrucciones para Ejecutar la API

```bash
npm install
cp .env.template .env
npm run migration:run
npm run start:dev
```

Localhost:

```
http://localhost:4000
```

Swagger:

```
http://localhost:4000/api
```

---

# 🚀 ENDPOINTS COMPLETOS

## 🔐 Auth — `/auth`

| Método | Ruta | Descripción |
|--------|-------|-------------|
| POST | `/auth/register` | Registrar |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Ver usuario |
| POST | `/auth/change-password` | Cambiar contraseña |
| POST | `/auth/admin/create` | Crear usuario admin |

---

## 👤 Usuarios — `/api/users`

| Método | Ruta |
|--------|-------|
| GET | `/users` |
| GET | `/users/:id` |
| GET | `/users/rol/:rol` |
| GET | `/users/name/:name` |
| POST | `/users` |
| PATCH | `/users/:id` |
| PATCH | `/users/passenger/me` |
| PATCH | `/driverStatus/:idDriver`|
| DELETE | `/users/:id` |

---

## 🚗 Vehículos — `/vehicles`

| Método | Ruta |
|--------|-------|
| POST | `/vehicles` |
| POST | `/vehicles/assign-driver` |
| GET | `/vehicles` |
| GET | `/vehicles/owner/:ownerId` |
| GET | `/vehicles/driver/:driverId` |
| GET | `/vehicles/:id/trips` |
| GET | ` /vehicles/:id/stats` |
| GET | `/vehicles/:id` |
| PATCH | `/vehicles/:id/status` |

---

## 🗺️ Viajes — `/api/trips`

| Método | Ruta |
|--------|-------|
| GET | `/trips/locations` |
| GET | `/trips/locations/:locality` |
| GET | `/trips/my-trips` |
| POST | `/trips/request-trip` |
| PUT | `/trips/complete-trip/:tripId` |
| PUT | `/trips/cancel-trip/:tripId` |

---

## 💰 Pagos — `/payments`

| Método | Ruta |
|--------|-------|
| POST | `/payments/from-trip` |
| GET | `/payments/me/history` |
| GET | `/payments/me/earnings` |
| GET | `/payments/admin/summary` |

---

## ⭐ Calificaciones — `/api/ratings`

| Método | Ruta |
|--------|-------|
| GET | `/rating/admin` |
| GET | `/rating/admin/:id` |
| GET | `/rating/myratings` |
| POST | `/ratings` |

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
---

## 🧑‍💻 Equipo y Roles

- **⭐ Andrea Mejía** — Scrum Master / Backend  
- **⭐ Marcela Ramírez** — Product Owner / Backend  
- **⭐ Valeria Vargas** — Backend  
- **⭐ Heidy Romero** — Backend  

---

## 📄 Licencia

💜 **KARU APP** — Movilidad segura en Bogotá.  
© 2025 **NovaHer Technologies** — Todos los derechos reservados.

