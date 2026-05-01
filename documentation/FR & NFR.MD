# Requerimientos del Proyecto: ReservFlow 

## 1. Requerimientos Funcionales (FR)
*Lo que el sistema debe hacer (lógica de negocio y características).*

### **Gestión de Reservas (Reservation Manager)**
* **FR-01: Creación de Reservas:** El sistema debe permitir a los usuarios finales crear una reserva seleccionando fechas, tipo de habitación y datos personales.
* **FR-02: Gestión de Estados:** El sistema debe manejar el ciclo de vida de la reserva (Pendiente, Confirmada, Cancelada, Completada).
* **FR-03: Validación de Disponibilidad:** El sistema debe verificar en tiempo real si hay habitaciones disponibles antes de permitir el flujo de pago/confirmación.
* **FR-04: Dashboard Administrativo:** Los administradores de hoteles deben poder visualizar, buscar y filtrar todas las reservas activas e históricas.

### **Control de Inventario (Inventory Controller)**
* **FR-05: Sincronización de Inventario:** El sistema debe actualizar automáticamente el stock en Amazon Aurora y Amazon ElastiCache tras cada reserva confirmada.
* **FR-06: Búsqueda de Habitaciones:** El sistema debe permitir filtrar habitaciones por disponibilidad, precio y capacidad en el buscador de la UI.
* **FR-07: Consumo de Mocks Externos:** El sistema debe ser capaz de recibir y procesar datos simulados de disponibilidad provenientes de integraciones con Airbnb y Booking.com.

---

## 2. Requerimientos No Funcionales (NFR)
*Cómo debe comportarse el sistema (calidad, rendimiento y seguridad).*

### **Rendimiento y Concurrencia**
* **NFR-01: Latencia de Consulta:** La validación de disponibilidad mediante ElastiCache (Redis) debe responder en menos de 100ms para garantizar una experiencia fluida.
* **NFR-02: Manejo de Alta Concurrencia:** El sistema debe implementar bloqueos optimistas o transacciones atómicas en Redis para evitar el overbooking (sobreventa) cuando múltiples usuarios intentan reservar la misma habitación simultáneamente.

### **Calidad y Mantenibilidad**
* **NFR-03: Cobertura de Código:** Se debe mantener un Code Coverage mínimo del 80% en toda la lógica del Reservation Manager e Inventory Controller utilizando Vitest/Jest.
* **NFR-04: Tipado Estricto:** El proyecto debe configurarse con `strict: true` en TypeScript para prevenir errores de nulidad o tipos de datos en tiempo de ejecución.
* **NFR-05: Documentación de API:** Todos los endpoints deben estar expuestos y documentados bajo el estándar OpenAPI (Swagger) para facilitar el consumo de la API.

### **Infraestructura y Disponibilidad**
* **NFR-06: Alta Disponibilidad:** El sistema debe utilizar réplicas de lectura en Amazon Aurora para asegurar que el servicio no se interrumpa en caso de fallos en el nodo principal.
* **NFR-07: Aislamiento de Entornos:** La configuración de infraestructura (AWS) debe estar separada por variables de entorno para evitar inconsistencias entre el desarrollo local y QA/Producción.

# Especificación de Requerimientos: ReservFlow

Este documento detalla los requerimientos técnicos que rigen el desarrollo del sistema **ApexReservations**, asegurando el cumplimiento de los estándares de calidad y rendimiento definidos para el MVP.

---

## 1. Requerimientos Funcionales (FR)
*Definen las funciones específicas que el sistema debe ser capaz de realizar.*

### **Gestión de Reservaciones (Reservation Manager)**
* **FR-01: Operaciones CRUD de Reservas:** El sistema debe permitir la creación, consulta, actualización y cancelación de reservaciones de manera integral.
* **FR-02: Buscador de Disponibilidad:** Implementación de una interfaz de búsqueda que permita a los usuarios finales filtrar habitaciones por fechas y criterios específicos.
* **FR-03: Funnel de Reserva:** El sistema debe guiar al usuario a través de un proceso de reserva (checkout) claro y funcional.

### **Control de Inventario y Sincronización**
* **FR-04: Sincronización Aurora-ElastiCache:** El sistema debe garantizar que el inventario se mantenga sincronizado en tiempo real entre la base de datos persistente (Amazon Aurora) y la caché (Amazon ElastiCache).
* **FR-05: Dashboard Administrativo:** Interfaz dedicada para que los administradores del hotel gestionen el estado de las habitaciones y visualicen métricas de ocupación.
* **FR-06: Simulación de APIs Externas:** Uso de "Mock Services" para replicar el comportamiento de plataformas como Airbnb y Booking.com durante las pruebas de integración.

---

## 2. Requerimientos No Funcionales (NFR)
*Definen las características de calidad, restricciones y atributos del sistema.*

### **Rendimiento y Concurrencia**
* **NFR-01: Validación de Alta Velocidad:** La validación de disponibilidad debe realizarse en milisegundos utilizando Amazon ElastiCache for Redis.
* **NFR-02: Integridad en Alta Concurrencia:** El sistema debe ser capaz de manejar múltiples solicitudes simultáneas sin permitir errores de lógica de negocio como el **overbooking**.

### **Estándares de Calidad y Desarrollo**
* **NFR-03: Cobertura de Código:** Se debe alcanzar y mantener un mínimo del **80% de code coverage** mediante pruebas automatizadas con Vitest o Jest.
* **NFR-04: Robustez del Código:** Es obligatorio el uso de **TypeScript en modo estricto** para minimizar errores de tipado y fallos en tiempo de ejecución.
* **NFR-05: Documentación Técnica:** El 100% de los endpoints de la API deben estar documentados bajo el estándar **OpenAPI/Swagger**.

### **Infraestructura y Gobernanza**
* **NFR-06: Arquitectura AWS:** El sistema debe ejecutarse obligatoriamente sobre servicios administrados de AWS, específicamente Amazon Aurora y Amazon ElastiCache.
* **NFR-07: Flujo de Despliegue (QA Gate):** Ninguna funcionalidad se desplegará a producción sin la aprobación manual previa en el gate de control de calidad.
* **NFR-08: Tolerancia a Fallos:** La arquitectura debe ser robusta y redundante para garantizar la consistencia de los datos ante posibles fallos de red o infraestructura.


# Backlog de Requerimientos: ReservFlow (ApexReservations)

Este documento detalla los requerimientos técnicos y de negocio para el MVP del sistema de reservaciones de alta concurrencia.

---

## 1. Historias de Usuario (Backlog de Producto)
*Formato: Como [rol], quiero [acción], para [beneficio].*

### Usuario Final (Cliente)
* **US-01: Búsqueda de disponibilidad:** Como cliente, quiero buscar habitaciones por fechas y capacidad, para encontrar opciones que se ajusten a mi viaje.
* **US-02: Proceso de reserva:** Como cliente, quiero completar un formulario con mis datos y confirmar mi selección, para asegurar mi estancia en el hotel.
* **US-03: Confirmación inmediata:** Como cliente, quiero recibir una confirmación visual instantánea de mi reserva, para tener la certeza de que el proceso fue exitoso.

### Usuario Administrativo
* **US-04: Visualización de ocupación:** Como administrador, quiero ver un dashboard con todas las reservas actuales, para gestionar la limpieza y el check-in de los huéspedes.
* **US-05: Gestión de inventario:** Como administrador, quiero poder bloquear fechas manualmente, para realizar mantenimiento en las habitaciones.

### Sistema / Desarrollador (Technical Stories)
* **US-06: Prevención de Overbooking:** Como sistema, debo ejecutar una validación atómica en Redis antes de confirmar la transacción en Aurora, para evitar la sobreventa en condiciones de alta concurrencia.
* **US-07: Integración de Mocks:** Como desarrollador, necesito simular las APIs de Airbnb/Booking.com, para validar la lógica de sincronización sin depender de servicios externos de pago.

---

## 2. Requerimientos Funcionales (FR)
*Definen las capacidades específicas del sistema.*

* **FR-01: Ciclo de Vida CRUD:** El sistema debe permitir crear, leer, actualizar y cancelar reservas a través del Reservation Manager.
* **FR-02: Sincronización Real-time:** El Inventory Controller debe sincronizar el stock entre Amazon Aurora y Amazon ElastiCache inmediatamente después de cada transacción.
* **FR-03: Interfaz de Usuario (UI):** Desarrollo de buscador de habitaciones, funnel de reserva (checkout) y panel de administración.
* **FR-04: Documentación de API:** Todos los endpoints deben estar expuestos en una interfaz de Swagger/OpenAPI.

---

## 3. Requerimientos No Funcionales (NFR)
*Definen los atributos de calidad y restricciones técnicas.*

### Rendimiento y Escalabilidad
* **NFR-01: Latencia:** Las consultas de disponibilidad en el buscador deben resolverse en milisegundos mediante el uso de caché en memoria con ElastiCache.
* **NFR-02: Consistencia:** El sistema debe garantizar consistencia de datos y evitar el overbooking bajo carga masiva de usuarios.

### Calidad del Software
* **NFR-03: Code Coverage:** Se requiere un mínimo del 80% de cobertura de código verificado con Vitest o Jest.
* **NFR-04: Robustez:** Uso mandatorio de TypeScript en modo estricto para reducir errores en tiempo de ejecución.
* **NFR-05: Gate de QA:** Ninguna funcionalidad se considera terminada sin pasar las pruebas automatizadas y la aprobación manual en el gate de QA.

### Infraestructura
* **NFR-06: Base de Datos:** Uso de Amazon Aurora (PostgreSQL compatible) para garantizar alta disponibilidad y persistencia.
* **NFR-07: Seguridad de Actividad:** El sistema debe manejar periodos de retención de 72 horas para logs de actividad relacionados con la mejora y seguridad del servicio.