# Quality Criteria: ReservFlow (ISO 25010)

Este documento define la matriz de atributos de calidad y las metas medibles que el sistema ApexReservations debe cumplir para garantizar la excelencia en el producto y el proceso.

## 1. Responsable del Cumplimiento
* **QA Lead**: Encargado de la definición, seguimiento y validación de los criterios de calidad establecidos.

## 2. Metas de Calidad Medibles
Basado en el estándar ISO 25010, se han definido los siguientes umbrales técnicos para el sistema:

* **Disponibilidad**: Debe ser mayor o igual al 99.9% para asegurar que el sistema de reservaciones esté operativo de manera constante.
* **Tiempo de Respuesta UI**: El tiempo de respuesta percibido por el usuario debe ser menor a 2 segundos (P95) para garantizar una experiencia fluida.
* **Cobertura de Pruebas Unitarias**: Se debe mantener una cobertura mínima del 80% en toda la lógica central (Reservation Manager e Inventory Controller).
* **Densidad de Defectos**: La cantidad de defectos detectados en producción debe ser menor o igual a 0.5 por cada mil líneas de código (KLOC).

## 3. Atributos de Calidad Adicionales (Proyecto)
Además de las métricas anteriores, el proyecto se rige por las siguientes restricciones técnicas:

* **Eficiencia de Desempeño**: Validación de disponibilidad de habitaciones en milisegundos mediante el uso de Amazon ElastiCache.
* **Fiabilidad**: El sistema no debe presentar errores de lógica de negocio críticos, tales como el overbooking, en el ambiente de QA.
* **Mantenibilidad**: Uso obligatorio de TypeScript en modo estricto para reducir la deuda técnica y errores en tiempo de ejecución.

## 4. Validación de Criterios
Ninguna funcionalidad será considerada como terminada si no cumple con el gate de QA, el cual verifica que los resultados obtenidos se alinean con las metas de calidad aquí descritas.