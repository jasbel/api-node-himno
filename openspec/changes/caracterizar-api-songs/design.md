## Context

El proyecto `api-node-himno` es una API REST construida con Express 4,
TypeScript y PostgreSQL (driver `pg`). La arquitectura sigue un patrón
módulo/controller/service inspirado en NestJS pero sin framework de
inversión de dependencias.

Estado actual del código relevante:

- `src/songs/songs.controller.ts`: 5 endpoints REST
  (`POST/GET/GET:id/PUT:id/DELETE:id` sobre `/songs`).
- `src/songs/songs.service.ts`: instanciación directa de `Pool` vía
  `DatabaseModule.getInstance()` en el constructor. Lógica de
  serialización de `paragraphs` y `chorus` embebida en el servicio.
- `src/songs/songs.controller.ts`: instanciación directa de
  `SongsService` en el constructor.
- `src/database/database.module.ts`: singleton con `Pool` de `pg`.

**Obstáculo para testear**: las dependencias se crean dentro de los
constructores. No hay forma de inyectar un doble de `Pool` o
`SongsService` para tests aislados.

**Próxima migración** (fuera del alcance de este change): Express →
Hono y PostgreSQL → SQLite. La red de tests que aquí se introduce debe
sobrevivir ambos saltos con cambios mínimos (idealmente solo en
`tests/helpers/api.ts`).

## Goals / Non-Goals

**Goals:**

- Disponer de un runner de tests (Vitest) configurado y ejecutable
  mediante `npm test` sin pasos manuales extra.
- Tener un set de tests E2E que cubra el contrato HTTP observable
  actual de `/songs` (5 endpoints × happy path + casos borde),
  incluyendo los defectos conocidos congelados como comportamiento.
- Refactor mínimo del código productivo para habilitar testabilidad
  sin alterar las respuestas HTTP observables hoy producidas.
- Aislar la lógica de serialización (`safeParse`, `safeVerifyParse`)
  para test unitario directo.
- Abstraer el cliente HTTP en `tests/helpers/api.ts` para que la
  futura migración a Hono no requiera tocar los tests E2E.

**Non-Goals:**

- **No** corregir los bugs de comportamiento detectados (caso UUID
  inválido, validación de `TNote`, PUT parcial, etc.). Esos son
  materia del change `mejorar-comportamiento-songs` (fase ②).
- **No** migrar a Hono ni a SQLite en este change.
- **No** introducir Docker ni testcontainers. Se asume una instancia
  local de PostgreSQL ya configurada.
- **No** añadir medición de cobertura como bloqueante; los scripts
  quedarán disponibles pero sin umbral obligatorio en esta fase.
- **No** modificar el esquema de la tabla `songs` ni el shape de las
  respuestas HTTP.

## Decisions

### Decisión 1: Vitest como runner

**Elección:** Vitest (no Jest, no Node:test).

**Por qué:**
- Soporte nativo para ESM (el proyecto usa `"type": "module"` y
  `tsx` para ejecutar). Jest requiere configuración extra para ESM.
- Reutiliza la configuración de TypeScript existente sin pasos
  adicionales.
- API compatible con Jest, por lo que la curva de adopción es mínima.
- Velocidad de arranque y watch mode superiores.

**Alternativas descartadas:**
- Jest: requiere babel/ts-jest o configuración ESM experimental.
- Node:test: API más verbose y menos ecosistema para supertest+TS.

### Decisión 2: Refactor de DI por constructor con default

**Elección:** Modificar los constructores así:

```ts
// SongsService
constructor(db: Pool = DatabaseModule.getInstance()) {
  this.db = db;
}

// SongsController
constructor(songsService: SongsService = new SongsService()) {
  this.songsService = songsService;
  this.initRoutes();
}
```

**Por qué:**
- Cambio mínimo, sin introducir un contenedor de DI.
- No altera ningún consumidor existente (sigue funcionando `new
  SongsController()` sin argumentos).
- Habilita inyección de mocks para tests unitarios futuros.

**Alternativas descartadas:**
- Setter methods (`setDb(db)`): muta estado en runtime, peor
  semántica que el default de constructor.
- Contenedor de DI completo (typedi, tsyringe): overkill para un
  proyecto de un solo módulo.
- Import mock vía `vi.mock('...')`: tests quedan acoplados a la
  estructura interna de módulos.

### Decisión 3: Extracción de serializers a módulo propio

**Elección:** Mover `safeParse` y `safeVerifyParse` de
`songs.service.ts` a `src/songs/providers/serializers.ts`, exportadas
como funciones puras.

**Por qué:**
- Permite test unitario directo de las dos funciones más frágiles
  del dominio (manejo de JSONB).
- Aisla la lógica que **sobrevivirá** a la migración a SQLite
  (parseo de JSON desde un string persistido como TEXT).
- Reduce el tamaño y la complejidad de `songs.service.ts`.

### Decisión 4: Helper `tests/helpers/api.ts` con `supertest`

**Elección:**

```ts
// tests/helpers/api.ts
import request from 'supertest';
import { AppModule } from '../../src/app.module';

export function createApiClient() {
  const app = new AppModule().getApp();
  return request(app);
}
```

**Por qué:**
- `supertest` funciona con Express sin levantar un puerto real:
  invoca el middleware chain en proceso.
- Concentra el único punto de fricción con el framework HTTP.
  Cuando se migre a Hono, este archivo pasa a usar
  `app.request('...')` de Hono (o su adapter `@hono/node-server`
  para mantener `supertest`). Los tests E2E no se tocan.

**Alternativas descartadas:**
- `fetch` contra un servidor levantado en puerto aleatorio: más
  portátil pero más lento y más complejo de configurar en CI.
- Tests de contrato como archivos `.http` o esquema OpenAPI:
  overhead alto para 5 endpoints.

### Decisión 5: Limpieza de DB con `TRUNCATE` en `beforeEach`

**Elección:** Los tests E2E usan la misma conexión `Pool` que la app
(vía `DatabaseModule.getInstance()`) y ejecutan `TRUNCATE songs
RESTART IDENTITY CASCADE` antes de cada test.

**Por qué:**
- Garantiza aislamiento entre tests sin introducir transacciones
  por test (que requerirían mayor refactor).
- Funciona con Postgres local existente.

**Alternativas descartadas:**
- Transacción por test con rollback: requeriría que el servicio
  aceptara un cliente transaccional. Cambio mayor fuera de scope.
- DB por test con schema efímero: overhead innecesario para 5
  endpoints.

### Decisión 6: Filosofía de caracterización estricta

**Elección:** Los tests E2E describen el comportamiento actual,
**incluyendo los bugs conocidos**. Cada defecto se documenta con un
test cuya aserción refleja lo que hace la API hoy.

**Por qué:**
- El objetivo del change es ser red de seguridad ante migración.
- SQLite no tiene tipo UUID estricto ni JSONB. Si tras migrar un
  caso borde cambia de status code o shape, queremos detectarlo
  explícitamente.
- Los tests "en rojo" para comportamiento buggy servirán como
  ancla en la fase ②: cuando se aplique el fix, el test cambia su
  aserción esperada de 500 → 400, etc.

**Trade-off aceptado:** En fase ② algunos tests se reescribirán.
Eso es esperado y deseado.

## Risks / Trade-offs

- **Riesgo: Tests E2E dependen de Postgres local disponible.**
  - _Mitigación:_ Documentar prerequisitos en el README. El script
    `test` falla rápido con mensaje claro si no hay conexión.

- **Riesgo: El refactor de constructores puede romper
  comportamiento si los defaults se evalúan de forma inesperada.**
  - _Mitigación:_ Los defaults son llamadas puras; el patrón es
    estándar en TypeScript. Los propios tests E2E son la red de
    seguridad: si algo cambia, los tests caracterización fallan
    antes del commit.

- **Riesgo: `supertest` puede no migrar 1:1 a Hono.**
  - _Mitigación:_ Hono expone `app.request()` y existe
    `@hono/node-server` compatible con `supertest`. La abstracción
    sigue siendo válida.

- **Riesgo: Tests lentos si el set E2E crece.**
  - _Mitigación:_ Fuera de scope en esta fase. Vitest corre en
    paralelo por archivo por defecto.

- **Trade-off: Cobertura de casos de error de red/conexión DB no
  se cubre.**
  - _Aceptado:_ No aporta a la meta de "no romper comportamiento
    en migración".

## Migration Plan

1. Instalar dependencias (`vitest`, `@vitest/coverage-v8`,
   `supertest`, `@types/supertest`).
2. Crear `vitest.config.ts` y agregar scripts en `package.json`.
3. Refactor productivo (DI + serializers) — verificar con
   `npm run build` y arranque manual de la API.
4. Crear helpers (`db.ts`, `api.ts`) y factory de fixtures.
5. Escribir tests E2E endpoint por endpoint.
6. Escribir tests unit de serializers.
7. Documentar prerequisitos en README (Postgres local, variables
   de entorno, comando de ejecución).

**Rollback:** Todos los cambios de este change son aditivos o
refactors internos sin cambio de comportamiento observable. Revertir
el commit / branch restaura el estado previo sin migración de datos
ni ajustes operativos.

## Open Questions

- ¿Conviene separar variables de entorno para tests (`.env.test`) o
  reusar `.env` existente? **Decisión tentativa:** reusar `.env`.
  Si más adelante se quiere aislar DB de test, se introduce
  `.env.test`.
- ¿Cobertura mínima obligatoria desde el inicio?
  **Decisión tentativa:** no, sin umbral en esta fase. Se evalúa
  tras la migración.
