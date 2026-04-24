# Reporte de Inspección de Diseño — ReservFlow (ApexReservations)

## Información General

| Campo | Detalle |
|-------|---------|
| **Proyecto** | ReservFlow (ApexReservations) |
| **Autores** | Emilio Daniel Guzmán Seda y León Carlo Rivera Cárdenas |
| **Stakeholder** | Mtra. Sarahí Ochoa Partida |
| **Fecha de elaboración** | Junio 2025 |

---

## Introducción

Este documento presenta el reporte de inspección del diseño arquitectónico del sistema ReservFlow, basado en las ocho características principales del estándar **ISO/IEC 25010** (Modelo de Calidad de Producto de Software). La inspección evalúa los artefactos de diseño generados en el Punto 3 del proyecto — diagramas del Modelo C4, Registros de Decisiones Arquitectónicas (ADR) y Escenarios de Atributos de Calidad — para verificar que el diseño cumple con los criterios de calidad establecidos y los requerimientos funcionales (FR-01 a FR-07) y no funcionales (NFR-01 a NFR-08) definidos en los Puntos 1 y 2.

---

## Información de la Inspección

| Campo | Valor |
|-------|-------|
| **Fecha de ejecución** | Junio 2025 |
| **Participantes** | Emilio Daniel Guzmán Seda (Arquitecto/QA Lead), León Carlo Rivera Cárdenas (Arquitecto/QA Lead) |
| **Artefactos revisados** | Diagrama de Contexto C4, Diagrama de Contenedores C4, Diagrama de Componentes C4, ADR-001 a ADR-005, Escenarios QA-01 a QA-05 |
| **Método** | Inspección por checklist basada en ISO/IEC 25010 |

---

## Checklist de Verificación ISO/IEC 25010

La siguiente tabla evalúa el diseño arquitectónico de ReservFlow contra las ocho características principales de ISO/IEC 25010, con 23 ítems de verificación que cubren las subcaracterísticas relevantes al sistema.

| # | Característica ISO 25010 | Ítem de Verificación | Estado | Justificación |
|---|--------------------------|----------------------|--------|---------------|
| 1 | **Adecuación Funcional** — Completitud | El diseño del Reservation Manager cubre el ciclo de vida CRUD completo de reservaciones (crear, leer, actualizar estado, cancelar) | Cumple | El Diagrama de Componentes muestra al Reservation Manager con responsabilidad explícita de CRUD. Los API Routes exponen endpoints para cada operación. Trazable a FR-01, FR-02. |
| 2 | **Adecuación Funcional** — Corrección | El diseño garantiza validación de disponibilidad antes de confirmar reservaciones | Cumple | El flujo de reservación (diagrama de secuencia) muestra que el Inventory Controller valida disponibilidad en Redis antes de persistir en Aurora. ADR-001 documenta el mecanismo atómico. |
| 3 | **Adecuación Funcional** — Pertinencia | El diseño incluye buscador, funnel de reserva y dashboard administrativo | Cumple | El Diagrama de Componentes identifica los tres elementos de UI como parte del componente "Componentes de UI". Trazable a FR-03, FR-05. |
| 4 | **Eficiencia de Desempeño** — Comportamiento temporal | El diseño soporta latencia de consulta de disponibilidad < 100ms | Cumple | ADR-001 justifica el uso de Redis (sub-milisegundo). Escenario QA-01 define la medida. Trazable a NFR-01. |
| 5 | **Eficiencia de Desempeño** — Capacidad | El diseño soporta alta concurrencia de usuarios simultáneos | Cumple | Transacciones atómicas Redis (WATCH/MULTI/EXEC) manejan concurrencia sin bloqueos. Réplicas de lectura Aurora absorben carga de consultas. |
| 6 | **Eficiencia de Desempeño** — UI | El diseño soporta renderizado de dashboard < 2s P95 | Cumple | Next.js SSR + réplicas de lectura Aurora para consultas del dashboard. Escenario QA-05 define la medida. |
| 7 | **Compatibilidad** — Interoperabilidad | El diseño permite integración con APIs externas (Airbnb/Booking.com) | Cumple | Mock Integration Client con contratos OpenAPI definidos. Mock Services como contenedor independiente. Trazable a FR-06. |
| 8 | **Compatibilidad** — Coexistencia | El diseño permite aislamiento de entornos (local, QA, producción) | Cumple | ADR-003 menciona configuración por variables de entorno. Trazable a NFR-07. |
| 9 | **Usabilidad** — Operabilidad | El diseño incluye interfaces claras para clientes y administradores | Cumple | Diagrama de Contexto diferencia los dos tipos de usuario. Componentes de UI separados para cada rol. |
| 10 | **Usabilidad** — Protección contra errores | El diseño previene errores de usuario en el flujo de reservación | Cumple Parcialmente | El funnel de reserva guía al usuario, pero no se detallan validaciones de formulario específicas en el diseño. **Recomendación:** Documentar validaciones de entrada en el Reservation Manager. |
| 11 | **Fiabilidad** — Disponibilidad | El diseño soporta disponibilidad >= 99.9% | Cumple | Aurora con réplicas de lectura y failover automático (< 30s). ElastiCache con replicación. ADR-002 y Escenario QA-03 documentan el mecanismo. Trazable a NFR-06. |
| 12 | **Fiabilidad** — Tolerancia a fallos | El diseño maneja fallos de red y componentes | Cumple | ADR-004 define mecanismo de compensación (rollback Redis si Aurora falla). Proceso de reconciliación periódica. Trazable a NFR-08. |
| 13 | **Fiabilidad** — Integridad de datos | El diseño garantiza zero-overbooking bajo concurrencia | Cumple | ADR-001 documenta transacciones atómicas Redis. Escenario QA-02 define la medida (0% sobreventa). Trazable a NFR-02. |
| 14 | **Fiabilidad** — Recuperabilidad | El diseño permite recuperación ante fallos | Cumple | Reconciliación periódica Aurora-Redis (cada 60s). Failover automático de Aurora. ADR-004 documenta la estrategia. |
| 15 | **Seguridad** — Confidencialidad | El diseño protege datos sensibles | Cumple Parcialmente | Comunicaciones cifradas (SSL/TLS) entre componentes. Checkmarx para SAST. **Recomendación:** Documentar explícitamente la estrategia de autenticación y autorización por roles (admin vs. cliente). |
| 16 | **Seguridad** — Integridad | El diseño protege contra modificación no autorizada de datos | Cumple | Transacciones atómicas en Redis y Aurora. Gate de QA previene despliegues sin validación. |
| 17 | **Seguridad** — No repudio | El diseño registra acciones de los usuarios | Cumple Parcialmente | NFR-07 menciona logs de actividad con retención de 72 horas. **Recomendación:** Detallar la estrategia de logging y auditoría en el diseño. |
| 18 | **Mantenibilidad** — Modularidad | El diseño separa responsabilidades entre componentes | Cumple | Diagrama de Componentes muestra separación clara: UI, API Routes, Reservation Manager, Inventory Controller, Mock Client. ADR-003 justifica la decisión. |
| 19 | **Mantenibilidad** — Analizabilidad | El diseño facilita la detección de errores | Cumple | TypeScript estricto + ESLint + SonarQube. ADR-005 documenta la estrategia. Trazable a NFR-04. |
| 20 | **Mantenibilidad** — Capacidad de ser probado | El diseño soporta cobertura de pruebas >= 80% | Cumple | ADR-005 define Vitest como framework con meta de >= 80%. GitHub Actions automatiza la verificación. Trazable a NFR-03. |
| 21 | **Mantenibilidad** — Capacidad de ser modificado | El diseño permite cambios con impacto controlado | Cumple | Escenario QA-04 valida que un cambio de módulo afecta < 5 módulos en < 2 semanas. Modularidad del diseño lo soporta. |
| 22 | **Portabilidad** — Adaptabilidad | El diseño permite migración entre entornos | Cumple Parcialmente | Variables de entorno para configuración. **Recomendación:** Considerar containerización (Docker) para garantizar paridad entre entornos local/QA/producción. |
| 23 | **Portabilidad** — Capacidad de ser instalado | El diseño facilita el despliegue | Cumple | GitHub Actions CI/CD con gate de QA. Next.js soporta despliegue en múltiples plataformas. |

---

## Resumen de Hallazgos

La inspección identificó 4 hallazgos de severidad baja a media. Ninguno compromete la viabilidad del MVP, pero se recomienda abordarlos para fortalecer la calidad del diseño.

| # | Hallazgo | Severidad | Característica ISO 25010 | Recomendación |
|---|----------|-----------|--------------------------|---------------|
| H-01 | No se detallan validaciones de formulario en el flujo de reservación | Baja | Usabilidad — Protección contra errores | Documentar reglas de validación de entrada (fechas, capacidad, datos personales) en la especificación del Reservation Manager |
| H-02 | Estrategia de autenticación y autorización no documentada explícitamente | Media | Seguridad — Confidencialidad | Crear un ADR adicional para la estrategia de autenticación (JWT, sesiones) y control de acceso basado en roles |
| H-03 | Estrategia de logging y auditoría no detallada | Baja | Seguridad — No repudio | Especificar formato de logs, niveles de severidad y mecanismo de retención de 72 horas |
| H-04 | Paridad de entornos depende de variables de entorno sin containerización | Baja | Portabilidad — Adaptabilidad | Evaluar el uso de Docker Compose para garantizar paridad entre entornos de desarrollo, QA y producción |

---

## Conclusión de la Inspección

El diseño arquitectónico de ReservFlow **cumple satisfactoriamente** con los atributos de calidad prioritarios definidos en el Quality Model y los Quality Criteria del proyecto:

- **Fiabilidad:** El mecanismo de transacciones atómicas Redis (WATCH/MULTI/EXEC) garantiza zero-overbooking bajo concurrencia (NFR-02). Aurora con réplicas de lectura y failover automático soporta la meta de disponibilidad >= 99.9% (NFR-06). La estrategia Cache-Aside con reconciliación periódica asegura integridad de datos entre las dos fuentes.

- **Eficiencia de Desempeño:** El uso de ElastiCache (Redis) como fuente de verdad para inventario en tiempo real permite latencias sub-milisegundo en consultas de disponibilidad, cumpliendo la meta de < 100ms (NFR-01). Next.js con SSR y réplicas de lectura Aurora soportan el renderizado del dashboard en < 2s P95.

- **Mantenibilidad:** La arquitectura modular con separación clara de componentes (Reservation Manager, Inventory Controller, Mock Integration Client), TypeScript estricto, y la estrategia de pruebas con Vitest (>= 80% cobertura), ESLint y SonarQube facilitan la evolución y mantenimiento del sistema (NFR-03, NFR-04).

- **Seguridad:** Las comunicaciones cifradas (SSL/TLS), el análisis SAST con Checkmarx y el gate de QA en CI/CD proporcionan una base sólida, aunque se requiere documentar explícitamente la estrategia de autenticación y autorización (H-02).

Los hallazgos identificados son de severidad baja a media y no comprometen la viabilidad del MVP. Se recomienda abordarlos en el siguiente orden de prioridad:

---

## Recomendaciones Priorizadas por Impacto en Atributos de Calidad

| Prioridad | Hallazgo | Atributo de Calidad Impactado | Acción Recomendada | Plazo Sugerido |
|-----------|----------|-------------------------------|---------------------|----------------|
| 1 (Alta) | H-02 — Autenticación y autorización | Seguridad — Confidencialidad | Crear ADR-006 documentando la estrategia de autenticación (JWT/sesiones) y control de acceso basado en roles (admin vs. cliente) | Antes de la fase de implementación |
| 2 (Media) | H-03 — Logging y auditoría | Seguridad — No repudio | Especificar formato de logs estructurados, niveles de severidad, mecanismo de retención de 72 horas y herramienta de centralización | Durante la fase de implementación |
| 3 (Baja) | H-01 — Validaciones de formulario | Usabilidad — Protección contra errores | Documentar reglas de validación de entrada en la especificación del Reservation Manager (fechas válidas, capacidad, datos personales requeridos) | Durante la fase de implementación |
| 4 (Baja) | H-04 — Containerización | Portabilidad — Adaptabilidad | Evaluar Docker Compose para garantizar paridad entre entornos de desarrollo, QA y producción | Post-MVP |

---

*Documento generado como parte del Punto 3: Diseño del Sistema con Criterios de Calidad del proyecto ReservFlow (ApexReservations).*
