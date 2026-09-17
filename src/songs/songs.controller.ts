// songs.controller.ts
import { createRoute, z } from '@hono/zod-openapi';
import type { OpenAPIHono, RouteHandler } from '@hono/zod-openapi';
import type { Bindings } from '../types';
import { SongsService } from './songs.service';
import { ErrorSchema, IdParamsSchema, MessageSchema, SongCreateSchema, SongSchema } from './song.schema';

type AppEnv = { Bindings: Bindings };

// Rutas con paths completos: se registran directo sobre la app raíz porque el
// documento OpenAPI se genera únicamente desde el registry de esa instancia.
const createSongRoute = createRoute({
  method: 'post',
  path: '/songs',
  tags: ['Songs'],
  summary: 'Create a new song',
  description: 'Creates a song with its paragraphs and chorus.',
  request: {
    body: {
      content: { 'application/json': { schema: SongCreateSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: 'Song created',
      content: { 'application/json': { schema: SongSchema } },
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

const getAllSongsRoute = createRoute({
  method: 'get',
  path: '/songs',
  tags: ['Songs'],
  summary: 'List all songs',
  description: 'Returns every song stored in the database.',
  responses: {
    200: {
      description: 'List of songs',
      content: { 'application/json': { schema: z.array(SongSchema) } },
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

const getSongByIdRoute = createRoute({
  method: 'get',
  path: '/songs/{id}',
  tags: ['Songs'],
  summary: 'Get a song by id',
  description: 'Returns a single song matching the given id.',
  request: {
    params: IdParamsSchema,
  },
  responses: {
    200: {
      description: 'Song found',
      content: { 'application/json': { schema: SongSchema } },
    },
    404: {
      description: 'Song not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

const updateSongRoute = createRoute({
  method: 'put',
  path: '/songs/{id}',
  tags: ['Songs'],
  summary: 'Update a song by id',
  description: 'Partially updates a song matching the given id.',
  request: {
    params: IdParamsSchema,
    body: {
      content: { 'application/json': { schema: SongCreateSchema.partial() } },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Song updated successfully',
      content: { 'application/json': { schema: MessageSchema } },
    },
    404: {
      description: 'Song not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

const deleteSongRoute = createRoute({
  method: 'delete',
  path: '/songs/{id}',
  tags: ['Songs'],
  summary: 'Delete a song by id',
  description: 'Deletes a song matching the given id.',
  request: {
    params: IdParamsSchema,
  },
  responses: {
    200: {
      description: 'Song deleted successfully',
      content: { 'application/json': { schema: MessageSchema } },
    },
    404: {
      description: 'Song not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

export class SongsController {
  // El servicio se construye por petición con el binding D1 del entorno
  private getSongsService(env: Bindings): SongsService {
    return new SongsService(env.DB);
  }

  private createSong: RouteHandler<typeof createSongRoute, AppEnv> = async (c) => {
    try {
      const songData = c.req.valid('json');
      const song = await this.getSongsService(c.env).create(songData);
      return c.json(song, 201);
    } catch (error) {
      return c.json({ error: 'Error creating song ' + String(error) }, 500);
    }
  };

  private getAllSongs: RouteHandler<typeof getAllSongsRoute, AppEnv> = async (c) => {
    try {
      const songs = await this.getSongsService(c.env).findAll();
      return c.json(songs, 200);
    } catch (error) {
      return c.json({ error: 'Error fetching songs: ' + String(error) }, 500);
    }
  };

  private getSongById: RouteHandler<typeof getSongByIdRoute, AppEnv> = async (c) => {
    try {
      const { id } = c.req.valid('param');
      const song = await this.getSongsService(c.env).findOne(id);
      if (song) {
        return c.json(song, 200);
      }
      return c.json({ error: 'Song not found' }, 404);
    } catch (error) {
      return c.json({ error: 'Error fetching song' }, 500);
    }
  };

  private updateSong: RouteHandler<typeof updateSongRoute, AppEnv> = async (c) => {
    try {
      const { id } = c.req.valid('param');
      const songData = c.req.valid('json');
      const updated = await this.getSongsService(c.env).update(id, songData);
      if (updated) {
        return c.json({ message: 'Song updated successfully' }, 200);
      }
      return c.json({ error: 'Song not found' }, 404);
    } catch (error) {
      return c.json({ error: 'Error updating song' }, 500);
    }
  };

  private deleteSong: RouteHandler<typeof deleteSongRoute, AppEnv> = async (c) => {
    try {
      const { id } = c.req.valid('param');
      const deleted = await this.getSongsService(c.env).remove(id);
      if (deleted) {
        return c.json({ message: 'Song deleted successfully' }, 200);
      }
      return c.json({ error: 'Song not found' }, 404);
    } catch (error) {
      return c.json({ error: 'Error deleting song' }, 500);
    }
  };

  // Registra las rutas directamente sobre la app raíz (OpenAPIHono)
  registerRoutes(app: OpenAPIHono<{ Bindings: Bindings }>): void {
    app.openapi(createSongRoute, this.createSong.bind(this));
    app.openapi(getAllSongsRoute, this.getAllSongs.bind(this));
    app.openapi(getSongByIdRoute, this.getSongById.bind(this));
    app.openapi(updateSongRoute, this.updateSong.bind(this));
    app.openapi(deleteSongRoute, this.deleteSong.bind(this));
  }
}
