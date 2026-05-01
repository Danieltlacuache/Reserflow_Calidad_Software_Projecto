# Software Quality Plan (SQP) - ReservFlow
# Estándar IEEE 730

## 1. Propósito
Este documento establece el plan de aseguramiento de calidad para el proyecto ApexReservations (ReservFlow), con el fin de garantizar la consistencia de datos en sistemas de alta concurrencia y evitar errores críticos como el overbooking.

## 2. Documentos de Referencia
* Project Charter de ReservFlow.
* Especificación de Requerimientos Funcionales y No Funcionales.
* Quality Criteria (ISO 25010).

## 3. Gestión
### 3.1 Organización
* Software Quality Manager (QA Lead): Responsable de la definición y validación de métricas.
* Project Manager (PM): Responsable de la gestión de riesgos y cumplimiento de cronogramas.

### 3.2 Tareas de SQA
* Revisión de requerimientos y diseño de arquitectura.
* Ejecución de pruebas unitarias y de integración.
* Auditoría de cobertura de código.

## 4. Documentación
Se supervisará la existencia y calidad de los siguientes entregables:
* Manual de estándares de código (TypeScript Estricto).
* Documentación de endpoints bajo el estándar OpenAPI/Swagger.
* Reportes de cobertura de código (Vitest/Jest).

## 5. Estándares, Prácticas, Convenciones y Métricas
### 5.1 Métricas de Calidad
Se seguirán las metas medibles definidas bajo ISO 25010:
* Disponibilidad mayor o igual al 99.9%.
* Tiempo de respuesta UI menor a 2 segundos (P95).
* Cobertura de pruebas unitarias mayor o igual al 80%.
* Densidad de defectos en producción menor o igual a 0.5 por KLOC.

## 6. Revisiones de Software y Auditorías
* Gate de QA: Ninguna funcionalidad se considera terminada sin la aprobación manual previa en este punto de control.
* Auditoría de Concurrencia: Revisión técnica de la lógica de sincronización entre Amazon Aurora y ElastiCache para prevenir Race Conditions.

## 7. Pruebas (Testing)
Las actividades de prueba se centrarán en:
* Pruebas Unitarias: Validación de la lógica individual del Reservation Manager.
* Pruebas de Carga: Validación de la latencia en milisegundos mediante ElastiCache.
* Simulación de Integración: Uso de Mocks para APIs externas (Airbnb/Booking.com).

## 8. Reporte de Problemas y Acciones Correctivas
* Registro de bugs mediante GitHub Issues.
* Priorización basada en el impacto (Crítico para overbooking, Mayor para latencia, Menor para UI).

## 9. Herramientas, Técnicas y Metodologías
* Herramientas de Prueba: Vitest / Jest.
* Gestión: GitHub Projects (Kanban).
* Stack Tecnológico: Next.js, TypeScript Strict Mode, Amazon Aurora y ElastiCache.

## 10. Gestión de Riesgos
Se dará seguimiento a los riesgos identificados en el Project Charter, incluyendo Race Conditions e inconsistencias de entornos.