
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:ff6ec7,100:a964ff&height=180&section=header&text=KARU%20API&fontSize=50&fontColor=ffffff&animation=fadeIn&fontAlignY=40"/>

### *🚗 KARU APP — Movilidad segura en Bogotá (Enfoque en Mujeres)*

</div>

---

## 📘 DOCUMENTACIÓN
Este documento describe el backend de **Karu**, sus objetivos, la arquitectura del sistema, cómo ejecutarlo localmente, las variables de entorno requeridas y los endpoints principales.

Incluye:

1. Descripción del proyecto  
2. Objetivos
3. Tipos de usuarios
4. Flujos de ejecución
5. Instrucciones para ejecutar la API  
6. Arquitectura
7. Endpoints
8. Seguridad
9. Roles y licencia

---

## 📋 DESCRIPCIÓN

**Karu** es una plataforma de transporte tipo ride-sharing que conecta pasajerass con conductoras, con un enfoque especial en seguridad y opciones de transporte exclusivo para mujeres. El sistema permite gestionar viajes, vehículos, pagos y calificaciones de manera integral. KARU es una plataforma de movilidad diseñada para ofrecer viajes seguros y confiables para mujeres, integrando validaciones estrictas de negocio, auditoría completa y un sistema de pagos basado en distancia real.
El backend implementa reglas claras de acceso, trazabilidad de acciones y cálculos precisos de tarifas, garantizando transparencia y seguridad tanto para usuarias como conductoras.

### La API permite:

- 👥 Gestión de usuarios (pasajeras, conductoras, propietarias, administradores)
- 🚘 Gestión de vehículos con exclusividad opcional para mujeres
- 🗺️ Solicitud y gestión de viajes en tiempo real
- 💰 Historial de pagos, ganancias y distribución
- ⭐ Calificaciones y reputación
- 📊 Auditoría, logs y control administrativo


### 🛠️ Stack Tecnológico

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

## 🎯 OBJETIVOS

### Objetivo General  
Proveer un backend estable, seguro y escalable que gestione toda la lógica del ecosistema de movilidad de Karu.

### Objetivos Específicos  
- Gestión robusta de usuarios con roles dinámicos  
- Control total de vehículos  
- Módulo completo de viajes  
- Pagos automáticos con distribución conductor/propietario/administrador de la plataforma
- Auditoría completa de todas las operaciones  

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

## 🔄 FLUJOS

### Registro de un usuario (Propietari@, conductora, pasajera)

```txt
Usuario nuevo
├─ Llena sus datos
├─ Se le asigna rol “pasajero”
└─ Puede actualizar para ser conductor o propietario
```

### Habilitación de conductor / propietario
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

### Solicitud del viaje
```txt
Pasajera:
├─ Indica origen
├─ Indica destino
├─ Sistema calcula costo (Haversine) y distancia
│   ├─ Distancia del viaje
│   ├─ Costo del viaje
│   └─ Asigna la primera conductora disponible 
└─  Inicia el viaje
```

### Ejecución
```txt
Conductora o pasajera:
├─ Finaliza el viaje
├─ Realiza el pago
└─ Agrega una calificación
```

### Pago
```txt
Sistema:
├─ Calcula distribución automática
│   ├─ 10% Administrador
│   ├─ 54% Conductora (si hay propietaria)
│   ├─ 36% Propietaria (si su vehículo es usado)
│   └─ 90% Conductora cuando NO hay propietaria
└─  Registra pago
```

### Calificación
```txt
Conductora / Pasajera:
├─ Selecciona el viaje a calificar
│   ├─ Verifica que el estado del viaje sea el permitido
│   ├─ Verifica que no hayan transcurrido más de 24 horas desde que tomó el viaje
│   ├─ Recibe la calificación
│   └─ Calcula promedio de calificaciones 
└─  Registra la calificación del viaje
```

---

## ▶️ INSTRUCCIONES PARA EJECUTAR LA API

Variables de Entorno
```env
PORT= 4000
APP_NAME= app-karu
DB_HOST= localhost
DB_PORT= 3306
DB_USERNAME= root
DB_PASSWORD= contraseña
DB_NAME= nombre_base_de_datos
JWT_SECRET_KEY= mi_llave_segura
JWT_EXPIRES_IN= 1h
```

Consola:
```
npm install
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

### 🧪 Pruebas Unitarias y Evidencias

#### Ejecución de pruebas

```bash
npm run test
npm run test:cov
```
#### Resultado de la ejecución

<img width="400" height="806" alt="Test-Coverage" src="https://github.com/user-attachments/assets/9086e835-56b8-4221-bbc4-813643a5e444" />

---

## 🏗️ ARQUITECTURA

```
src/
 ├── common/
 │   ├── decorators
 │   ├── exceptions
 │   ├── filters
 │   └── validators
 ├── migrations
 ├── modules/
 |   ├── auth/
 │   |   ├── decorators/
 │   |   ├── dto/
 │   |   ├── guards/
 |   │   |   └── test
 │   |   ├── strategies/
 │   |   ├── test/
 │   |   ├── auth.controller.ts
 │   |   ├── auth.module.ts
 │   |   └── auth.service.ts
 |   ├── payments/
 │   |   ├── dto/
 │   |   ├── entities/
 │   |   ├── test/
 │   |   ├── payment.controller.ts
 │   |   ├── payment.module.ts
 │   |   └── payment.service.ts
 |   ├── ratings/
 │   |   ├── dto/
 │   |   ├── entities/
 │   |   ├── test/
 │   |   ├── ratings.controller.ts
 │   |   ├── ratings.module.ts
 │   |   └── ratings.service.ts
 |   ├── trips/
 │   |   ├── dto/
 │   |   ├── entities/
 │   |   ├── test/
 │   |   ├── trips.controller.ts
 │   |   ├── trips.module.ts
 │   |   └── trips.service.ts
 |   ├── users/
 │   |   ├── dto/
 │   |   ├── entities/
 │   |   ├── test/
 │   |   ├── users.controller.ts
 │   |   ├── users.module.ts
 │   |   └── users.service.ts
 |   └──  vehicles/
 │       ├── dto/
 │       ├── entities/
 │       ├── test/
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

## 🚀 ENDPOINTS

### 🔐 Auth — `/auth`

| Método | Ruta | Descripción | Requiere Token |
|--------|-------|--------|-------|
| POST | `/auth/register` | Registra un nuevo usuario | ❌ |
| POST | `/auth/login` | Inicia sesión y devuelve token JWT | ❌ |
| POST | `/auth/change-password` | Cambia la contraseña | ✅ |
| GET | `/auth/me` | Devuelve la informacion del usuario | ✅ |


### 👤 Usuarios — `/api/users`

| Método | Ruta | Descripción | Rol permitido | Token |
|--------|-------|--------|-------|-------|
| POST | `/api/users` | Crear un usuario | admin | ✅ |
| GET | `/api/users` | Lista todos los usuarios | Administrador | ✅ |
| GET | `/api/users/:id` | Muestra un sólo usuario | Administrador | ✅ |
| GET | `/api/users/rol/:rol` | Muestra los usuarios filtrados por su rol | Administrador | ✅ |
| GET | `/api/users/name/:name` | Busca a un usuario por su nombre | Administrador y propietario | ✅ |
| PATCH | `/api/users/:id` | Actualiza la información de un usuario | Administrador | ✅ |
| PATCH | `/api/users/passenger/me` | Actualiza su propia información | Pasajera | ✅ |
| PATCH | `/api/driverStatus/:idDriver`| Actualiza su estado | Administrador y conductora | ✅ |
| DELETE | `/api/users/:id` | Desactiva a un usuario | Administrador | ✅ |

### 🚗 Vehículos — `/vehicles`

| Método | Ruta | Descripción | Rol permitido | Token |
|--------|-------|--------|-------|-------|
| POST | `/vehicles` | Crea el registro de un nuevo vehículo | Administrador y propietario | ✅ |
| POST | `/vehicles/assign-driver` | Asigna una conductora al vehículo | Administrador | ✅ |
| GET | `/vehicles` | Lista tods los vehículos | Administrador | ✅ |
| GET | `/vehicles/owner/:ownerId` | Lista los vehículos de un propietario | Administrador | ✅ |
| GET | `/vehicles/driver/:driverId` | Lista los vehículos asignados a una conductora | Administrador | ✅ |
| GET | `/vehicles/:id/trips` | Historial de viajes de un vehículo | Administrador | ✅ |
| GET | ` /vehicles/:id/stats` | Estadísticas de un viaje | Administrador | ✅ |
| GET | `/vehicles/:id` | Información completa de un vehículo | Administrador | ✅ |
| PATCH | `/vehicles/:id/status` | Actualiza el estado de un vehículo | Administrador | ✅ |

### 🗺️ Viajes — `/api/trips`

| Método | Ruta | Descripción | Rol permitido | Token |
|--------|-------|--------|-------|-------|
| POST | `/api/trips/request-trip` | Crear un viaje | Pasajera | ✅ |
| GET | `/api/trips/locations` | Lista todas las ubicaciones | Todos | ✅ |
| GET | `/api/trips/locations/:locality` | Lista los barrios de una localidad | Todos | ✅ |
| GET | `/api/trips/my-trips` | Historial de viajes del usuario | Conductora y pasajera | ✅ |
| PUT | `/api/trips/complete-trip/:tripId` | Terminar el viaje | Conductora y pasajera | ✅ |
| PUT | `/api/trips/cancel-trip/:tripId` | Cancelar viaje | Conductora y pasajera | ✅ |

### 💰 Pagos — `/payments`

| Método | Ruta | Descripción | Rol permitido | Token |
|--------|-------|--------|-------|-------|
| POST | `/payments/from-trip` | Registra un pago del viaje terminado | Todos | ✅ |
| GET | `/payments/me/history` | Historial de pagos | Todos | ✅ |
| GET | `/payments/me/earnings` | Muestra las ganancias del usuario | Todos | ✅ |
| GET | `/payments/admin/summary` | Resúmen general de pagos | Administrador | ✅ |

### ⭐ Calificaciones — `/api/ratings`

| Método | Ruta | Descripción | Rol permitido | Token |
|--------|-------|--------|-------|-------|
| POST | `/ratings` | Crea una calificación del viaje terminado | Conductora y pasajera | ✅ |
| GET | `/rating/admin` | Listado de todas las calificaciones | Administrador | ✅ |
| GET | `/rating/admin/:id` | Calificaciones por rol | Administrador y propietario | ✅ |
| GET | `/rating/myratings` | Calificaciones del usuario | Conductora y pasajera | ✅ |

---

## 🔐 SEGURIDAD
- Transporte Exclusivo para Mujeres
- Campo `gender` obligatorio en registro de usuarios
- Campo `exclusiveForWomen` en vehículos

### Validaciones en backend:
- Solo mujeres pueden solicitar viajes en vehículos exclusivos
- Solo conductoras pueden manejar vehículos exclusivos
- Sistema rechaza automáticamente solicitudes no válidas

### Auditoría y Trazabilidad:
- Todos los cambios importantes quedan registrados en activityLogs
- Registro de intentos de acceso no autorizado
- Validaciones de negocio
- Validación de roles para cada operación

---

## 👩‍💻 EQUIPO

| Nombre | Rol | Sitio web |
|--------|-------|--------|
| Andrea Mejía | Scrum Master / Backend dev  | [Portafolio de proyectos](https://portafolio-andrea-mejia.vercel.app/) |
| Marcela Ramírez | Product Owner / Backend dev | [Linkedin](https://www.linkedin.com/in/cmramirez29/)  |
| Valeria González | Backend dev | [Linkedin](https://www.linkedin.com/in/valeriavcgr/)  |
| Heidy Romero | Backend dev | [Linkedin](https://www.linkedin.com/in/daniiromero/)  |
---

## 📄 Licencia

💜 **KARU APP** — Movilidad segura en Bogotá.  
© 2025 — Todos los derechos reservados.

---

📄 **Fin de la documentación**
