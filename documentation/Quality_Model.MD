# Identificación y Priorización de Atributos de Calidad: ReservFlow

## 1. Definición del Proceso

La identificación de atributos consiste en determinar qué características del estándar ISO 25010 son aplicables al sistema ApexReservations. La priorización organiza estos atributos según su impacto en los objetivos de negocio, permitiendo al equipo de desarrollo (Emilio Guzmán y León Rivera) enfocar los esfuerzos de QA en los módulos más críticos, como el Inventory Controller.

## 2. Modelo de Calidad (ISO 25010)

Para este proyecto, se ha seleccionado el modelo de calidad de producto de la norma ISO 25010, centrándose en las dimensiones que garantizan la integridad de las reservaciones bajo carga masiva.

## 3. Árbol de Atributos de Calidad

A continuación se presenta el desglose jerárquico de los atributos seleccionados para ReservFlow:

* **Adecuación Funcional**
    * Completitud funcional: CRUD completo de reservaciones.
    * Corrección funcional: Validación precisa de disponibilidad para evitar sobreventas.
* **Eficiencia de Desempeño**
    * Comportamiento temporal: Respuesta de validación mediante ElastiCache en menos de 100ms.
    * Capacidad: Manejo de alta concurrencia de usuarios simultáneos.
* **Fiabilidad**
    * Madurez: Estabilidad del sistema bajo condiciones de carga real.
    * Tolerancia a fallos: Redundancia y alta disponibilidad mediante Amazon Aurora.
* **Mantenibilidad**
    * Modularidad: Separación clara entre Reservation Manager e Inventory Controller.
    * Analizabilidad: Uso de TypeScript estricto y SonarQube para detectar errores.

## 4. Matriz de Priorización de Atributos

La priorización se establece en una escala de Alta (Crítica para el MVP), Media (Importante para la operación) y Baja (Deseable).

| Característica | Atributo | Prioridad | Justificación Técnica |
|----------------|----------|-----------|------------------------|
| Fiabilidad | Integridad de Datos (Zero-overbooking) | Alta | Riesgo crítico de negocio identificado en el Charter. |
| Desempeño | Latencia de consulta (< 100ms) | Alta | Necesario para garantizar fluidez en alta concurrencia. |
| Mantenibilidad | Cobertura de Código (>= 80%) | Alta | Restricción de calidad mandatoria para el fin del proyecto. |
| Fiabilidad | Disponibilidad (>= 99.9%) | Media | Meta de calidad establecida para el servicio en la nube. |
| Mantenibilidad | Tipado Estricto (TypeScript) | Media | Estándar de desarrollo para minimizar bugs en tiempo de ejecución. |
| Desempeño | Tiempo de respuesta UI (< 2s) | Media | Meta de experiencia de usuario definida en los criterios de calidad. |

## 5. Herramientas de Seguimiento

Aunque el plan original sugería Enterprise Architect, el equipo utilizará las siguientes herramientas para el control de estos atributos:
* **GitHub Projects**: Para el seguimiento de tareas vinculadas a los atributos de prioridad Alta.
* **SonarQube**: Para medir automáticamente los atributos de mantenibilidad y analizabilidad.
* **Vitest**: Para validar los atributos de fiabilidad mediante pruebas de estrés y concurrencia.