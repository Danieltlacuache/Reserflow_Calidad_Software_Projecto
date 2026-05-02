# Plan de Pruebas — ReservFlow (ApexReservations)

## 1. Información General

| Campo | Detalle |
|-------|---------|
| **Proyecto** | ReservFlow (ApexReservations) — Sistema de Reservaciones de Alta Concurrencia |
| **Autores** | Emilio Daniel Guzmán Seda y León Carlo Rivera Cárdenas |
| **Stakeholder** | Mtra. Sarahí Ochoa Partida |
| **Fecha** | Mayo 2025 |
| **Materia** | Calidad de Software |
| **Propósito** | Documentar la estrategia, alcance, niveles y resultados de las pruebas aplicadas al sistema ReservFlow para garantizar el cumplimiento de los requerimientos funcionales y no funcionales definidos en el proyecto. |

---

## 2. Alcance de las Pruebas

Las pruebas cubren los siguientes módulos y componentes del sistema:

| Componente | Descripción | Tipo de Prueba |
|------------|-------------|----------------|
| **Reservation Manager** | Lógica CRUD del ciclo de vida de reservaciones (crear, consultar, actualizar estado, cancelar) | Unitarias |
| **Inventory Controller** | Sincronización de inventario entre Aurora y ElastiCache, transacciones atómicas Redis (WATCH/MULTI/EXEC), patrón Cache-Aside | Unitarias |
| **Mock Integration Client** | Cliente HTTP para consumo de APIs simuladas de Airbnb y Booking.com | Unitarias |
| **API Routes** | Endpoints REST (`/api/reservations`, `/api/rooms/availability`, `/api/admin/dashboard`) con validación Zod | Integración (con mocks) |
| **Manejo de Errores** | Clases de error personalizadas (`AppError`, `ValidationError`, `NotFoundError`, `AvailabilityError`, `InvalidTransitionError`, `IntegrationTimeoutError`) | Unitarias |
| **Validación de Entorno** | Validación de variables de entorno con Zod (`env.ts`) para aislamiento de configuración entre ambientes | Unitarias |

### Fuera de Alcance

- Componentes de UI (React/TailwindCSS) — no se automatizan pruebas de navegador
- Infraestructura AWS real (Aurora, ElastiCache) — se utilizan mocks locales
- Pruebas de rendimiento con carga real
- Pruebas de seguridad DAST

---

## 3. Niveles de Prueba Aplicados

| Nivel | Tipo | Herramienta | Estado | Justificación |
|-------|------|-------------|--------|---------------|
| Unitarias | Automatizadas | Vitest | ✅ Implementado | 50 tests ejecutados con cobertura >80% en todas las métricas. Validan la lógica de negocio del Reservation Manager, Inventory Controller, Mock Integration Client, errores personalizados y validación de entorno. |
| Integración API | Automatizadas | Vitest (mocks) | ✅ Implementado | Tests de API Routes con mocks de base de datos (PostgreSQL) y caché (Redis). Validan el flujo completo desde la petición HTTP hasta la respuesta, incluyendo validación Zod y manejo de errores. |
| Análisis Estático (SAST) | Automatizado | SonarQube + ESLint | ✅ Implementado | El pipeline CI/CD ejecuta ESLint con reglas estrictas de TypeScript y SonarQube en cada Pull Request. Detecta code smells, vulnerabilidades potenciales y violaciones de estilo. |

---

## 4. Niveles de Prueba No Aplicados y Justificación

| Nivel | Herramienta Típica | Justificación de Exclusión |
|-------|--------------------|-----------------------------|
| **Sistema (E2E)** | Cypress / Playwright | MVP escolar sin flujos E2E complejos; la UI es funcional pero no requiere automatización de navegador. Los flujos críticos de negocio se validan mediante pruebas unitarias y de integración API. |
| **Rendimiento** | JMeter / k6 | No hay infraestructura AWS real desplegada; las pruebas de latencia se validan mediante el diseño arquitectónico (Redis <100ms según NFR-01). El patrón WATCH/MULTI/EXEC garantiza atomicidad bajo concurrencia. |
| **Seguridad DAST** | OWASP ZAP | Requiere la aplicación desplegada en un servidor accesible; se cubre parcialmente con SAST de SonarQube y las reglas de ESLint para TypeScript estricto. |
| **Usabilidad** | Pruebas con usuarios | Proyecto académico sin usuarios finales reales disponibles para pruebas. La UI sigue principios básicos de accesibilidad y usabilidad. |
| **UAT formal** | Sesiones con stakeholder | La validación con stakeholder se realiza mediante la presentación del proyecto a la profesora (Mtra. Sarahí Ochoa Partida), no mediante un proceso formal de User Acceptance Testing. |

---

## 5. Estrategia de Pruebas

La estrategia de pruebas del proyecto se basa en los siguientes principios:

### 5.1 Pruebas Unitarias con Mocks
- Todas las pruebas unitarias utilizan **mocks** para las dependencias externas (PostgreSQL, Redis, APIs externas).
- **No se requiere** base de datos ni Redis real para ejecutar las pruebas.
- Los mocks replican el comportamiento esperado de las dependencias, incluyendo escenarios de error.

### 5.2 Cobertura Mínima del 80%
- La cobertura mínima del **80%** está enforced por los thresholds configurados en Vitest.
- Si la cobertura cae por debajo del umbral, el pipeline CI/CD falla automáticamente.
- Las métricas de cobertura incluyen: Statements, Branches, Functions y Lines.

### 5.3 Análisis Estático con ESLint
- ESLint configurado con reglas estrictas de TypeScript (`@typescript-eslint`).
- Reglas activas incluyen: `no-unused-vars`, `no-explicit-any`, `strict-boolean-expressions`, entre otras.
- Cualquier error de ESLint bloquea el merge del Pull Request.

### 5.4 Análisis Estático Continuo con SonarQube
- SonarQube ejecuta análisis de calidad en cada Pull Request.
- Evalúa: code smells, bugs potenciales, vulnerabilidades de seguridad, duplicación de código y cobertura.
- El **Quality Gate** de SonarQube debe pasar para considerar el código como aceptable.

### 5.5 CI/CD Automatizado con GitHub Actions
- El pipeline de GitHub Actions ejecuta automáticamente en cada Pull Request:
  1. Instalación de dependencias (`npm ci`)
  2. Linting (`npm run lint`)
  3. Pruebas unitarias con cobertura (`npm run test:coverage`)
  4. Análisis de SonarQube
- Ningún código se integra a la rama principal sin pasar todas las verificaciones.

---

## 6. Matriz de Cobertura de Pruebas

| Archivo de Prueba | Módulo | Tests | Cobertura | Requerimientos Cubiertos |
|--------------------|--------|-------|-----------|--------------------------|
| `errors.test.ts` | Errores personalizados (`AppError`, `ValidationError`, `NotFoundError`, `AvailabilityError`, `InvalidTransitionError`, `IntegrationTimeoutError`) | 7 | 100% | Manejo de errores del sistema |
| `env.test.ts` | Validación de entorno (`validateEnv`) | 6 | 100% | NFR-07 (Aislamiento de entornos) |
| `reservation-manager.test.ts` | Reservation Manager (CRUD, máquina de estados, validaciones) | 17 | 92.82% | FR-01 (Ciclo de vida CRUD), FR-02 (Gestión de estados) |
| `inventory-controller.test.ts` | Inventory Controller (disponibilidad, transacciones atómicas, Cache-Aside) | 13 | 98.81% | FR-05 (Sincronización inventario), NFR-01 (Latencia <100ms), NFR-02 (Prevención de overbooking) |
| `mock-integration-client.test.ts` | Mock Integration Client (Airbnb, Booking.com) | 7 | 100% | FR-07 (Consumo de mocks externos) |
| **Total** | **5 módulos** | **50** | **92.67%** | **FR-01, FR-02, FR-05, FR-07, NFR-01, NFR-02, NFR-07** |

---

## 7. Resultados de Cobertura

Resultados obtenidos con `@vitest/coverage-v8`:

| Métrica | Resultado | Umbral Mínimo | Estado |
|---------|-----------|---------------|--------|
| **Statements** | 92.67% | 80% | ✅ Cumple |
| **Branches** | 81.81% | 80% | ✅ Cumple |
| **Functions** | 93.54% | 80% | ✅ Cumple |
| **Lines** | 92.67% | 80% | ✅ Cumple |

> Todas las métricas superan el umbral mínimo del 80% establecido en NFR-03 y en los Quality Criteria del proyecto (ISO 25010).

---

## 8. Herramientas Utilizadas

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| **Vitest** | Última estable | Framework de pruebas unitarias y de integración para TypeScript/Node.js |
| **@vitest/coverage-v8** | Última estable | Generación de reportes de cobertura de código (Statements, Branches, Functions, Lines) |
| **ESLint** | Última estable | Análisis estático de código con reglas estrictas de TypeScript |
| **SonarQube** | Community Edition | Análisis estático continuo: code smells, bugs, vulnerabilidades, duplicación |
| **GitHub Actions** | N/A | Pipeline CI/CD para ejecución automatizada de linting, pruebas y análisis en cada PR |

---

## 9. Criterios de Aceptación de Pruebas

Las pruebas se consideran **aprobadas** cuando se cumplen **todos** los siguientes criterios simultáneamente:

| Criterio | Condición de Aceptación | Verificación |
|----------|------------------------|--------------|
| **Tests unitarios** | 0 tests fallidos | `npm run test` — todos los 50 tests pasan |
| **Cobertura de código** | ≥ 80% en Statements, Branches, Functions y Lines | `npm run test:coverage` — thresholds de Vitest |
| **Linting** | 0 errores de ESLint | `npm run lint` — sin errores ni warnings bloqueantes |
| **Análisis estático** | SonarQube Quality Gate passed | Dashboard de SonarQube — sin bugs críticos ni vulnerabilidades |
| **Pipeline CI/CD** | Estado verde (todas las etapas pasan) | GitHub Actions — check verde en el Pull Request |

### Criterio de Bloqueo

Si **cualquiera** de los criterios anteriores falla:
- El Pull Request **no puede ser mergeado** a la rama principal.
- El desarrollador debe corregir los problemas y volver a ejecutar el pipeline.
- No se aplican excepciones manuales al gate de calidad.

---

## 10. Conclusiones

El plan de pruebas de ReservFlow cubre de manera integral la lógica de negocio crítica del sistema mediante pruebas unitarias automatizadas con Vitest y análisis estático con ESLint y SonarQube. Con 50 tests y una cobertura global del 92.67%, el proyecto supera ampliamente el umbral mínimo del 80% establecido en los requerimientos no funcionales.

Los niveles de prueba no aplicados (E2E, rendimiento, DAST, usabilidad, UAT) están justificados por el contexto académico del proyecto y se mitigan parcialmente mediante el diseño arquitectónico y las herramientas de análisis estático implementadas.
