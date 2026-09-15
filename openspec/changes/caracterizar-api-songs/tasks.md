## 1. Infraestructura y dependencias

- [ ] 1.1 Instalar como devDependencies: `vitest`, `@vitest/coverage-v8`, `supertest`, `@types/supertest`
- [ ] 1.2 Crear `vitest.config.ts` en la raíz con `environment: 'node'`, alias opcional `@/` → `src/` y `include: ['tests/**/*.test.ts']`
- [ ] 1.3 Agregar scripts en `package.json`: `test`, `test:watch`, `test:coverage`
- [ ] 1.4 Agregar `coverage/` a `.gitignore`
- [ ] 1.5 Verificar que `npm test` corre Vitest y reporta "no tests found" sin romper

## 2. Refactor productivo: extracción de serializers

- [ ] 2.1 Crear `src/songs/providers/serializers.ts` exportando `safeParse` y `safeVerifyParse` con la firma documentada en la spec
- [ ] 2.2 Eliminar las definiciones internas de `safeParse` y `safeVerifyParse` de `src/songs/songs.service.ts`
- [ ] 2.3 Importar ambas funciones en `src/songs/songs.service.ts` desde el nuevo módulo
- [ ] 2.4 Verificar con `npm run build` que la compilación pasa sin errores
- [ ] 2.5 Levantar la API manualmente (`npm run dev`) y confirmar que `POST /songs` y `GET /songs` siguen comportándose igual que antes del refactor

## 3. Refactor productivo: inyección por constructor

- [ ] 3.1 Modificar `SongsService` para aceptar `db: Pool = DatabaseModule.getInstance()` en el constructor
- [ ] 3.2 Modificar `SongsController` para aceptar `songsService: SongsService = new SongsService()` en el constructor
- [ ] 3.3 Verificar con `npm run build` que la compilación pasa sin errores
- [ ] 3.4 Levantar la API manualmente y confirmar comportamiento idéntico al estado previo

## 4. Helpers y fixtures de tests

- [ ] 4.1 Crear `tests/helpers/db.ts` exponiendo `resetSongsTable()` (TRUNCATE) y `closeDb()`
- [ ] 4.2 Crear `tests/helpers/api.ts` exponiendo `createApiClient()` con `supertest` sobre `AppModule.getApp()`
- [ ] 4.3 Crear `tests/fixtures/songs.factory.ts` exponiendo `buildSong(overrides?)` con defaults válidos de `ISongCreate`
- [ ] 4.4 Validar manualmente que los tres helpers importan y ejecutan sin errores

## 5. Tests unitarios de serializers

- [ ] 5.1 Crear `tests/unit/serializers.test.ts`
- [ ] 5.2 Casos `safeParse`: string JSON válido, string JSON inválido, objeto, array
- [ ] 5.3 Casos `safeVerifyParse`: objeto, array, `null`, `undefined`
- [ ] 5.4 Verificar que `npm test tests/unit/serializers.test.ts` pasa

## 6. Tests E2E del contrato HTTP

- [ ] 6.1 Crear `tests/e2e/songs.e2e.test.ts` con `beforeEach` llamando a `resetSongsTable()` y `afterAll` llamando a `closeDb()`
- [ ] 6.2 `POST /songs`: escenario happy path (201 + body con id)
- [ ] 6.3 `POST /songs`: BUG CONGELADO body vacío → 500
- [ ] 6.4 `POST /songs`: BUG CONGELADO `musicalNote` fuera de TNote → 201
- [ ] 6.5 `POST /songs`: BUG CONGELADO sin `paragraphs`/`chorus` → 201 con null persistido
- [ ] 6.6 `GET /songs`: escenario lista vacía → 200 + `[]`
- [ ] 6.7 `GET /songs`: escenario con varias canciones → 200 + array con `paragraphs` y `chorus` parseados
- [ ] 6.8 `GET /songs/:id`: id existente → 200 + canción
- [ ] 6.9 `GET /songs/:id`: id válido inexistente → 404 + `{error: 'Song not found'}`
- [ ] 6.10 `GET /songs/:id`: BUG CONGELADO id inválido → 500
- [ ] 6.11 `PUT /songs/:id`: update exitoso → 200 + `{message}`
- [ ] 6.12 `PUT /songs/:id`: id inexistente → 404
- [ ] 6.13 `PUT /songs/:id`: BUG CONGELADO update parcial sobrescribe con null
- [ ] 6.14 `PUT /songs/:id`: BUG CONGELADO respuesta no devuelve la canción
- [ ] 6.15 `PUT /songs/:id`: BUG CONGELADO id inválido → 500
- [ ] 6.16 `DELETE /songs/:id`: eliminación exitosa → 200 + `{message}` y baja en `GET /songs`
- [ ] 6.17 `DELETE /songs/:id`: id inexistente → 404
- [ ] 6.18 `DELETE /songs/:id`: BUG CONGELADO id inválido → 500
- [ ] 6.19 Verificar que `npm test` pasa todos los tests E2E y unitarios

## 7. Documentación

- [ ] 7.1 Actualizar `README.md` con sección "Tests": prerequisitos (Postgres local configurado según `.env`), comando `npm test`, nota sobre bugs congelados
- [ ] 7.2 Documentar la convención de helper único `tests/helpers/api.ts` como punto de migración a Hono

## 8. Validación final

- [ ] 8.1 Ejecutar `npm test` completo y confirmar pase total
- [ ] 8.2 Ejecutar `npm run build` y confirmar pase total
- [ ] 8.3 Confirmar que el refactor de DI no alteró respuestas HTTP comparando con un `curl` manual pre/post
