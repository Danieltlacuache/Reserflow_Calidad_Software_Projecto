# Guía de Contribución — ReservFlow

## Estrategia de Branching: GitFlow

Este proyecto utiliza **GitFlow** como estrategia de ramificación para organizar el flujo de desarrollo y garantizar que el código en `main` siempre esté en estado desplegable.

## Ramas Principales

| Rama | Propósito |
|------|-----------|
| `main` | Rama de **producción**. Contiene únicamente código aprobado, probado y desplegable. |
| `develop` | Rama de **integración**. Consolida las features completadas antes de preparar un release. |

## Convenciones de Nombrado de Ramas

| Tipo | Patrón | Origen | Destino | Ejemplo |
|------|--------|--------|---------|---------|
| Feature | `feature/{issue-id}-{descripción}` | `develop` | `develop` | `feature/FR-01-reservation-manager` |
| Release | `release/{versión}` | `develop` | `main` + `develop` | `release/1.0.0` |
| Hotfix | `hotfix/{issue-id}-{descripción}` | `main` | `main` + `develop` | `hotfix/BUG-01-fix-overbooking` |

## Flujo de Trabajo

### 1. Feature (Nueva Funcionalidad)

1. Crear la rama desde `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/{issue-id}-{descripción}
   ```
2. Desarrollar la funcionalidad con commits descriptivos.
3. Abrir un **Pull Request** hacia `develop`.
4. Esperar la aprobación de al menos **1 revisor** y que el pipeline CI pase exitosamente.
5. Hacer merge a `develop`.

### 2. Release (Preparación de Versión)

1. Crear la rama desde `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/{versión}
   ```
2. Realizar ajustes finales (bump de versión, correcciones menores).
3. Abrir un **Pull Request** hacia `main`.
4. Tras la aprobación y merge a `main`, etiquetar la versión:
   ```bash
   git tag -a v{versión} -m "Release {versión}"
   git push origin v{versión}
   ```
5. Hacer merge de la rama release también hacia `develop` para sincronizar los cambios.

### 3. Hotfix (Corrección Urgente en Producción)

1. Crear la rama desde `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/{issue-id}-{descripción}
   ```
2. Aplicar la corrección con pruebas correspondientes.
3. Abrir un **Pull Request** hacia `main`.
4. Tras la aprobación y merge a `main`, hacer merge también hacia `develop`.

## Reglas de Protección de Ramas

| Rama | Requiere PR | Aprobaciones Mínimas | CI Obligatorio | Rama Actualizada |
|------|-------------|----------------------|----------------|------------------|
| `main` | ✅ | 1 | ✅ | ✅ |
| `develop` | ✅ | 1 | ✅ | ✅ |

### Detalle de las Reglas

- **Pull Request obligatorio:** No se permiten pushes directos a `main` ni a `develop`. Todo cambio debe pasar por un PR.
- **Aprobación de revisores:** Al menos 1 miembro del equipo debe aprobar el PR antes del merge.
- **Pipeline CI exitoso:** El pipeline de GitHub Actions (lint, build, test:coverage) debe pasar sin errores.
- **Rama actualizada:** La rama del PR debe estar actualizada con la rama destino antes del merge.

## Proceso de Code Review

1. El autor abre un PR utilizando la **plantilla de Pull Request** (`.github/pull_request_template.md`).
2. Los revisores asignados automáticamente vía **CODEOWNERS** reciben la notificación.
3. El revisor verifica:
   - ✅ Pruebas unitarias agregadas o actualizadas
   - ✅ Linting sin errores (`npm run lint`)
   - ✅ Build exitoso (`npm run build`)
   - ✅ Cobertura de código >= 80% (`npm run test:coverage`)
   - ✅ Documentación actualizada (si aplica)
   - ✅ Sin datos sensibles en el código
   - ✅ Tipos TypeScript correctos (sin `any`)
4. Si el revisor solicita cambios, el merge se bloquea hasta que se resuelvan.
5. Una vez aprobado y con CI verde, se procede al merge.
