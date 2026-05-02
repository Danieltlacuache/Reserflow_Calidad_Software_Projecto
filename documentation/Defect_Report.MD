# Reporte de Defectos — ReservFlow (ApexReservations)

## 1. Información General

| Campo | Detalle |
|-------|---------|
| **Proyecto** | ReservFlow (ApexReservations) — Sistema de Reservaciones de Alta Concurrencia |
| **Autores** | Emilio Daniel Guzmán Seda y León Carlo Rivera Cárdenas |
| **Stakeholder** | Mtra. Sarahí Ochoa Partida |
| **Fecha** | Mayo 2025 |
| **Materia** | Calidad de Software |
| **Propósito** | Documentar los defectos identificados, analizados y resueltos durante el desarrollo del sistema ReservFlow, incluyendo su clasificación por severidad, fase de detección y resolución aplicada. |

---

## 2. Resumen Ejecutivo

Durante el ciclo de desarrollo del sistema ReservFlow se identificaron y resolvieron **8 defectos**. Todos los defectos fueron detectados durante la **fase de desarrollo** (pre-producción), lo que demuestra la efectividad del pipeline CI/CD y las prácticas de calidad implementadas.

| Indicador | Valor |
|-----------|-------|
| Total de defectos encontrados | 8 |
| Defectos resueltos | 8 (100%) |
| Defectos abiertos | 0 |
| Defectos críticos | 1 |
| Defectos mayores | 4 |
| Defectos menores | 3 |
| Fase de detección principal | Implementación (5), CI/CD (3) |

> **Estado actual:** No existen defectos abiertos. Todos los defectos fueron corregidos antes de la entrega del proyecto.

---

## 3. Registro de Defectos

| ID | Descripción | Severidad | Prioridad | Estado | Fase de Detección | Resolución |
|----|-------------|-----------|-----------|--------|-------------------|------------|
| **DEF-001** | Validación de variables de entorno con `z.string().url()` rechazaba URLs de PostgreSQL (`postgresql://...`) y Redis (`redis://...`) porque Zod no las reconoce como URLs válidas según el estándar RFC | Mayor | Alta | ✅ Resuelto | Implementación | Cambiar la validación de `z.string().url()` a `z.string().min(1)` para `DATABASE_URL` y `REDIS_URL`, permitiendo cualquier cadena de conexión válida |
| **DEF-002** | El archivo `services.ts` utilizaba `require()` dinámico para cargar módulos, lo cual es incompatible con el App Router de Next.js 14 que requiere imports estáticos para el tree-shaking y la compilación de Server Components | Crítico | Alta | ✅ Resuelto | Implementación | Reescribir `services.ts` con imports directos (`import`) y patrón de lazy initialization mediante singletons, eliminando completamente el uso de `require()` dinámico |
| **DEF-003** | La conexión a Redis configurada con `lazyConnect: true` no se conectaba automáticamente al ejecutar las API Routes, causando timeouts en las consultas de disponibilidad | Mayor | Alta | ✅ Resuelto | Implementación | Remover la opción `lazyConnect: true` de la configuración de ioredis, permitiendo la conexión automática al instanciar el cliente Redis |
| **DEF-004** | El hook `useEffect` en `ReservationTable.tsx` no incluía `fetchReservations` en su array de dependencias, generando un warning de ESLint (`react-hooks/exhaustive-deps`) y potenciales bugs de datos desactualizados | Menor | Media | ✅ Resuelto | CI/CD (ESLint) | Refactorizar `fetchReservations` con `useCallback` y agregarlo al array de dependencias del `useEffect` |
| **DEF-005** | Variables destructuradas no utilizadas (prefijadas con `_`) en `env.test.ts` violaban la regla `@typescript-eslint/no-unused-vars`, bloqueando el pipeline de CI/CD | Menor | Media | ✅ Resuelto | CI/CD (ESLint) | Reemplazar la destructuración con `delete` sobre una copia del objeto `process.env` para eliminar variables sin declararlas como no utilizadas |
| **DEF-006** | El runner self-hosted de GitHub Actions estaba configurado para el repositorio incorrecto (`Practica_DOs_CDS`) en lugar del repositorio actual (`ReservFlow`), impidiendo la ejecución del pipeline CI/CD | Mayor | Alta | ✅ Resuelto | CI/CD | Reconfigurar el runner self-hosted para apuntar al repositorio correcto `ReservFlow` y verificar la conexión con GitHub |
| **DEF-007** | El token OAuth (Personal Access Token) utilizado para GitHub Actions no tenía el scope `workflow`, lo que impedía hacer push del archivo `ci.yml` al directorio `.github/workflows/` | Mayor | Alta | ✅ Resuelto | CI/CD | Generar un nuevo Personal Access Token (PAT) con el scope `workflow` habilitado y actualizar las credenciales del repositorio |
| **DEF-008** | El comando `create-next-app` generó la estructura del proyecto dentro de una subcarpeta `reservflow/` en lugar de la raíz del repositorio, causando rutas incorrectas en las configuraciones de CI/CD y SonarQube | Menor | Baja | ✅ Resuelto | Implementación | Mover todos los archivos generados a la raíz del repositorio y eliminar la subcarpeta `reservflow/` vacía |

---

## 4. Análisis de Defectos

### 4.1 Distribución por Severidad

| Severidad | Cantidad | Porcentaje | Descripción |
|-----------|----------|------------|-------------|
| **Crítico** | 1 | 12.5% | Defectos que impiden el funcionamiento del sistema o causan pérdida de datos |
| **Mayor** | 4 | 50.0% | Defectos que afectan funcionalidad importante pero tienen workaround |
| **Menor** | 3 | 37.5% | Defectos cosméticos o de estilo que no afectan la funcionalidad |
| **Total** | **8** | **100%** | — |

### 4.2 Distribución por Fase de Detección

| Fase | Cantidad | Porcentaje | Defectos |
|------|----------|------------|----------|
| **Implementación** | 5 | 62.5% | DEF-001, DEF-002, DEF-003, DEF-005, DEF-008 |
| **CI/CD** | 3 | 37.5% | DEF-004, DEF-006, DEF-007 |
| **Total** | **8** | **100%** | — |

### 4.3 Distribución por Categoría

| Categoría | Cantidad | Defectos |
|-----------|----------|----------|
| Configuración / Entorno | 3 | DEF-001, DEF-006, DEF-007 |
| Arquitectura / Diseño | 2 | DEF-002, DEF-003 |
| Calidad de Código | 2 | DEF-004, DEF-005 |
| Estructura del Proyecto | 1 | DEF-008 |

### 4.4 Densidad de Defectos

| Métrica | Valor |
|---------|-------|
| Líneas de código estimadas (KLOC) | ~11.5 |
| Total de defectos | 8 |
| **Densidad de defectos** | **~0.7 por KLOC** |
| Meta del proyecto (Quality Criteria) | ≤ 0.5 por KLOC |
| **Evaluación** | Ligeramente por encima de la meta, pero aceptable para un MVP académico |

> La densidad de defectos de ~0.7/KLOC está ligeramente por encima de la meta de ≤0.5/KLOC definida en los Quality Criteria (ISO 25010). Sin embargo, considerando que: (a) todos los defectos fueron detectados y resueltos en pre-producción, (b) 3 de los 8 defectos son de configuración de CI/CD y no de lógica de negocio, y (c) el proyecto es un MVP académico, la densidad se considera **aceptable**.

---

## 5. Defectos de SonarQube

El análisis estático continuo se ejecuta mediante SonarQube Community Edition, accesible en el dashboard local:

- **URL del Dashboard:** `http://localhost:9000`
- **Proyecto:** ReservFlow (ApexReservations)

### Resultado del Quality Gate

| Métrica de SonarQube | Estado |
|----------------------|--------|
| Quality Gate | ✅ **Passed** |
| Bugs | 0 |
| Vulnerabilidades | 0 |
| Code Smells | Dentro del umbral aceptable |
| Duplicación de código | Dentro del umbral aceptable |
| Cobertura | Reportada desde Vitest (>80%) |

> El análisis de SonarQube se ejecuta automáticamente en el pipeline de GitHub Actions en cada Pull Request. Los resultados se publican en el dashboard local y se verifican como parte del gate de calidad antes de permitir el merge.

---

## 6. Conclusiones

### 6.1 Efectividad del Proceso de Detección

Todos los defectos fueron detectados y resueltos **antes de producción**, lo que valida la efectividad del proceso de calidad implementado:

- **ESLint** detectó 2 defectos de calidad de código (DEF-004, DEF-005) de forma automática en el pipeline CI/CD.
- **SonarQube** complementó el análisis estático y pasó el Quality Gate sin bugs ni vulnerabilidades.
- **Las pruebas unitarias con Vitest** permitieron identificar defectos de lógica durante la implementación (DEF-001, DEF-002, DEF-003).
- **La configuración de CI/CD** reveló problemas de infraestructura del pipeline (DEF-006, DEF-007) que fueron resueltos oportunamente.

### 6.2 Defecto Más Crítico

El defecto más crítico fue **DEF-002** (uso de `require()` dinámico incompatible con Next.js App Router). Este defecto era de naturaleza **arquitectónica** y requirió un rediseño del patrón de inicialización de servicios:

- **Problema:** `require()` dinámico no es compatible con el tree-shaking y la compilación de Server Components en Next.js 14.
- **Solución:** Reescritura completa de `services.ts` con imports directos y patrón de lazy initialization mediante singletons.
- **Impacto:** La resolución mejoró la arquitectura del proyecto al eliminar una dependencia en un patrón legacy de Node.js.

### 6.3 Lecciones Aprendidas

1. **Validación temprana de compatibilidad:** Los frameworks modernos (Next.js 14 App Router) tienen restricciones específicas que deben validarse al inicio del proyecto.
2. **CI/CD como red de seguridad:** El pipeline automatizado demostró ser efectivo para detectar defectos que podrían pasar desapercibidos en revisiones manuales.
3. **Configuración de entorno:** Los defectos de configuración (DEF-006, DEF-007, DEF-008) representan un costo de setup inicial que se amortiza con la automatización posterior.
4. **Análisis estático proactivo:** ESLint con reglas estrictas de TypeScript detectó problemas de calidad de código antes de que se convirtieran en bugs funcionales.

### 6.4 Estado Final

| Indicador | Valor |
|-----------|-------|
| Defectos abiertos | **0** |
| Defectos resueltos | **8 (100%)** |
| Quality Gate SonarQube | **✅ Passed** |
| Pipeline CI/CD | **✅ Verde** |
| Cobertura de código | **92.67% (>80%)** |

> El proyecto ReservFlow se encuentra en un estado de calidad aceptable para su entrega como MVP académico, con todos los defectos resueltos y los gates de calidad aprobados.
