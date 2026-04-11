# Project Charter: ReservFlow (MVP Calidad de Software)

## 1. Project Info (Información General)
* **Nombre del Proyecto:** ApexReservations — High-Concurrency System.
* **Owner:** [Tu Nombre].
* **Materia:** Calidad de Software.
* **Fecha de Entrega:** 14 de Mayo, 2026.

---

## 2. Purpose (Propósito)
* Garantizar la consistencia de datos en reservaciones de alta concurrencia para evitar sobreventas.
* Establecer un estándar de desarrollo con TypeScript estricto para minimizar errores en tiempo de ejecución.
* Lograr una arquitectura robusta y tolerante a fallos mediante el uso eficiente de caché y redundancia.

---

## 3. Scope (Alcance del MVP)
* **Reservation Manager:** Lógica central para el ciclo de vida de reservaciones (CRUD).
* **Inventory Controller:** Sincronización en tiempo real entre Amazon Aurora y Amazon ElastiCache.
* **UI Components:** Desarrollo de buscador, funnel de reserva y dashboard administrativo.
* **Mock Services:** Simulación de APIs externas (Airbnb/Booking.com) para validación de integración.

---

## 4. Success Criteria (Criterios de Éxito)
* **Code Coverage:** Alcanzar y mantener un mínimo del 80% de cobertura de código con Vitest/Jest.
* **Performance:** Validación de disponibilidad de habitaciones en milisegundos mediante ElastiCache.
* **Zero Critical Bugs:** Ningún error de lógica de negocio (como el overbooking) detectado en el ambiente de QA.
* **Documentación:** 100% de los endpoints del sistema documentados bajo el estándar OpenAPI/Swagger.

---

## 5. Team / Stakeholders / Users
* **Team:** Lead Developer & QA Engineer (Estudiante).
* **Stakeholders:** Profesor de la materia de Calidad de Software (Product Owner).
* **Users:** Administradores de hoteles (más de 5,000 proyectados) y clientes finales.

---

## 6. Resources (Recursos)
* **Stack Principal:** Next.js (React) con TypeScript en modo estricto.
* **Base de Datos:** Amazon Aurora (PostgreSQL compatible) para alta disponibilidad.
* **Caché:** Amazon ElastiCache for Redis para gestión de inventario en tiempo real.
* **Gestión y Calidad:** GitHub Projects para Kanban y Vitest/Jest para pruebas automatizadas.

---

## 7. Constraints (Restricciones)
* **Tecnológicas:** Uso mandatorio de servicios administrados de AWS (Aurora y ElastiCache).
* **Calidad:** Mínimo de 80% de code coverage requerido para considerar cualquier funcionalidad como terminada.
* **Gobernanza:** Ningún despliegue a producción sin la aprobación manual previa en el gate de QA.
* **Tiempo:** Entrega final del sistema funcional e informe de calidad para la segunda semana de mayo.

---

## 8. Risks (Riesgos)
* **Race Conditions:** Riesgo de sobreventa si la lógica de sincronización Aurora-Redis no es atómica bajo alta carga.
* **Integraciones:** Fallos potenciales en producción si los "Mocks" no replican fielmente el comportamiento de APIs externas.
* **Desempeño:** Degradación de la latencia si la lógica del Inventory Controller no está optimizada para concurrencia masiva.
* **Inconsistencia de Entornos:** Riesgo de fallos por diferencias de configuración entre el ambiente local y la infraestructura de AWS.

---

## 9. Results (Resultados Esperados)
* Sistema de reservaciones funcional con lógica de alta concurrencia técnicamente validada.
* Suite completa de pruebas automatizadas con reportes de cobertura superiores al 80%.
* Documentación técnica detallada y manual de estándares de código aplicados al proyecto.