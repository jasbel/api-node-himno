## ADDED Requirements

### Requirement: Runner de tests Vitest configurado

El proyecto SHALL disponer de Vitest como runner de tests, instalado
como devDependency, con un archivo `vitest.config.ts` en la raíz que
configure el entorno de Node y la resolución de TypeScript.

#### Scenario: Ejecución de todos los tests

- **WHEN** se ejecuta `npm test`
- **THEN** Vitest corre todos los archivos `*.test.ts` bajo `tests/`
  una vez y termina con código de salida 0 si todos pasan

#### Scenario: Modo watch durante desarrollo

- **WHEN** se ejecuta `npm run test:watch`
- **THEN** Vitest queda en modo observación re-ejecutando solo los
  tests afectados ante cambios en archivos

#### Scenario: Cobertura de código

- **WHEN** se ejecuta `npm run test:coverage`
- **THEN** Vitest genera un reporte de cobertura bajo `coverage/`
  sin fallar por umbral mínimo (sin umbral obligatorio en esta fase)

### Requirement: Helper de base de datos para tests E2E

El proyecto SHALL disponir de un módulo `tests/helpers/db.ts` que
exponga funciones para (a) obtener la conexión existente al Pool de
Postgres vía `DatabaseModule.getInstance()` y (b) limpiar la tabla
`songs` antes de cada test.

#### Scenario: Limpieza entre tests

- **WHEN** se invoca `resetSongsTable()` dentro de un `beforeEach`
- **THEN** la tabla `songs` queda vacía para el test siguiente

#### Scenario: Cierre al final de la suite

- **WHEN** se invoca `closeDb()` dentro de un `afterAll`
- **THEN** el Pool de Postgres se cierra limpiamente permitiendo que
  el proceso de Vitest termine

### Requirement: Cliente HTTP abstraído para tests E2E

El proyecto SHALL disponer de un módulo `tests/helpers/api.ts` que
exponga una función `createApiClient()` que devuelva un cliente
`supertest` vinculado a una instancia fresca de la app Express vía
`AppModule`.

#### Scenario: Construcción del cliente

- **WHEN** se invoca `createApiClient()`
- **THEN** se obtiene un cliente con métodos `.get/.post/.put/.delete`
  que invocan la aplicación Express sin abrir un puerto TCP

#### Scenario: Punto único de adaptación al framework

- **WHEN** en el futuro se migre el framework HTTP (p.ej. a Hono)
- **THEN** únicamente el archivo `tests/helpers/api.ts` necesita ser
  modificado; los archivos de tests E2E permanecen sin cambios

### Requirement: Factory de fixtures para canciones

El proyecto SHALL disponer de un módulo
`tests/fixtures/songs.factory.ts` que exponga una función
`buildSong(overrides?)` que devuelva un objeto válido `ISongCreate`
con valores por defecto razonables, sobrescribible campo por campo.

#### Scenario: Construcción sin overrides

- **WHEN** se invoca `buildSong()`
- **THEN** se devuelve un objeto con todos los campos requeridos de
  `ISongCreate` (`code`, `title`, `musicalNote`, `paragraphs`,
  `chorus`) y tipos válidos

#### Scenario: Construcción con overrides parciales

- **WHEN** se invoca `buildSong({ title: 'Otro' })`
- **THEN** se devuelve un objeto idéntico al default salvo por
  `title`, que es `'Otro'`
