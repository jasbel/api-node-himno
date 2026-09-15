## ADDED Requirements

### Requirement: Serializador safeParse

El módulo `src/songs/providers/serializers.ts` SHALL exportar una
función `safeParse(val)` que, si `val` es string, intente
`JSON.parse`; si el parseo falla, devuelva el string original sin
lanzar; y si `val` no es string, lo devuelva sin modificar.

#### Scenario: String JSON válido

- **WHEN** se invoca `safeParse('{"a":1}')`
- **THEN** se devuelve el objeto `{ a: 1 }`

#### Scenario: String JSON inválido

- **WHEN** se invoca `safeParse('no-es-json')`
- **THEN** se devuelve el string `'no-es-json'` sin lanzar error

#### Scenario: Valor no string (objeto)

- **WHEN** se invoca `safeParse({ a: 1 })`
- **THEN** se devuelve el mismo objeto `{ a: 1 }` sin intentar
  parsear

#### Scenario: Valor no string (array)

- **WHEN** se invoca `safeParse([1, 2, 3])`
- **THEN** se devuelve el mismo array `[1, 2, 3]`

### Requirement: Serializador safeVerifyParse

El módulo `src/songs/providers/serializers.ts` SHALL exportar una
función `safeVerifyParse(data)` que devuelva `JSON.stringify(data)`
cuando `data` no sea `null`/`undefined`, y `JSON.stringify(null)`
(`'null'`) cuando lo sea.

#### Scenario: Objeto serializable

- **WHEN** se invoca `safeVerifyParse({ a: 1 })`
- **THEN** se devuelve el string `'{"a":1}'`

#### Scenario: Array serializable

- **WHEN** se invoca `safeVerifyParse([1, 2, 3])`
- **THEN** se devuelve el string `'[1,2,3]'`

#### Scenario: Valor nulo

- **WHEN** se invoca `safeVerifyParse(null)`
- **THEN** se devuelve el string `'null'`

#### Scenario: Valor undefined

- **WHEN** se invoca `safeVerifyParse(undefined)`
- **THEN** se devuelve el string `'null'`

### Requirement: Reutilización por SongsService

El `SongsService` SHALL importar y utilizar `safeParse` y
`safeVerifyParse` desde `src/songs/providers/serializers.ts` en lugar
de definir estas funciones internamente. Su comportamiento observable
no debe cambiar respecto al estado previo al refactor.

#### Scenario: Comportamiento preservado en create

- **WHEN** se llama a `SongsService.create(songData)` con
  `paragraphs` y `chorus` como objetos
- **THEN** estos se persisten serializados con
  `safeVerifyParse`, equivalente a la implementación anterior

#### Scenario: Comportamiento preservado en findAll

- **WHEN** se llama a `SongsService.findAll()`
- **THEN** los campos `paragraphs` y `chorus` de cada canción se
  devuelven parseados con `safeParse`, equivalente a la
  implementación anterior
