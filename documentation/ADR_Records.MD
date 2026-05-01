# Registros de Decisiones Arquitectónicas (ADR) — ReservFlow

**Autores:** Emilio Daniel Guzmán Seda y León Carlo Rivera Cárdenas  
**Stakeholder:** Mtra. Sarahí Ochoa Partida  
**Fecha de elaboración:** Junio 2025

---

## Introducción

Un **Registro de Decisión Arquitectónica** (ADR, por sus siglas en inglés: *Architectural Decision Record*) es un documento breve y estructurado que captura una decisión de diseño significativa tomada durante el desarrollo de un sistema de software, junto con su contexto, las alternativas evaluadas, la justificación de la elección y las consecuencias derivadas.

El propósito de los ADRs en el proyecto **ReservFlow** (ApexReservations) es documentar de manera formal y trazable las decisiones arquitectónicas clave que definen la estructura, los componentes tecnológicos y las estrategias de calidad del sistema de reservaciones de alta concurrencia. Cada ADR está vinculado con los atributos de calidad del estándar **ISO/IEC 25010**, los requerimientos funcionales (FR-01 a FR-07) y no funcionales (NFR-01 a NFR-08) definidos en los Puntos 1 y 2 del proyecto, así como con la Matriz de Priorización del Quality Model existente.

### Estructura estándar de cada ADR

Cada registro sigue la siguiente estructura:

1. **Título** — Nombre descriptivo de la decisión.
2. **Estado** — Estado actual de la decisión (Aceptado, Propuesto, Deprecado, Reemplazado).
3. **Contexto** — Descripción del problema o necesidad que motiva la decisión.
4. **Decisión** — La decisión tomada y su descripción técnica.
5. **Alternativas Consideradas** — Tabla con las opciones evaluadas y la razón de descarte.
6. **Justificación (ISO 25010)** — Justificación basada en los atributos de calidad del estándar ISO/IEC 25010.
7. **Consecuencias** — Impactos positivos y negativos de la decisión.
8. **Requerimientos vinculados** — Referencias a los FR y NFR relacionados.
9. **Atributos de calidad vinculados** — Atributos de calidad impactados y su prioridad.

---

## Tabla de Contenidos

- [ADR-001: Selección de Amazon ElastiCache (Redis) para Prevención de Overbooking](#adr-001-selección-de-amazon-elasticache-redis-para-prevención-de-overbooking)
- [ADR-002: Selección de Amazon Aurora (PostgreSQL) como Base de Datos Persistente](#adr-002-selección-de-amazon-aurora-postgresql-como-base-de-datos-persistente)
- [ADR-003: Selección de Next.js con TypeScript Estricto como Framework de Desarrollo](#adr-003-selección-de-nextjs-con-typescript-estricto-como-framework-de-desarrollo)
- [ADR-004: Estrategia de Sincronización Cache-Aside entre Aurora y ElastiCache](#adr-004-estrategia-de-sincronización-cache-aside-entre-aurora-y-elasticache)
- [ADR-005: Estrategia de Pruebas y Aseguramiento de Calidad](#adr-005-estrategia-de-pruebas-y-aseguramiento-de-calidad)

---

## ADR-001: Selección de Amazon ElastiCache (Redis) para Prevención de Overbooking

### Estado

Aceptado

### Contexto

ReservFlow es un sistema de reservaciones de alta concurrencia donde múltiples usuarios pueden intentar reservar la misma habitación simultáneamente. El riesgo crítico de negocio identificado en el Project Charter es la sobreventa (overbooking). Se requiere un mecanismo que garantice la atomicidad de las operaciones de verificación y decremento de inventario bajo carga concurrente (NFR-02).

### Decisión

Utilizar **Amazon ElastiCache for Redis** como mecanismo de control de inventario en tiempo real, implementando transacciones atómicas mediante los comandos `WATCH`/`MULTI`/`EXEC` de Redis para garantizar que la verificación de disponibilidad y el decremento de inventario se ejecuten como una operación indivisible.

### Alternativas Consideradas

| Alternativa | Descripción | Razón de Descarte |
|-------------|-------------|-------------------|
| Bloqueo pesimista en Aurora (SELECT FOR UPDATE) | Bloqueo a nivel de fila en PostgreSQL | Latencia inaceptable bajo alta concurrencia; bloqueos pueden causar deadlocks y degradar el rendimiento |
| Bloqueo optimista en Aurora (versioning) | Control de concurrencia con columna de versión | Requiere reintentos frecuentes bajo alta carga; latencia de disco vs. memoria |
| Redis con Lua Scripts | Scripts atómicos en Redis | Mayor complejidad de mantenimiento; WATCH/MULTI/EXEC es suficiente para el caso de uso |
| Amazon DynamoDB con Conditional Writes | Escrituras condicionales en DynamoDB | Introduce un servicio adicional; Redis ya cubre el caso de uso con menor latencia |

### Justificación (ISO 25010)

- **Eficiencia de Desempeño (Comportamiento temporal):** Redis opera en memoria con latencia sub-milisegundo, cumpliendo NFR-01 (< 100ms).
- **Fiabilidad (Integridad de datos):** Las transacciones atómicas WATCH/MULTI/EXEC garantizan zero-overbooking bajo concurrencia.
- **Fiabilidad (Disponibilidad):** ElastiCache ofrece replicación automática y failover.

### Consecuencias

- (+) Latencia de validación de disponibilidad en microsegundos.
- (+) Garantía de atomicidad sin bloqueos de base de datos.
- (-) Se requiere estrategia de sincronización entre Redis y Aurora (ver ADR-004).
- (-) Dependencia de servicio administrado de AWS.

### Requerimientos vinculados

NFR-01, NFR-02, FR-04

### Atributos de calidad vinculados

- Eficiencia de Desempeño (Alta)
- Fiabilidad — Integridad de Datos (Alta)

---

## ADR-002: Selección de Amazon Aurora (PostgreSQL) como Base de Datos Persistente

### Estado

Aceptado

### Contexto

El sistema requiere una base de datos relacional que soporte el modelo de datos de reservaciones (relaciones entre habitaciones, usuarios, fechas y estados), garantice durabilidad de datos y ofrezca alta disponibilidad con failover automático (NFR-06). La restricción del proyecto exige el uso de servicios administrados de AWS.

### Decisión

Utilizar **Amazon Aurora (PostgreSQL 15 compatible)** como base de datos persistente principal, configurada con réplicas de lectura para distribuir la carga de consultas del dashboard administrativo y garantizar disponibilidad >= 99.9%.

### Alternativas Consideradas

| Alternativa | Descripción | Razón de Descarte |
|-------------|-------------|-------------------|
| Amazon RDS PostgreSQL estándar | PostgreSQL administrado sin Aurora | Menor rendimiento de replicación; Aurora ofrece hasta 5x mejor throughput |
| Amazon DynamoDB | Base de datos NoSQL serverless | Modelo relacional de reservaciones no se adapta bien a NoSQL; consultas complejas del dashboard requieren SQL |
| PostgreSQL auto-administrado en EC2 | PostgreSQL en instancias EC2 | Mayor carga operativa; no cumple con la restricción de servicios administrados |

### Justificación (ISO 25010)

- **Fiabilidad (Disponibilidad):** Aurora ofrece replicación automática con hasta 15 réplicas de lectura y failover en menos de 30 segundos, soportando la meta de >= 99.9%.
- **Fiabilidad (Tolerancia a fallos):** Almacenamiento distribuido en 3 zonas de disponibilidad con recuperación automática.
- **Eficiencia de Desempeño (Capacidad):** Réplicas de lectura absorben la carga del dashboard administrativo sin afectar las escrituras transaccionales.

### Consecuencias

- (+) Alta disponibilidad con failover automático.
- (+) Réplicas de lectura para separar carga de consultas.
- (+) Compatibilidad total con PostgreSQL (herramientas, ORMs, migraciones).
- (-) Costo superior a RDS estándar.
- (-) Vendor lock-in con AWS.

### Requerimientos vinculados

NFR-06, NFR-08, FR-01, FR-02

### Atributos de calidad vinculados

- Fiabilidad — Disponibilidad (Media)
- Fiabilidad — Tolerancia a Fallos (Alta)

---

## ADR-003: Selección de Next.js con TypeScript Estricto como Framework de Desarrollo

### Estado

Aceptado

### Contexto

El equipo de dos personas (Emilio Guzmán y León Rivera) necesita un framework que permita desarrollar tanto el frontend (buscador, funnel, dashboard) como la API REST en un solo proyecto, minimizando la complejidad operativa. Se requiere TypeScript en modo estricto para prevenir errores de tipado en tiempo de ejecución (NFR-04).

### Decisión

Utilizar **Next.js 14 con React 18 y TypeScript en modo estricto** (`strict: true` en tsconfig.json) como framework unificado para frontend y API, aprovechando API Routes para los endpoints REST y Server-Side Rendering para la UI.

### Alternativas Consideradas

| Alternativa | Descripción | Razón de Descarte |
|-------------|-------------|-------------------|
| Frontend React + Backend Express separados | Arquitectura de microservicios frontend/backend | Duplica la complejidad operativa para un equipo de 2 personas; requiere dos despliegues |
| Remix + TypeScript | Framework full-stack alternativo | Ecosistema menos maduro; menor soporte de la comunidad para integraciones AWS |
| Angular + NestJS | Stack enterprise TypeScript | Curva de aprendizaje mayor; overhead excesivo para el alcance del MVP |

### Justificación (ISO 25010)

- **Mantenibilidad (Modularidad):** Next.js permite separar claramente componentes de UI, API Routes y lógica de negocio en módulos independientes.
- **Mantenibilidad (Analizabilidad):** TypeScript estricto con ESLint y SonarQube facilita la detección temprana de errores y reduce la deuda técnica.
- **Eficiencia de Desempeño (Comportamiento temporal):** SSR y optimizaciones automáticas de Next.js contribuyen a cumplir la meta de UI < 2s P95.

### Consecuencias

- (+) Un solo proyecto para frontend y API, simplificando CI/CD.
- (+) TypeScript estricto previene errores de nulidad y tipado.
- (+) SSR mejora el rendimiento percibido de la UI.
- (-) API Routes de Next.js tienen limitaciones para lógica de servidor compleja (mitigado con la modularidad del Reservation Manager e Inventory Controller).

### Requerimientos vinculados

NFR-04, NFR-05, FR-03

### Atributos de calidad vinculados

- Mantenibilidad — Modularidad (Media)
- Mantenibilidad — Analizabilidad (Media)

---

## ADR-004: Estrategia de Sincronización Cache-Aside entre Aurora y ElastiCache

### Estado

Aceptado

### Contexto

El sistema utiliza dos fuentes de datos: ElastiCache (Redis) como fuente de verdad para inventario en tiempo real y Aurora como persistencia durable. Se necesita una estrategia de sincronización que garantice consistencia eventual entre ambas fuentes sin sacrificar la latencia de las operaciones de reservación (FR-04, NFR-01).

### Decisión

Implementar un patrón **Cache-Aside con invalidación activa** donde:

1. **Lecturas:** La aplicación consulta primero Redis. Si hay cache miss, consulta Aurora y actualiza Redis.
2. **Escrituras (reservación):** La transacción atómica se ejecuta primero en Redis (WATCH/MULTI/EXEC). Si es exitosa, se persiste en Aurora. Si la escritura en Aurora falla, se revierte Redis (compensación).
3. **Invalidación:** Un proceso periódico (cada 60 segundos) reconcilia el estado de Redis con Aurora para detectar y corregir inconsistencias.

### Alternativas Consideradas

| Alternativa | Descripción | Razón de Descarte |
|-------------|-------------|-------------------|
| Write-Through | Escritura simultánea a Redis y Aurora | Mayor latencia en escrituras; complejidad de manejo de fallos parciales |
| Write-Behind (Write-Back) | Escritura a Redis con persistencia asíncrona a Aurora | Riesgo de pérdida de datos si Redis falla antes de la persistencia |
| Event Sourcing con SNS/SQS | Eventos de cambio propagados por mensajería | Complejidad excesiva para el alcance del MVP y el tamaño del equipo |

### Justificación (ISO 25010)

- **Fiabilidad (Integridad de datos):** La secuencia Redis-primero con compensación garantiza que no se confirme una reservación sin inventario disponible.
- **Eficiencia de Desempeño (Comportamiento temporal):** Las lecturas siempre van a Redis (sub-milisegundo); las escrituras priorizan Redis para latencia mínima.
- **Fiabilidad (Recuperabilidad):** El proceso de reconciliación periódica detecta y corrige inconsistencias automáticamente.

### Consecuencias

- (+) Latencia mínima en lecturas y escrituras.
- (+) Consistencia eventual con reconciliación automática.
- (+) Mecanismo de compensación para fallos de Aurora.
- (-) Ventana de inconsistencia de hasta 60 segundos entre Redis y Aurora para datos no transaccionales.
- (-) Complejidad adicional del proceso de reconciliación.

### Requerimientos vinculados

FR-04, NFR-01, NFR-02

### Atributos de calidad vinculados

- Fiabilidad — Integridad de Datos (Alta)
- Eficiencia de Desempeño (Alta)

---

## ADR-005: Estrategia de Pruebas y Aseguramiento de Calidad

### Estado

Aceptado

### Contexto

El proyecto requiere mantener una cobertura de código mínima del 80% (NFR-03), garantizar la ausencia de vulnerabilidades críticas de seguridad y automatizar la validación de calidad en el flujo de CI/CD. El gate de QA (NFR-07) exige que ninguna funcionalidad se despliegue sin aprobación previa.

### Decisión

Implementar una estrategia de pruebas en capas con las siguientes herramientas y procesos:

| Capa | Herramienta | Propósito |
|------|-------------|-----------|
| Pruebas Unitarias | Vitest | Validación de lógica de Reservation Manager e Inventory Controller (>= 80% cobertura) |
| Pruebas de Integración | Vitest + Testcontainers | Validación de sincronización Aurora-ElastiCache con contenedores reales |
| Análisis Estático de Código | ESLint + SonarQube | Detección de bugs, code smells y deuda técnica |
| Análisis de Seguridad (SAST) | Checkmarx | Identificación de vulnerabilidades en código fuente |
| CI/CD | GitHub Actions | Ejecución automatizada de pruebas, análisis y gates de calidad |
| Gate de QA | GitHub Actions + Aprobación manual | Ningún despliegue sin validación de cobertura y aprobación |

### Alternativas Consideradas

| Alternativa | Descripción | Razón de Descarte |
|-------------|-------------|-------------------|
| Jest en lugar de Vitest | Framework de pruebas tradicional | Vitest ofrece mejor rendimiento con proyectos Vite/Next.js y compatibilidad nativa con ESM |
| Cypress para E2E | Pruebas end-to-end de UI | Fuera del alcance del MVP; se priorizan pruebas unitarias y de integración |
| Jenkins para CI/CD | Servidor de CI/CD auto-administrado | GitHub Actions está integrado con el repositorio y no requiere infraestructura adicional |

### Justificación (ISO 25010)

- **Mantenibilidad (Capacidad de ser probado):** Vitest con cobertura >= 80% garantiza que la lógica de negocio es verificable.
- **Seguridad (Confidencialidad):** Checkmarx identifica vulnerabilidades antes del despliegue.
- **Mantenibilidad (Analizabilidad):** SonarQube proporciona métricas continuas de calidad y deuda técnica.

### Consecuencias

- (+) Cobertura de código verificada automáticamente en cada PR.
- (+) Vulnerabilidades detectadas antes de llegar a producción.
- (+) Gate de QA automatizado con aprobación manual como último paso.
- (-) Tiempo de ejecución del pipeline de CI puede aumentar con Checkmarx.
- (-) Requiere configuración inicial de SonarQube y Checkmarx.

### Requerimientos vinculados

NFR-03, NFR-07

### Atributos de calidad vinculados

- Mantenibilidad — Cobertura de Código (Alta)
- Seguridad (Media)