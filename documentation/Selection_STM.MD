# Selección de Estándares, Herramientas y Métricas: ReservFlow

Este documento detalla los lineamientos técnicos, el stack tecnológico y las métricas de control de calidad establecidos para el proyecto ApexReservations.

## 1. Responsables
* **Arquitecto y QA Lead**: Emilio Daniel Guzmán S.
* **Arquitecto y QA Lead**: León Carlo Rivera Cárdenas.

## 2. Estándares de Codificación (Coding Style)
* **TypeScript Estricto**: Uso mandatorio de TypeScript en modo estricto para minimizar errores en tiempo de ejecución y asegurar la robustez del código.
* **ESLint**: Implementación de reglas de análisis estático para mantener la consistencia del estilo de programación y detectar patrones problemáticos de forma temprana.
* **Documentación de API**: Todos los endpoints deben estar documentados bajo el estándar OpenAPI/Swagger para garantizar la transparencia y facilidad de integración.

## 3. Estándares de Arquitectura
* **Alta Disponibilidad**: Uso de Amazon Aurora (PostgreSQL compatible) para la persistencia de datos, asegurando redundancia y tolerancia a fallos.
* **Gestión de Concurrencia**: Empleo de Amazon ElastiCache for Redis para la gestión de inventario en tiempo real y prevención de sobreventas.
* **Seguridad y Entornos**: Configuración de infraestructura mediante variables de entorno para garantizar el aislamiento entre los ambientes local, QA y producción.

## 4. Stack de Herramientas
* **SonarQube**: Plataforma para la inspección continua de la calidad del código, detección de bugs y evaluación de deuda técnica.
* **ESLint**: Herramienta de linting integrada para la validación de estándares de codificación en el flujo de desarrollo.
* **Checkmarx**: Herramienta de análisis estático de seguridad (SAST) para identificar vulnerabilidades críticas en el código fuente.
* **GitHub Actions**: Orquestador de integración y despliegue continuo (CI/CD) para la ejecución automatizada de pruebas y gates de calidad.
* **Vitest / Jest**: Frameworks seleccionados para la ejecución de pruebas unitarias y reportes de cobertura.

## 5. Métricas de Calidad
* **Cobertura de Código**: Se debe alcanzar y mantener un mínimo del 80% de code coverage en la lógica de negocio central.
* **Disponibilidad del Sistema**: Meta establecida en un valor mayor o igual al 99.9%.
* **Rendimiento UI**: El tiempo de respuesta en la interfaz de usuario debe ser menor a 2 segundos (P95).
* **Densidad de Defectos**: El límite máximo permitido es de 0.5 defectos por cada mil líneas de código (KLOC) en el ambiente de producción.