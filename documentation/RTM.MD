# Análisis de Requerimientos y Especificación de Calidad: ReservFlow

## 1. Definición de Análisis Detallado y Trazabilidad

El análisis detallado es el proceso de descomponer los objetivos de alto nivel establecidos en el Project Charter en requerimientos técnicos específicos, tanto funcionales como no funcionales, para asegurar que la lógica de negocio sea implementable. 

La trazabilidad de requisitos es la capacidad de rastrear un requerimiento a lo largo de todo el ciclo de vida del desarrollo. Esto garantiza que cada funcionalidad implementada tenga un origen justificado en las necesidades del cliente y que cada prueba ejecutada valide un requisito específico, evitando el desarrollo de funciones innecesarias o la omisión de criterios de calidad críticos como la prevención del overbooking.

## 2. Información de la Actividad
* **Actividad**: Análisis detallado y trazabilidad de requisitos.
* **Entregable**: Matriz de trazabilidad de requisitos (RTM).
* **Herramientas de Gestión**: GitHub Projects (Kanban Board) y GitHub Issues.
* **Responsables**: Emilio Daniel Guzmán Seda y León Carlo Rivera Cárdenas.

## 3. Matriz de Trazabilidad de Requisitos (RTM)

La siguiente matriz vincula los requerimientos definidos en el Project Charter con sus correspondientes tareas de implementación y validación dentro del flujo de trabajo de GitHub.

| ID Req. | Descripción del Requerimiento | Prioridad | GitHub Issue (Task) | Método de Validación |
|---------|------------------------------|-----------|----------------------|----------------------|
| FR-01 | Creación de Reservas (fechas y datos) | Alta | #US-01 | Pruebas Unitarias (Vitest) |
| FR-02 | Gestión de Estados (Ciclo de vida) | Media | #US-02 | Pruebas de Integración |
| FR-03 | Validación de Disponibilidad en tiempo real | Crítica | #US-06 | Test de Concurrencia |
| FR-05 | Sincronización Aurora - ElastiCache | Crítica | #US-06 | Monitorización de Latencia |
| NFR-01 | Latencia de Consulta < 100ms | Alta | #PERF-01 | Reporte de Performance (Redis) |
| NFR-02 | Manejo de Alta Concurrencia (Zero-overbooking) | Crítica | #US-06 | Análisis de Race Conditions |
| NFR-03 | Cobertura de Código mínima del 80% | Alta | #QA-01 | Reporte de Vitest/SonarQube |
| NFR-04 | Tipado Estricto con TypeScript | Media | #ARCH-01 | Análisis Estático (ESLint) |
| NFR-05 | Documentación de API OpenAPI/Swagger | Media | #DOC-01 | Auditoría de Endpoints |

## 4. Metodología de Trazabilidad en GitHub

Para mantener la integridad de la trazabilidad sin utilizar herramientas externas como Xray o Helix RM, el equipo aplicará las siguientes normas en el Kanban Board:

1. **Vinculación de Código**: Cada Pull Request debe mencionar el número de Issue correspondiente para trazar el cambio de código con el requerimiento original.
2. **Evidencia de Calidad**: Los resultados del análisis de SonarQube y las pruebas de GitHub Actions se adjuntarán como comentarios en cada Issue antes de su cierre.
3. **Control de QA**: Ningún requerimiento se moverá a la columna "Done" del Kanban sin que la cobertura de código asociada sea verificada como igual o superior al 80%.