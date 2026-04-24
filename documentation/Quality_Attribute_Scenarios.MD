# Escenarios de Atributos de Calidad — ReservFlow (ApexReservations)

**Autores:** Emilio Daniel Guzmán Seda y León Carlo Rivera Cárdenas  
**Stakeholder:** Mtra. Sarahí Ochoa Partida  
**Fecha de elaboración:** Junio 2025

---

## Introducción

Este documento presenta los escenarios de atributos de calidad del sistema ReservFlow, diseñados para verificar que la arquitectura del sistema satisface los requisitos no funcionales definidos en los Puntos 1 y 2 del proyecto.

Cada escenario sigue la **estructura de seis partes** propuesta por Bass, Clements y Kazman en *Software Architecture in Practice*, que es el estándar de la industria para la especificación de atributos de calidad arquitectónicos:

1. **Fuente del Estímulo** — La entidad (persona, sistema o condición) que genera el estímulo.
2. **Estímulo** — La condición o evento que llega al sistema y requiere una respuesta.
3. **Artefacto** — El componente o módulo del sistema que es estimulado.
4. **Entorno** — Las condiciones bajo las cuales ocurre el estímulo (operación normal, carga alta, fallo, etc.).
5. **Respuesta** — El comportamiento esperado del sistema ante el estímulo.
6. **Medida de Respuesta** — La métrica cuantificable que determina si la respuesta es satisfactoria.

Cada escenario incluye información de trazabilidad que lo vincula con los requerimientos no funcionales (NFR), los Quality Criteria (ISO 25010) y la Matriz de Priorización del Quality Model existentes.

---

## Escenario QA-01: Eficiencia de Desempeño — Latencia de Consulta de Disponibilidad

| Parte | Descripción |
|-------|-------------|
| **Fuente del Estímulo** | Cliente final utilizando el buscador de habitaciones |
| **Estímulo** | Consulta de disponibilidad de habitaciones por fechas y capacidad |
| **Artefacto** | Inventory Controller + Amazon ElastiCache (Redis) |
| **Entorno** | Operación normal con alta concurrencia (múltiples usuarios simultáneos) |
| **Respuesta** | El sistema retorna la lista de habitaciones disponibles consultando directamente la caché Redis |
| **Medida de Respuesta** | Tiempo de respuesta de la consulta de disponibilidad < 100ms (NFR-01) |

**Trazabilidad:**

| Campo | Referencia |
|-------|------------|
| **NFR vinculado** | NFR-01 — Latencia de Consulta |
| **Quality Criteria** | Eficiencia de Desempeño — Validación de disponibilidad en milisegundos mediante Amazon ElastiCache |
| **Atributo ISO 25010** | Eficiencia de Desempeño → Comportamiento Temporal |
| **Prioridad (Quality Model)** | Alta |

---

## Escenario QA-02: Fiabilidad — Zero-Overbooking bajo Concurrencia

| Parte | Descripción |
|-------|-------------|
| **Fuente del Estímulo** | Múltiples clientes finales (N usuarios concurrentes) |
| **Estímulo** | N reservaciones simultáneas sobre la misma habitación en las mismas fechas |
| **Artefacto** | Inventory Controller + transacciones atómicas Redis (WATCH/MULTI/EXEC) |
| **Entorno** | Carga concurrente — múltiples solicitudes de reservación llegando en el mismo instante |
| **Respuesta** | Exactamente una reservación es confirmada exitosamente; las demás reciben un mensaje de no disponibilidad sin corrupción de datos |
| **Medida de Respuesta** | 0% de errores de sobreventa (zero-overbooking); 0 registros duplicados en Aurora (NFR-02) |

**Trazabilidad:**

| Campo | Referencia |
|-------|------------|
| **NFR vinculado** | NFR-02 — Manejo de Alta Concurrencia |
| **Quality Criteria** | Fiabilidad — El sistema no debe presentar errores de lógica de negocio críticos como el overbooking |
| **Atributo ISO 25010** | Fiabilidad → Integridad de Datos |
| **Prioridad (Quality Model)** | Alta |

---

## Escenario QA-03: Disponibilidad — Failover de Aurora

| Parte | Descripción |
|-------|-------------|
| **Fuente del Estímulo** | Fallo de infraestructura AWS |
| **Estímulo** | Caída del nodo primario de Amazon Aurora |
| **Artefacto** | Amazon Aurora (PostgreSQL) con réplicas de lectura |
| **Entorno** | Operación en producción con usuarios activos |
| **Respuesta** | Aurora ejecuta failover automático a una réplica de lectura que se promueve a nodo primario; el sistema continúa operando sin intervención manual |
| **Medida de Respuesta** | Disponibilidad del sistema >= 99.9%; tiempo de failover < 30 segundos (NFR-06) |

**Trazabilidad:**

| Campo | Referencia |
|-------|------------|
| **NFR vinculado** | NFR-06 — Alta Disponibilidad |
| **Quality Criteria** | Disponibilidad >= 99.9% |
| **Atributo ISO 25010** | Fiabilidad → Disponibilidad |
| **Prioridad (Quality Model)** | Media |


---

## Escenario QA-04: Mantenibilidad — Modificación de Módulo de Autenticación

| Parte | Descripción |
|-------|-------------|
| **Fuente del Estímulo** | Equipo de desarrollo (Emilio Guzmán, León Rivera) |
| **Estímulo** | Solicitud de cambio del motor de autenticación del sistema |
| **Artefacto** | Aplicación Web Next.js — módulos de API Routes y componentes de UI |
| **Entorno** | Fase de mantenimiento post-MVP |
| **Respuesta** | El cambio se implementa modificando únicamente los módulos de autenticación sin afectar Reservation Manager, Inventory Controller ni la lógica de sincronización |
| **Medida de Respuesta** | Implementación completada en menos de 2 semanas con menos de 5 módulos afectados; cobertura de pruebas se mantiene >= 80% (NFR-03, NFR-04) |

**Trazabilidad:**

| Campo | Referencia |
|-------|------------|
| **NFR vinculados** | NFR-03 — Cobertura de Código, NFR-04 — Tipado Estricto |
| **Quality Criteria** | Mantenibilidad — Uso obligatorio de TypeScript en modo estricto; Cobertura de Pruebas Unitarias >= 80% |
| **Atributo ISO 25010** | Mantenibilidad → Modularidad, Analizabilidad |
| **Prioridad (Quality Model)** | Alta (Cobertura de Código), Media (Tipado Estricto) |

---

## Escenario QA-05: Eficiencia de Desempeño en UI — Carga del Dashboard

| Parte | Descripción |
|-------|-------------|
| **Fuente del Estímulo** | Administrador de hotel |
| **Estímulo** | Carga de la página del dashboard administrativo con datos históricos y activos |
| **Artefacto** | Componentes de UI (Dashboard) + API Routes + Amazon Aurora (réplica de lectura) |
| **Entorno** | Operación normal con volumen estándar de datos |
| **Respuesta** | El dashboard renderiza completamente con todos los datos de reservaciones activas e históricas, métricas de ocupación y filtros funcionales |
| **Medida de Respuesta** | Renderizado completo en menos de 2 segundos P95 (Quality Criteria — Tiempo de Respuesta UI) |

**Trazabilidad:**

| Campo | Referencia |
|-------|------------|
| **NFR vinculado** | Quality Criteria — Tiempo de Respuesta UI |
| **Quality Criteria** | Tiempo de Respuesta UI < 2 segundos (P95) |
| **Atributo ISO 25010** | Eficiencia de Desempeño → Comportamiento Temporal |
| **Prioridad (Quality Model)** | Media |

---

## Tabla Resumen de Trazabilidad: Escenarios → Quality Criteria (ISO 25010)

La siguiente tabla consolida la trazabilidad de cada escenario de atributo de calidad con los criterios medibles definidos en el documento Quality Criteria (ISO 25010) y la Matriz de Priorización del Quality Model.

| Escenario | Atributo de Calidad | Criterio de Calidad (Quality Criteria) | Meta Medible | Prioridad (Quality Model) |
|-----------|----------------------|----------------------------------------|--------------|---------------------------|
| QA-01 — Latencia de Consulta de Disponibilidad | Eficiencia de Desempeño → Comportamiento Temporal | Eficiencia de Desempeño — Validación de disponibilidad mediante ElastiCache | < 100ms | Alta |
| QA-02 — Zero-Overbooking bajo Concurrencia | Fiabilidad → Integridad de Datos | Fiabilidad — Zero errores de lógica de negocio críticos (overbooking) | 0% sobreventa | Alta |
| QA-03 — Failover de Aurora | Fiabilidad → Disponibilidad | Disponibilidad >= 99.9% | >= 99.9%; failover < 30s | Media |
| QA-04 — Modificación de Módulo de Autenticación | Mantenibilidad → Modularidad, Analizabilidad | Cobertura de Pruebas Unitarias >= 80%; TypeScript estricto | < 2 semanas, < 5 módulos | Alta / Media |
| QA-05 — Carga del Dashboard | Eficiencia de Desempeño → Comportamiento Temporal | Tiempo de Respuesta UI < 2s P95 | < 2 segundos P95 | Media |