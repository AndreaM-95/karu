🚗 KARU APP - Plataforma de Transporte Seguro
📋 Descripción del Proyecto
Karu App es una plataforma de transporte tipo ride-sharing que conecta pasajeros con conductores, con un enfoque especial en seguridad y opciones de transporte exclusivo para mujeres. El sistema permite gestionar viajes, vehículos, pagos y calificaciones de manera integral.

🎯 Objetivos del Proyecto
Objetivo General
Crear una aplicación backend robusta para gestionar servicios de transporte privado, facilitando la conexión entre pasajeros y conductores, con énfasis en la seguridad y trazabilidad de las operaciones.
Objetivos Específicos
Gestionar usuarios con múltiples roles (pasajero, conductor, propietario, administrador)
Implementar un sistema de viajes con seguimiento en tiempo real
Manejar pagos y distribución automática de ganancias
Proveer opciones de transporte exclusivo para mujeres
Mantener auditoría completa mediante sistema de logs
Facilitar calificaciones y retroalimentación entre usuarios

👥 Tipos de Usuarios
1. Pasajero (Passenger)
Solicita viajes
Califica conductores
Realiza pagos
Visualiza historial de viajes
2. Conductor (Driver)
Acepta y realiza viajes
Recibe el 70% del valor del viaje
Puede usar vehículos propios o de terceros
Debe tener licencia de conducción vigente
3. Propietario (Owner)
Registra vehículos en la plataforma
Recibe el 30% del valor de los viajes realizados con su vehículo
Asigna conductores a sus vehículos
Gestiona el estado de sus vehículos
4. Administrador (Admin)
Gestiona todos los usuarios
Supervisa operaciones del sistema
Procesa liquidaciones
Accede a reportes y estadísticas

🔄 Flujo Principal de la Aplicación
Fase 1: Registro y Configuración
Usuario nuevo
├─ Se registra con datos personales (nombre, email, cédula, teléfono, género)
├─ Recibe rol inicial de "pasajero"
└─ Si desea ser conductor u owner, completa información adicional

Fase 2: Configuración de Conductor/Propietario
Conductor:
├─ Sube licencia de conducción
├─ Se asocia a un vehículo
└─ Queda disponible para aceptar viajes

Propietario:
├─ Registra vehículo (placa, marca, modelo, etc.)
├─ Marca si es exclusivo para mujeres (opcional)
├─ Asigna conductores
└─ Recibe ganancias del 30%

Fase 3: Solicitud de Viaje
Pasajero:
├─ Ingresa coordenadas de origen (latitud, longitud)
├─ Ingresa coordenadas de destino (latitud, longitud)
├─ Sistema calcula distancia usando fórmula de Haversine
├─ Sistema calcula costo según pricingRules
├─ Viaje queda en estado "pending"
└─ Notifica a conductores disponibles

Fase 4: Ejecución del Viaje
Conductor:
├─ Ve viajes pendientes
├─ Acepta viaje → estado "accepted"
├─ Inicia viaje → estado "in_progress"
├─ Completa viaje → estado "completed"
└─ Confirma pago

Fase 5: Pago y Distribución
Sistema:
├─ Registra pago del pasajero
├─ Calcula distribución automática:
│   ├─ 70% para conductor
│   └─ 30% para propietario (si aplica)
├─ Genera registro en distributionPayment
└─ Acumula para liquidaciones periódicas

Fase 6: Calificación
Pasajero:
├─ Califica al conductor (1-5 estrellas)
├─ Deja comentarios opcionales
└─ Calificación afecta reputación del conductor


🏗️ Arquitectura del Sistema
Módulos del Backend
1. MD_AUTH (Autenticación)
Registro de usuarios
Login/Logout
Recuperación de contraseña
Gestión de sesiones
2. MD_USERS (Usuarios)
CRUD de usuarios
Gestión de roles múltiples
Actualización de perfil
Documentos de conductor
3. MD_VEHICLES (Vehículos)
CRUD de vehículos
Asignación de conductores
Cambio de estados (activo/mantenimiento/inactivo)
Validación de transporte exclusivo para mujeres
4. MD_TRIPS (Viajes)
Solicitud de viajes
Aceptación/rechazo por conductores
Cambios de estado del viaje
Cálculo de distancia y costos
Historial de viajes
Cancelaciones con razón
5. MD_PAYMENTS (Pagos)
Registro de pagos
Cálculo automático de distribución
Generación de liquidaciones periódicas
Consulta de ganancias acumuladas
Métodos: efectivo, tarjeta, transferencia
6. MD_RATINGS (Calificaciones)
Calificación de conductores
Comentarios de pasajeros
Cálculo de promedio de calificaciones
Historial de calificaciones
7. MD_LOCATION (Ubicación) (Opcional - Solo registro histórico)
Registro de puntos de ubicación si se necesita auditoría
NO incluye tracking en tiempo real
Solo para historial si se requiere después

💾 Base de Datos
Tablas Principales
Tabla
Descripción
Campos Clave
users
Usuarios del sistema
idUser, name, gender, email, nationalId, phone
userRoles
Roles asignados a usuarios
userId, role (admin/owner/driver/passenger)
vehicle
Vehículos registrados
idVehicle, ownerId, plate, exclusiveForWomen
driverDocuments
Documentos de conductores
userId, driverLicense, expiryDate
driverVehicle
Relación conductor-vehículo
vehicleId, userId, relationType
roadTrip
Viajes realizados
idTrip, passengerId, driverId, vehicleId, statusTrip
payment
Pagos de viajes
idPayment, tripId, amount, paymentMethod
distributionPayment
Distribución de ganancias
driverId, ownerId, driverAmount, ownerAmount
settlement
Liquidaciones periódicas
userId, periodStart, periodEnd, totalEarned
rating
Calificaciones
tripId, passengerId, driverId, score
location
Ubicaciones
vehicleId, tripId, latitude, longitude
pricingRules
Reglas de precios
vehicleType, baseFare, perKmRate
activityLogs
Auditoría del sistema
userId, action, entity, description

Características de la Base de Datos
✅ Normalizada - Evita redundancia de datos
 ✅ Con índices - Optimizada para búsquedas rápidas
 ✅ Integridad referencial - Foreign keys con restricciones
 ✅ Auditable - Sistema completo de logs
 ✅ Escalable - Preparada para crecimiento
 ✅ Flexible - Roles y configuraciones dinámicas

🔐 Características de Seguridad
Transporte Exclusivo para Mujeres
Campo gender obligatorio en registro de usuarios
Campo exclusiveForWomen en vehículos
Validaciones en backend:
Solo mujeres pueden solicitar viajes en vehículos exclusivos
Solo conductoras pueden manejar vehículos exclusivos
Sistema rechaza automáticamente solicitudes no válidas
Auditoría y Trazabilidad
Todos los cambios importantes quedan registrados en activityLogs
Registro de intentos de acceso no autorizado
Tracking de cancelaciones con razón
Historial completo de cambios en datos sensibles
Validaciones de Negocio
Conductores deben tener licencia vigente
Vehículos deben estar activos para aceptar viajes
Solo el propietario puede modificar su vehículo
Validación de roles para cada operación

💰 Sistema de Pagos y Distribución
Cálculo de Distancia (Fórmula de Haversine)
El sistema calcula la distancia entre dos puntos geográficos usando la Fórmula de Haversine, que considera la curvatura de la Tierra:
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distancia = R * c; // Distancia en kilómetros
  
  return distancia;
}

Ejemplo:
Origen: 4.6097° N, -74.0817° W (Bogotá Centro)
Destino: 4.7110° N, -74.0721° W (Bogotá Norte)
Distancia: ~11.5 km
Cálculo de Costos
Costo Total = Tarifa Base + (Distancia en KM × Tarifa por KM)

Ejemplo para Carro:
- Tarifa Base: $3,000
- Tarifa por KM: $800
- Distancia: 11.5 KM
- Costo Total: $3,000 + (11.5 × $800) = $12,200

Distribución de Ganancias
Escenario 1: Conductor con vehículo propio
Conductor recibe: 100% del valor del viaje
Escenario 2: Conductor con vehículo de tercero
Conductor recibe: 70% del valor del viaje
Propietario recibe: 30% del valor del viaje
Liquidaciones
Se generan periódicamente (configurable)
Agrupan todas las ganancias del período
Registran fecha de pago
Permiten trazabilidad de pagos realizados

📊 Estados del Sistema
Estados de Viaje (roadTrip.statusTrip)
pending - Viaje solicitado, esperando conductor
accepted - Conductor aceptó el viaje
in_progress - Viaje en curso
completed - Viaje finalizado exitosamente
canceled - Viaje cancelado por pasajero o conductor
Estados de Vehículo (vehicle.statusVehicle)
active - Disponible para viajes
maintenance - En mantenimiento, no disponible
inactive - Desactivado temporalmente
Estados de Pago (payment.paymentStatus)
pending - Pago pendiente de procesar
completed - Pago exitoso
failed - Pago fallido

🎯 Casos de Uso Principales
CU-01: Solicitar Viaje
Actor: Pasajero
 Flujo:
Pasajero ingresa coordenadas origen (lat, lng) y destino (lat, lng)
Opcionalmente ingresa localidad y barrio (solo texto descriptivo)
Sistema calcula distancia con fórmula de Haversine
Sistema consulta pricingRules según tipo de vehículo
Sistema calcula: costo = baseFare + (distanceKm × perKmRate)
Sistema filtra vehículos disponibles (respetando exclusividad)
Pasajero confirma solicitud
Sistema crea viaje en estado "pending"
Sistema notifica a conductores disponibles
CU-02: Aceptar Viaje
Actor: Conductor
 Flujo:
Conductor ve lista de viajes pendientes
Conductor selecciona un viaje
Sistema valida que conductor esté disponible
Sistema valida restricción de género si aplica
Viaje pasa a estado "accepted"
Sistema notifica al pasajero
CU-03: Registrar Vehículo Exclusivo
Actor: Propietario
 Flujo:
Propietario ingresa datos del vehículo
Propietario marca opción "Exclusivo para mujeres"
Sistema valida documentos
Sistema crea vehículo con flag exclusiveForWomen = true
Al asignar conductor, sistema valida que sea mujer
CU-04: Generar Liquidación
Actor: Sistema (automático) / Admin
 Flujo:
Sistema agrupa pagos del período
Calcula total por conductor/propietario
Genera registro en tabla settlement
Notifica a usuarios sobre liquidación disponible
Admin marca como pagado cuando transfiere

🔍 Consultas Importantes
Ganancias de un Conductor
SELECT 
  SUM(dp.driverAmount) as total_ganado,
  COUNT(p.idPayment) as viajes_realizados
FROM distributionPayment dp
JOIN payment p ON dp.paymentId = p.idPayment
WHERE dp.driverId = ? 
  AND p.paymentStatus = 'completed'
  AND DATE(p.paymentDate) BETWEEN ? AND ?;

Calificación Promedio de Conductor
SELECT 
  AVG(score) as promedio,
  COUNT(*) as total_calificaciones
FROM rating
WHERE driverId = ?;

Viajes Disponibles para Conductor
SELECT rt.* 
FROM roadTrip rt
JOIN vehicle v ON rt.vehicleId = v.idVehicle
JOIN driverVehicle dv ON v.idVehicle = dv.vehicleId
WHERE rt.statusTrip = 'pending'
  AND dv.userId = ?
  AND dv.isActive = true
  AND v.statusVehicle = 'active';


🚀 Próximos Pasos de Desarrollo
Fase 1: Backend Core
[ ] Implementar módulo de autenticación (JWT)
[ ] CRUD de usuarios y roles
[ ] CRUD de vehículos con validaciones
[ ] Sistema de viajes básico
Fase 2: Lógica de Negocio
[ ] Cálculo automático de distancias con Fórmula de Haversine
[ ] Cálculo de costos según pricingRules
[ ] Distribución automática de pagos
[ ] Sistema de calificaciones
Fase 3: Características Avanzadas
[ ] Notificaciones en tiempo real (WebSockets)
[ ] Generación automática de liquidaciones
[ ] Dashboard de administración
[ ] Sistema de reportes
Fase 4: Optimización
[ ] Implementar caché (Redis)
[ ] Optimizar consultas pesadas
[ ] Métricas y analytics
[ ] Backup automático de BD

📈 Métricas a Monitorear
Operacionales
Total de viajes por día/semana/mes
Tasa de cancelación de viajes
Tiempo promedio de respuesta de conductores
Tiempo promedio de duración de viajes
Financieras
Ingresos totales por período
Ganancias por conductor
Ganancias por propietario
Viajes pendientes de pago
Calidad
Calificación promedio por conductor
Porcentaje de viajes completados exitosamente
Tasa de retención de usuarios
Número de reportes/quejas

🛠️ Stack Tecnológico Recomendado
Backend
Node.js + Express.js
MySQL (base de datos)
JWT (autenticación)
Bcrypt (encriptación de contraseñas)
Servicios Externos
Pasarela de pagos (Stripe, PayU, Wompi)
Servicio de SMS (Twilio, opcional para notificaciones)
Algoritmos
Fórmula de Haversine para cálculo de distancias entre coordenadas
Herramientas
Postman (testing de API)
Git (control de versiones)
Docker (contenedorización)

📞 Contacto y Soporte
Este documento describe la estructura completa del proyecto Karu App. Para más información sobre implementación específica de módulos o funcionalidades, consultar la documentación técnica de cada componente.

Versión: 1.0
 Última actualización: Noviembre 2025
 Estado: Diseño completado - Listo para desarrollo

