# ReservFlow (ApexReservations)

Sistema de reservaciones hoteleras de alta concurrencia desarrollado como proyecto de la materia **Calidad de Software** en el ITESO.

## Equipo

- **Emilio Daniel Guzmán Seda** — Lead Developer & QA Engineer
- **León Carlo Rivera Cárdenas** — Lead Developer & QA Engineer
- **Mtra. Sarahí Ochoa Partida** — Stakeholder / Product Owner

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend + API | Next.js 14, React 18, TypeScript Strict, TailwindCSS |
| Base de datos | PostgreSQL 15 (Amazon Aurora compatible) |
| Caché | Redis 7.x (Amazon ElastiCache compatible) |
| Pruebas | Vitest, fast-check |
| Análisis estático | ESLint, SonarQube |
| CI/CD | GitHub Actions (self-hosted runner) |
| Infraestructura local | Docker Compose |
| Contenedorización | Docker (imagen en Docker Hub: `nino200431/reservflow`) |

## Resumen del Proyecto

ReservFlow implementa un sistema de reservaciones con prevención de overbooking mediante transacciones atómicas Redis (WATCH/MULTI/EXEC). El proyecto sigue las **8 etapas del ciclo de calidad del software**, desde la planificación hasta la retroalimentación:

1. **Planificación** — Project Charter, requerimientos FR/NFR, criterios de calidad ISO 25010, plan de calidad IEEE 730, selección de estándares y herramientas.
2. **Análisis de requerimientos** — Matriz de trazabilidad (RTM), modelo de calidad, user stories con NFRs, acta de aprobación con stakeholder.
3. **Diseño del sistema** — Diagramas C4 (Contexto, Contenedores, Componentes), 5 ADRs, 5 escenarios de atributos de calidad, reporte de inspección ISO 25010.
4. **Implementación controlada** — Código fuente con TypeScript estricto, ESLint, GitFlow, PR reviews al 100%, pipeline CI/CD con GitHub Actions, SonarQube, pruebas unitarias (50 tests, >80% cobertura).
5. **Pruebas y verificación** — Plan de pruebas, reporte de 8 defectos detectados y resueltos, matriz de cobertura.
6. **Evaluación y aseguramiento** — Métricas planeadas vs alcanzadas, auditoría interna (95.8% cumplimiento), quality gates en CI/CD.
7. **Entrega** — Informe final de calidad, validación UAT, índice de documentación, justificación de actividades no aplicables.
8. **Retroalimentación** — Lecciones aprendidas (Start/Stop/Continue), backlog de mejoras de proceso.

## Cómo Ejecutar Localmente

```bash
# 1. Clonar el repositorio
git clone https://github.com/Danieltlacuache/Reserflow_Calidad_Software_Projecto.git
cd Reserflow_Calidad_Software_Projecto

# 2. Instalar dependencias
npm install

# 3. Levantar PostgreSQL y Redis con Docker
docker compose -f infra/docker-compose.yml up -d

# 4. Configurar variables de entorno
cp .env.example .env

# 5. Ejecutar en modo desarrollo
npm run dev
```

La app estará disponible en `http://localhost:3000`.

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | Análisis estático con ESLint |
| `npm run test` | Ejecutar pruebas unitarias |
| `npm run test:coverage` | Pruebas con reporte de cobertura |

## Índice de Documentación

Todos los documentos del proyecto se encuentran en la carpeta `documentation/`:

### Punto 1 — Planificación

| Documento | Descripción |
|-----------|-------------|
| [Project_charter.MD](documentation/Project_charter.MD) | Acta de constitución: objetivos, alcance del MVP, criterios de éxito, equipo, recursos, restricciones y riesgos |
| [FR & NFR.MD](documentation/FR%20%26%20NFR.MD) | Requerimientos funcionales (FR-01 a FR-07) y no funcionales (NFR-01 a NFR-08) del sistema |
| [Quality_Criteria.MD](documentation/Quality_Criteria.MD) | Metas de calidad medibles basadas en ISO 25010: disponibilidad, latencia, cobertura, densidad de defectos |
| [IEEE_730_template.MD](documentation/IEEE_730_template.MD) | Plan de aseguramiento de calidad del software (SQP) siguiendo el estándar IEEE 730 |
| [Selection_STM.MD](documentation/Selection_STM.MD) | Selección de estándares de codificación, herramientas (SonarQube, ESLint, Vitest) y métricas de calidad |

### Punto 2 — Análisis de Requerimientos

| Documento | Descripción |
|-----------|-------------|
| [RTM.MD](documentation/RTM.MD) | Matriz de trazabilidad de requisitos: vincula cada FR/NFR con su issue de GitHub y método de validación |
| [Quality_Model.MD](documentation/Quality_Model.MD) | Modelo de calidad ISO 25010 con árbol de atributos y matriz de priorización (Alta/Media/Baja) |
| [Quality_User_Stories.MD](documentation/Quality_User_Stories.MD) | User stories con criterios de aceptación que integran métricas de calidad medibles (NFRs) |
| [Minutes_of_approval.MD](documentation/Minutes_of_approval.MD) | Acta de aprobación formal de requisitos por la stakeholder (Mtra. Sarahí Ochoa Partida) |

### Punto 3 — Diseño del Sistema

| Documento | Descripción |
|-----------|-------------|
| [C4_Model_Diagrams.MD](documentation/C4_Model_Diagrams.MD) | Diagramas arquitectónicos C4: Contexto (Nivel 1), Contenedores (Nivel 2), Componentes (Nivel 3) en Mermaid |
| [ADR_Records.MD](documentation/ADR_Records.MD) | 5 registros de decisiones arquitectónicas: ElastiCache/Redis, Aurora, Next.js+TS, Cache-Aside, estrategia de pruebas |
| [Quality_Attribute_Scenarios.MD](documentation/Quality_Attribute_Scenarios.MD) | 5 escenarios de calidad en formato de 6 partes (Bass, Clements & Kazman) con trazabilidad a NFRs |
| [Design_Inspection_Report.MD](documentation/Design_Inspection_Report.MD) | Reporte de inspección con checklist ISO 25010 (23 ítems), 4 hallazgos y recomendaciones priorizadas |

### Punto 5 — Pruebas y Verificación

| Documento | Descripción |
|-----------|-------------|
| [Test_Plan.MD](documentation/Test_Plan.MD) | Plan de pruebas: niveles aplicados y no aplicados, estrategia, matriz de cobertura, resultados (92.67%) |
| [Defect_Report.MD](documentation/Defect_Report.MD) | Registro de 8 defectos con severidad, prioridad, fase de detección, resolución y análisis de densidad |

### Punto 6 — Evaluación y Aseguramiento

| Documento | Descripción |
|-----------|-------------|
| [Quality_Evaluation_Report.MD](documentation/Quality_Evaluation_Report.MD) | Métricas planeadas vs alcanzadas, métricas de proceso, auditoría interna (24 ítems), quality gates |

### Punto 7 — Entrega

| Documento | Descripción |
|-----------|-------------|
| [Quality_Final_Report.MD](documentation/Quality_Final_Report.MD) | Informe final: UAT con 8 criterios aprobados, métricas finales, índice de documentación, actividades no aplicables |

### Punto 8 — Retroalimentación

| Documento | Descripción |
|-----------|-------------|
| [Lessons_Learned.MD](documentation/Lessons_Learned.MD) | Retrospectiva Start/Stop/Continue, actualizaciones al SQP, retroalimentación del equipo, backlog de 5 mejoras |

## Arquitectura

```
CloudFront → ALB → ECS Fargate (nino200431/reservflow:latest)
                        ↓                    ↓
               RDS Aurora PostgreSQL    ElastiCache Redis
```

Para más detalle, consultar [C4_Model_Diagrams.MD](documentation/C4_Model_Diagrams.MD) y [ADR_Records.MD](documentation/ADR_Records.MD).

## Docker

```bash
# Build local
docker build -t nino200431/reservflow:latest .

# Ejecutar
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/reservflow \
  -e REDIS_URL=redis://host:6379 \
  nino200431/reservflow:latest
```

Imagen disponible en: [Docker Hub — nino200431/reservflow](https://hub.docker.com/r/nino200431/reservflow)
