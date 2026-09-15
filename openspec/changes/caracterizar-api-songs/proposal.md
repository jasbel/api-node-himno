## Why

El proyecto `api-node-himno` no posee tests. Próximamente se migrará la
capa HTTP de Express a Hono y la persistencia de PostgreSQL a SQLite. Sin
una red de pruebas que congele el comportamiento actual, cualquier
diferencia funcional introducida por la migración pasará desapercibida.

Este change corresponde a la **fase ①** de un plan en dos etapas:
caracterizar el comportamiento actual del API como tests ejecutables
antes de tocar nada. Los bugs detectados no se corrigen acá; se
documentan como comportamiento actual y se abordarán en la fase ②
(`mejorar-comportamiento-songs`).

## What Changes

- Se incorpora **Vitest** como runner de tests, con configuración y
  scripts `test`, `test:watch`, `test:coverage`.
- Se introduce una carpeta `tests/` con la estructura:
  - `e2e/`: tests de contrato HTTP de los 5 endpoints de `songs`
    (caracterización estricta, incluye comportamientos defectuosos
    actuales).
  - `unit/`: tests de lógica pura extraída (serializadores).
  - `fixtures/`: builder de canciones válidas para tests.
  - `helpers/`: utilidades de base de datos y cliente HTTP.
- Se **refactoriza el código productivo** de forma mínima para habilitar
  testabilidad (sin alterar comportamiento observable):
  - **BREAKING interno (no de API)**: `SongsService` y `SongsController`
    aceptan dependencias por constructor con defaults
    (`constructor(db?: Pool)`, `constructor(songsService?: SongsService)`).
  - Se extraen `safeParse` y `safeVerifyParse` de
    `src/songs/songs.service.ts` a un módulo
    `src/songs/providers/serializers.ts` para poder testearlas en
    aislamiento.
- Se crea un helper `tests/helpers/api.ts` que abstrae el cliente HTTP.
  Hoy usa `supertest` contra la app Express; cuando se migre a Hono,
  **solo este archivo cambia**, los tests E2E quedan intactos.
- Se documentan como **comportamiento actual congelado** los siguientes
  defectos (a corregir en la fase ②):
  - `GET/PUT/DELETE /songs/:id` con UUID inválido responde **500** en
    lugar de 400.
  - `POST /songs` sin campos requeridos responde **500** (DB lanza
    `NOT NULL`) en lugar de 400.
  - `POST /songs` con `musicalNote` fuera del tipo `TNote` se acepta
    sin validación.
  - `POST /songs` con `paragraphs`/`chorus` faltantes guarda `null`
    silenciosamente.
  - `PUT /songs/:id` sobrescribe con `null` los campos no enviados
    (PATCH semántico roto).
  - `PUT /songs/:id` responde `{message}` sin devolver la canción
    actualizada (inconsistencia con `POST`).

## Capabilities

### New Capabilities

- `testing-infra`: infraestructura de tests (Vitest + helpers + fixtures
  + scripts npm) que da soporte a todos los cambios de prueba del
  proyecto.
- `songs-api-contract`: contrato HTTP observable de los endpoints de
  `songs`, capturado como tests E2E. Documenta el comportamiento actual
  (incluye defectos congelados) y servirá como red de seguridad durante
  la migración a Hono + SQLite.
- `songs-serializers`: lógica pura de serialización de `paragraphs` y
  `chorus` (`safeParse` / `safeVerifyParse`) extraída a módulo propio
  para test unitario aislado.

### Modified Capabilities

_(ninguna — no existen specs previas en `openspec/specs/`)_

## Impact

- **Código productivo afectado**:
  - `src/songs/songs.service.ts`: constructor con `db?` opcional,
    extracción de serializadores, import del nuevo módulo.
  - `src/songs/songs.controller.ts`: constructor con `songsService?`
    opcional.
  - `src/songs/providers/serializers.ts`: nuevo archivo.
- **Dependencias nuevas** (devDependencies):
  - `vitest`, `@vitest/coverage-v8`, `supertest`, `@types/supertest`.
- **Configuración nueva**:
  - `vitest.config.ts` en la raíz del proyecto.
  - Scripts `test`, `test:watch`, `test:coverage` en `package.json`.
  - Variables de entorno para tests (reusan `.env` existente; convención
    documentada en el README).
- **Base de datos**:
  - Los tests E2E requieren una instancia **local de PostgreSQL** ya
    existente (no se incorpora Docker ni testcontainers). Se limpia con
    `TRUNCATE songs` antes de cada test.
- **No se alteran** las respuestas HTTP, status codes ni el esquema de
  la tabla `songs`. Cualquier cambio observable será detectado por los
  propios tests de este change.
