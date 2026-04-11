# Especificación de Requisitos de Calidad Medibles: ReservFlow

Este documento detalla las Historias de Usuario (User Stories) integrando Criterios de Aceptación técnicos y métricas de calidad medibles (NFR), asegurando que cada funcionalidad cumpla con los estándares definidos en el plan de calidad.

## 1. Definición de la Actividad
El objetivo es transformar los requerimientos funcionales en unidades de trabajo verificables donde el éxito no solo depende de la acción del usuario, sino del cumplimiento de umbrales de rendimiento, fiabilidad y seguridad establecidos.

## 2. User Stories con Criterios de Calidad Medibles

### US-01: Búsqueda de disponibilidad eficiente
**Como** cliente, **quiero** buscar habitaciones por fechas y capacidad, **para** encontrar opciones que se ajusten a mi viaje de forma rápida.

* **Criterios de Aceptación de Calidad:**
    1. El sistema debe devolver resultados de búsqueda en un tiempo menor a 2 segundos (P95).
    2. La consulta de disponibilidad en tiempo real debe ejecutarse contra Amazon ElastiCache con una latencia inferior a 100ms.
    3. El componente de búsqueda debe estar cubierto por pruebas unitarias en un 80% o superior.

### US-03: Confirmación de reserva segura (Zero-Overbooking)
**Como** cliente, **quiero** recibir una confirmación visual instantánea de mi reserva, **para** tener la certeza de que mi habitación está asegurada.

* **Criterios de Aceptación de Calidad:**
    1. El sistema debe garantizar un 0% de errores de sobreventa mediante el uso de transacciones atómicas en Redis.
    2. La reserva debe persistirse en Amazon Aurora con un nivel de disponibilidad del 99.9%.
    3. En caso de fallo de red, el sistema debe implementar una política de reintentos que no duplique la reserva (idempotencia).

### US-04: Visualización de ocupación para administradores
**Como** administrador de hotel, **quiero** ver un dashboard con todas las reservas actuales, **para** gestionar la logística interna.

* **Criterios de Aceptación de Calidad:**
    1. El dashboard debe cargar los datos históricos y activos en menos de 2 segundos.
    2. El acceso a los datos debe estar restringido mediante roles de usuario, validado por un análisis de seguridad de Checkmarx sin vulnerabilidades críticas.
    3. La integridad de la información mostrada debe coincidir al 100% con los registros en Amazon Aurora.

### US-07: Integración con servicios externos (Mocks)
**Como** desarrollador, **necesito** simular las APIs de Airbnb y Booking.com, **para** validar la lógica de sincronización sin depender de terceros.

* **Criterios de Aceptación de Calidad:**
    1. El mock service debe replicar el 100% de los códigos de respuesta (200, 400, 500) de las APIs originales.
    2. El flujo de integración debe ser validado automáticamente por GitHub Actions antes de cualquier despliegue a QA.
    3. Los logs de integración no deben almacenar datos sensibles por más de 72 horas.

## 3. Matriz de Validación Técnica
Cada una de estas historias se considera terminada únicamente cuando el reporte de SonarQube y la suite de pruebas unitarias confirman el cumplimiento de los umbrales mencionados anteriormente.