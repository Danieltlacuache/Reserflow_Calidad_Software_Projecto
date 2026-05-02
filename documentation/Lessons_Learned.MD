# Lecciones Aprendidas y Mejora Continua — ReservFlow (ApexReservations)

## 1. Información General

| Campo | Detalle |
|-------|---------|
| **Proyecto** | ReservFlow (ApexReservations) — Sistema de Reservaciones de Alta Concurrencia |
| **Autores** | Emilio Daniel Guzmán Seda y León Carlo Rivera Cárdenas |
| **Stakeholder** | Mtra. Sarahí Ochoa Partida |
| **Fecha** | Mayo 2026 |
| **Materia** | Calidad de Software |
| **Punto** | 8 — Retroalimentación y Mejora Continua |
| **Propósito** | Documentar las lecciones aprendidas durante el desarrollo del proyecto, las recomendaciones de mejora para futuros proyectos y el backlog de mejoras de proceso identificadas durante la retrospectiva del equipo. |

---

## 2. Reunión de Lecciones Aprendidas — Start/Stop/Continue

El equipo realizó una sesión de retrospectiva utilizando el framework **Start/Stop/Continue** para identificar prácticas que deben iniciarse, eliminarse o mantenerse en futuros proyectos.

### Start (Empezar a hacer)

| Práctica | Justificación |
|----------|---------------|
| Configurar el runner de CI/CD al inicio del proyecto, no al final | Evita DEF-006 y DEF-007. La configuración tardía del runner self-hosted causó bloqueos en el pipeline que retrasaron la integración de código. |
| Validar compatibilidad del framework (Next.js App Router) con patrones de código antes de implementar | Evita DEF-002. El uso de `require()` dinámico resultó incompatible con el App Router de Next.js 14, requiriendo un rediseño del patrón de inicialización de servicios. |
| Crear el docker-compose desde el día 1 para que todo el equipo tenga el mismo entorno | Reduce inconsistencias entre entornos de desarrollo. Un entorno local estandarizado desde el inicio previene defectos de configuración como DEF-001 y DEF-008. |

### Stop (Dejar de hacer)

| Práctica | Justificación |
|----------|---------------|
| Usar `require()` dinámico en proyectos con bundlers modernos | Causa incompatibilidades con tree-shaking y la compilación de Server Components en Next.js 14. Usar imports directos con lazy initialization en su lugar. |
| Hacer push directo a main sin PR | Rompe el flujo de GitFlow y los quality gates. Todo cambio debe pasar por un Pull Request con revisión obligatoria y pipeline CI/CD verde. |
| Asumir que `z.string().url()` acepta todos los esquemas de URL | Validar con datos reales primero. Zod no reconoce esquemas como `postgresql://` o `redis://` como URLs válidas según el estándar RFC. |

### Continue (Seguir haciendo)

| Práctica | Justificación |
|----------|---------------|
| Pipeline CI/CD automatizado con ESLint + Vitest + SonarQube | Detectó 37.5% de los defectos automáticamente (3 de 8). El pipeline es la red de seguridad más efectiva del proceso de calidad. |
| Code reviews obligatorios en cada PR | Mejora la calidad del código y comparte conocimiento entre los miembros del equipo. Ningún PR fue mergeado sin revisión. |
| Documentación progresiva (documentar mientras se desarrolla) | Evita deuda de documentación al final del proyecto. Los 20 documentos se generaron de forma incremental a lo largo de las 8 etapas. |
| TypeScript estricto desde el inicio | Previene errores de tipado en tiempo de ejecución. La configuración `strict: true` detectó problemas de nulidad y tipos antes de que se convirtieran en bugs. |
| Mocks para pruebas unitarias | Permite tests rápidos sin dependencias externas (PostgreSQL, Redis). Los 50 tests se ejecutan en segundos sin infraestructura real. |

---

## 3. Actualización del SQP y Estándares

Con base en las lecciones aprendidas y los defectos encontrados durante el proyecto, se proponen las siguientes actualizaciones al Software Quality Plan (SQP) y los estándares de desarrollo para futuros proyectos.

| Área | Mejora Propuesta | Defecto Relacionado |
|------|-----------------|---------------------|
| **Validación de entorno** | Usar `z.string().min(1)` en vez de `z.string().url()` para connection strings de bases de datos y servicios de caché | DEF-001 |
| **Inicialización de servicios** | Usar imports directos con lazy initialization, no `require()` dinámico. Documentar esta restricción en el CONTRIBUTING.md | DEF-002 |
| **CI/CD** | Configurar runner self-hosted al inicio del proyecto como parte del sprint 0 o setup inicial | DEF-006, DEF-007 |
| **Docker** | Incluir `docker-compose.yml` en el setup inicial del proyecto con todos los servicios necesarios (PostgreSQL, Redis) | DEF-001, DEF-003 |
| **Branch protection** | Activar enforcement automático desde el inicio del proyecto, incluyendo checks de CI obligatorios antes del merge | Auditoría ítem #10 |

### Estándares Actualizados

Estas mejoras se incorporarían al documento `IEEE_730_template.MD` (Software Quality Plan) y al `Selection_STM.MD` (Estándares, Herramientas y Métricas) en la siguiente iteración del proyecto.

---

## 4. Retroalimentación del Equipo

El equipo conformado por **Emilio Daniel Guzmán Seda** y **León Carlo Rivera Cárdenas** realizó una sesión de retrospectiva al finalizar el proyecto. A continuación se documentan las observaciones principales.

### Aspectos Positivos

- **La herramienta Kiro aceleró significativamente la generación de documentación y código.** La asistencia de IA permitió mantener un ritmo de documentación progresiva sin sacrificar la calidad del contenido técnico.
- **SonarQube fue invaluable para detectar code smells y mantener la calidad.** El análisis estático continuo proporcionó retroalimentación inmediata sobre la calidad del código en cada Pull Request.
- **El flujo GitFlow con PR reviews forzó disciplina en el proceso de desarrollo.** La revisión obligatoria de código antes del merge garantizó que ningún cambio llegara a la rama principal sin validación.

### Áreas de Mejora

- **La mayor dificultad fue la configuración inicial del entorno** (runner self-hosted, Docker, tokens de GitHub). Los defectos DEF-006, DEF-007 y DEF-008 se originaron en esta fase y consumieron tiempo que podría haberse dedicado a funcionalidad.
- **La densidad de defectos (~0.7/KLOC) superó ligeramente la meta (≤0.5/KLOC).** Aunque aceptable, indica que la validación temprana de compatibilidad del framework podría haber prevenido algunos defectos.

### Valoración General

El equipo considera que el proceso de calidad implementado fue efectivo y proporcionó una experiencia valiosa en la aplicación práctica de estándares de calidad de software (IEEE 730, ISO 25010) en un proyecto real. Las herramientas seleccionadas (Vitest, ESLint, SonarQube, GitHub Actions) demostraron ser adecuadas para el contexto del proyecto y escalables para proyectos de mayor envergadura.

---

## 5. Backlog de Mejoras de Proceso

Las siguientes mejoras fueron identificadas durante la retrospectiva como oportunidades para futuras iteraciones del proyecto o para proyectos similares.

| ID | Mejora | Prioridad | Descripción |
|----|--------|-----------|-------------|
| IMP-001 | Agregar pruebas E2E con Playwright | Media | Automatizar flujos críticos de UI (búsqueda → reservación → confirmación). Complementaría las pruebas unitarias y de integración existentes para cubrir el nivel de pruebas de sistema. |
| IMP-002 | Implementar pruebas de carga con k6 | Media | Validar NFR-01 (latencia <100ms) y NFR-02 (zero overbooking) bajo carga real. Actualmente estas métricas se validan por diseño arquitectónico, no con datos empíricos. |
| IMP-003 | Desplegar en AWS con CDK/CloudFormation | Alta | Materializar la arquitectura diseñada (Aurora + ElastiCache) en infraestructura real. Permitiría validar los escenarios de calidad QA-01 a QA-05 en un entorno productivo. |
| IMP-004 | Agregar DAST con OWASP ZAP | Baja | Complementar el análisis estático (SAST) de SonarQube con análisis dinámico de seguridad. Requiere la aplicación desplegada en un servidor accesible. |
| IMP-005 | Implementar monitoreo con CloudWatch | Media | Métricas de disponibilidad y latencia en producción. Permitiría validar el NFR-06 (disponibilidad ≥99.9%) con datos reales y configurar alertas automáticas. |

### Priorización

| Prioridad | Mejoras | Justificación |
|-----------|---------|---------------|
| **Alta** | IMP-003 | El despliegue en AWS es el paso natural para llevar el MVP a un entorno productivo y validar la arquitectura diseñada. |
| **Media** | IMP-001, IMP-002, IMP-005 | Estas mejoras complementan las pruebas existentes y agregarían niveles de validación que actualmente se cubren por diseño. |
| **Baja** | IMP-004 | El análisis DAST es deseable pero depende de tener la aplicación desplegada, por lo que su prioridad está condicionada a IMP-003. |

---

## 6. Conclusión

La retrospectiva del proyecto ReservFlow permitió identificar lecciones valiosas que se traducen en mejoras concretas para el proceso de desarrollo de software:

- **3 prácticas nuevas** a incorporar (Start): configuración temprana de CI/CD, validación de compatibilidad de frameworks, y estandarización de entornos con Docker.
- **3 prácticas a eliminar** (Stop): uso de `require()` dinámico, push directo a main, y suposiciones sobre validación de URLs.
- **5 prácticas a mantener** (Continue): pipeline CI/CD automatizado, code reviews obligatorios, documentación progresiva, TypeScript estricto, y mocks para pruebas.
- **5 mejoras de proceso** identificadas para futuras iteraciones, priorizadas por impacto y viabilidad.
- **5 actualizaciones al SQP** propuestas para prevenir los defectos encontrados en futuros proyectos.

El ciclo de 8 etapas de calidad del software se cierra con esta retrospectiva, habiendo generado un cuerpo de conocimiento documentado que servirá como referencia para futuros proyectos del equipo y de la materia de Calidad de Software.
