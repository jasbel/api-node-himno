## ADDED Requirements

> Nota: este change captura el **comportamiento actual** del API de
> `songs` como tests ejecutables. Algunos escenarios reflejan defectos
> conocidos (marcados como `BUG CONGELADO`) que serán corregidos en el
> change `mejorar-comportamiento-songs` (fase ②). Los tests escritos
> hoy contra estos escenarios se actualizarán cuando el fix se aplique.

### Requirement: POST /songs crea una canción

El endpoint `POST /songs` SHALL aceptar un body conforme a
`ISongCreate`, generar un `id` UUID v4, persistir la canción y
responder con status 201 y un body que contenga el `id` generado más
los campos recibidos.

#### Scenario: Creación exitosa con body válido

- **WHEN** se envía `POST /songs` con body conteniendo `code`,
  `title`, `musicalNote` válido (`'C|Do'`), `paragraphs` como array
  de objetos `IParagraph` y `chorus` como array de objetos `IChoir`
- **THEN** se responde con status 201 y body que incluye `id`
  (UUID v4) y los campos enviados

#### Scenario: BUG CONGELADO - Body sin campos requeridos

- **WHEN** se envía `POST /songs` con body vacío o sin `title` y
  `code`
- **THEN** se responde con status 500 porque la base de datos lanza
  error de `NOT NULL` (comportamiento actual; el fix a 400 se
  realiza en la fase ②)

#### Scenario: BUG CONGELADO - musicalNote fuera de TNote

- **WHEN** se envía `POST /songs` con `musicalNote: 'X'` (no listado
  en `TNote`)
- **THEN** se responde con status 201 y la canción se persiste sin
  validación (comportamiento actual; el fix se realiza en la fase ②)

#### Scenario: BUG CONGELADO - paragraphs y chorus faltantes

- **WHEN** se envía `POST /songs` con body sin `paragraphs` o sin
  `chorus`
- **THEN** se responde con status 201 y la canción se persiste con
  `null` en los campos faltantes (comportamiento actual; el fix a
  400 se realiza en la fase ②)

### Requirement: GET /songs lista todas las canciones

El endpoint `GET /songs` SHALL responder con status 200 y un array
JSON con todas las canciones persistidas. Los campos `paragraphs` y
`chorus` deben devolverse parseados desde su representación JSONB a
objeto/array.

#### Scenario: Lista vacía

- **WHEN** se envía `GET /songs` y la tabla `songs` está vacía
- **THEN** se responde con status 200 y body `[]`

#### Scenario: Lista con varias canciones

- **WHEN** se envía `GET /songs` y la tabla `songs` contiene N
  canciones previamente insertadas
- **THEN** se responde con status 200 y body como array de N
  elementos, cada uno con `paragraphs` y `chorus` ya parseados como
  objetos/array

### Requirement: GET /songs/:id obtiene una canción por id

El endpoint `GET /songs/:id` SHALL responder con status 200 y la
canción correspondiente cuando el `id` existe, y status 404 con body
`{error: 'Song not found'}` cuando no existe.

#### Scenario: ID existente

- **WHEN** se envía `GET /songs/<uuid>` donde `<uuid>` corresponde a
  una canción persistida
- **THEN** se responde con status 200 y body con la canción,
  incluyendo `paragraphs` y `chorus` parseados

#### Scenario: ID válido pero inexistente

- **WHEN** se envía `GET /songs/<uuid>` donde `<uuid>` no existe en
  la base de datos
- **THEN** se responde con status 404 y body `{error: 'Song not
  found'}`

#### Scenario: BUG CONGELADO - ID con formato inválido

- **WHEN** se envía `GET /songs/no-es-uuid`
- **THEN** se responde con status 500 porque PostgreSQL lanza error
  de tipo al comparar el `UUID` (comportamiento actual; el fix a
  400 se realiza en la fase ②)

### Requirement: PUT /songs/:id actualiza una canción

El endpoint `PUT /songs/:id` SHALL responder con status 200 y body
`{message: 'Song updated successfully'}` cuando la canción existe y
fue modificada, y status 404 con body `{error: 'Song not found'}` en
caso contrario.

#### Scenario: Actualización exitosa de canción existente

- **WHEN** se envía `PUT /songs/<uuid>` con body completo (`code`,
  `title`, `musicalNote`, `paragraphs`, `chorus`) donde `<uuid>`
  existe
- **THEN** se responde con status 200 y body `{message: 'Song
  updated successfully'}`

#### Scenario: ID inexistente

- **WHEN** se envía `PUT /songs/<uuid>` con body válido donde
  `<uuid>` no existe
- **THEN** se responde con status 404 y body `{error: 'Song not
  found'}`

#### Scenario: BUG CONGELADO - Update parcial sobrescribe con null

- **WHEN** se envía `PUT /songs/<uuid>` con body conteniendo solo
  `{title: 'Nuevo'}` (sin `paragraphs` ni `chorus`)
- **THEN** la canción persistida queda con `paragraphs = null` y
  `chorus = null`, sobrescribiendo los valores previos
  (comportamiento actual; el fix a PATCH semántico se realiza en la
  fase ②)

#### Scenario: BUG CONGELADO - Respuesta no devuelve la canción

- **WHEN** se aplica una actualización exitosa
- **THEN** el body de respuesta es `{message: '...'}` y NO incluye
  la canción actualizada (comportamiento actual; el fix para
  devolver la canción como hace `POST` se realiza en la fase ②)

#### Scenario: BUG CONGELADO - ID con formato inválido

- **WHEN** se envía `PUT /songs/no-es-uuid` con body válido
- **THEN** se responde con status 500 (comportamiento actual; el
  fix a 400 se realiza en la fase ②)

### Requirement: DELETE /songs/:id elimina una canción

El endpoint `DELETE /songs/:id` SHALL responder con status 200 y body
`{message: 'Song deleted successfully'}` cuando la canción existía y
fue eliminada, y status 404 con body `{error: 'Song not found'}` en
caso contrario.

#### Scenario: Eliminación exitosa

- **WHEN** se envía `DELETE /songs/<uuid>` donde `<uuid>` existe
- **THEN** se responde con status 200 y body `{message: 'Song
  deleted successfully'}`, y la canción deja de aparecer en
  `GET /songs`

#### Scenario: ID inexistente

- **WHEN** se envía `DELETE /songs/<uuid>` donde `<uuid>` no existe
- **THEN** se responde con status 404 y body `{error: 'Song not
  found'}`

#### Scenario: BUG CONGELADO - ID con formato inválido

- **WHEN** se envía `DELETE /songs/no-es-uuid`
- **THEN** se responde con status 500 (comportamiento actual; el
  fix a 400 se realiza en la fase ②)

### Requirement: Aislamiento entre tests E2E

Los tests E2E del contrato de `/songs` SHALL ejecutarse sobre una
tabla `songs` vacía al inicio de cada test, independientemente del
orden o resultado de tests previos.

#### Scenario: Test posterior a una creación

- **WHEN** un test previo ha insertado canciones y finaliza
- **THEN** el siguiente test encuentra la tabla vacía tras el
  `beforeEach` que ejecuta `TRUNCATE songs`

### Requirement: Independencia del framework HTTP en tests

Los tests E2E del contrato de `/songs` SHALL invocar el API
exclusivamente a través de `tests/helpers/api.ts`, sin importar
directamente Express niSupertest en los archivos de test.

#### Scenario: Aislamiento del framework

- **WHEN** se inspecciona un archivo `tests/e2e/*.test.ts`
- **THEN** no aparecen imports directos de `supertest` ni de
  `express`; solo se importa el cliente desde
  `tests/helpers/api.ts`
