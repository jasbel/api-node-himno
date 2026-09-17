// songs.controller.ts
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Bindings } from '../types';
import { SongsService } from './songs.service';
import type { ISong, ISongCreate } from './song.interface';

type AppContext = Context<{ Bindings: Bindings }>;

export class SongsController {
  private router: Hono<{ Bindings: Bindings }>;

  constructor() {
    this.router = new Hono<{ Bindings: Bindings }>();
    this.initRoutes();
  }

  // El servicio se construye por petición con el binding D1 del entorno
  private getSongsService(env: Bindings): SongsService {
    return new SongsService(env.DB);
  }

  private initRoutes() {
    this.router.post('/', this.createSong.bind(this));
    this.router.get('/', this.getAllSongs.bind(this));
    this.router.get('/:id', this.getSongById.bind(this));
    this.router.put('/:id', this.updateSong.bind(this));
    this.router.delete('/:id', this.deleteSong.bind(this));
  }

  async createSong(c: AppContext) {
    try {
      const songData = await c.req.json<ISongCreate>();
      const song = await this.getSongsService(c.env).create(songData);
      return c.json(song, 201);
    } catch (error) {
      return c.json({ error: 'Error creating song ' + String(error) }, 500);
    }
  }

  async getAllSongs(c: AppContext) {
    try {
      const songs = await this.getSongsService(c.env).findAll();
      return c.json(songs);
    } catch (error) {
      return c.json({ error: 'Error fetching songs: ' + String(error) }, 500);
    }
  }

  async getSongById(c: AppContext) {
    try {
      const song = await this.getSongsService(c.env).findOne(c.req.param('id') as string);
      if (song) {
        return c.json(song);
      }
      return c.json({ error: 'Song not found' }, 404);
    } catch (error) {
      return c.json({ error: 'Error fetching song' }, 500);
    }
  }

  async updateSong(c: AppContext) {
    try {
      const songData = await c.req.json<Partial<ISong>>();
      const updated = await this.getSongsService(c.env).update(c.req.param('id') as string, songData);
      if (updated) {
        return c.json({ message: 'Song updated successfully' });
      }
      return c.json({ error: 'Song not found' }, 404);
    } catch (error) {
      return c.json({ error: 'Error updating song' }, 500);
    }
  }

  async deleteSong(c: AppContext) {
    try {
      const deleted = await this.getSongsService(c.env).remove(c.req.param('id') as string);
      if (deleted) {
        return c.json({ message: 'Song deleted successfully' });
      }
      return c.json({ error: 'Song not found' }, 404);
    } catch (error) {
      return c.json({ error: 'Error deleting song' }, 500);
    }
  }

  getRouter() {
    return this.router;
  }
}
