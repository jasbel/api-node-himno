# api-himno

API de himnos construida con **Hono** sobre **Cloudflare Workers**, con **Cloudflare D1** (SQLite) como base de datos.

## Requisitos

* Node.js >= 18 (para wrangler)
* Cuenta de Cloudflare (solo necesaria para desplegar)

## Instalación

* clonar repositorio
* ir a la carpeta
* `npm i`

## Desarrollo local

1. Aplicar el esquema y el seed a la base de datos local de D1:

   ```
   npm run db:local
   ```

2. Iniciar el servidor de desarrollo:

   ```
   npm run dev
   ```

La API queda disponible en `http://localhost:8787/songs`.

## Despliegue

1. Iniciar sesión en Cloudflare:

   ```
   npx wrangler login
   ```

2. Crear la base de datos D1:

   ```
   npx wrangler d1 create api-himno-db
   ```

3. Copiar el `database_id` generado en `wrangler.toml` (reemplazar `REPLACE_AFTER_CREATE`).

4. Aplicar el esquema y el seed en remoto:

   ```
   npm run db:remote
   ```

5. Desplegar el Worker:

   ```
   npm run deploy
   ```

## Endpoints

| Método | Ruta | Respuesta |
|--------|------|-----------|
| POST | `/songs` | 201 — `{ id, code, title, musicalNote, paragraphs, chorus }` |
| GET | `/songs` | 200 — lista de canciones (paragraphs y chorus como objetos JSON) |
| GET | `/songs/:id` | 200 — canción, o 404 `{ error: 'Song not found' }` |
| PUT | `/songs/:id` | 200 `{ message: 'Song updated successfully' }`, o 404 |
| DELETE | `/songs/:id` | 200 `{ message: 'Song deleted successfully' }`, o 404 |

### Ejemplo para crear (POST `/songs`)

```json
{
  "code": "0",
  "title": "FUI HECHO JUSTO",
  "musicalNote": "G|Sol",
  "paragraphs": [
    {
      "id": "049c564e-eeea-f894-5a91-1caa805b336c",
      "chorusPos": [["7990fd50-d0b5-b7ab-f402-5fff281110fa"]],
      "paragraph": "Fui hecho justo sin merecerlo..."
    }
  ],
  "chorus": [
    {
      "id": "7990fd50-d0b5-b7ab-f402-5fff281110fa",
      "choir": "Salvación, camino angosto..."
    }
  ]
}
```

## Estructura

```
src/
  index.ts                 # App Hono: cors, montaje de rutas, export default
  types.ts                 # Bindings (DB: D1Database)
  songs/
    songs.controller.ts    # Handlers Hono (5 rutas)
    songs.service.ts       # Lógica de negocio sobre D1
    songs.queries.ts       # Sentencias preparadas D1
    song.interface.ts      # Interfaces de dominio
```
