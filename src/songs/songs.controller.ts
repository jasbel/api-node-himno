import express, { Request, Response } from 'express';
import { SongsService } from './songs.service';

export class SongsController {
  private router = express.Router();
  private songsService: SongsService;

  constructor() {
    this.songsService = new SongsService();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post('/', this.createSong.bind(this));
    this.router.get('/', this.getAllSongs.bind(this));
    this.router.get('/:id', this.getSongById.bind(this));
    this.router.put('/:id', this.updateSong.bind(this));
    this.router.delete('/:id', this.deleteSong.bind(this));
  }

  async createSong(req: Request, res: Response) {
    try {
      const song = await this.songsService.create(req.body);
      res.status(201).json(song);
    } catch (error) {
      res.status(500).json({ error: 'Error creating song' });
    }
  }

  async getAllSongs(req: Request, res: Response) {
    try {
      const songs = await this.songsService.findAll();
      res.json(songs);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching songs: ' + error });
    }
  }

  async getSongById(req: Request, res: Response) {
    try {
      const song = await this.songsService.findOne(req.params.id);
      if (song) {
        res.json(song);
      } else {
        res.status(404).json({ error: 'Song not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error fetching song' });
    }
  }

  async updateSong(req: Request, res: Response) {
    try {
      const updated = await this.songsService.update(req.params.id, req.body);
      if (updated) {
        res.json({ message: 'Song updated successfully' });
      } else {
        res.status(404).json({ error: 'Song not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error updating song' });
    }
  }

  async deleteSong(req: Request, res: Response) {
    try {
      const deleted = await this.songsService.remove(req.params.id);
      if (deleted) {
        res.json({ message: 'Song deleted successfully' });
      } else {
        res.status(404).json({ error: 'Song not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error deleting song' });
    }
  }

  getRouter() {
    return this.router;
  }
}