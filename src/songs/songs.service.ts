//songs.services.ts

import { v4 as uuidv4 } from 'uuid';
import { DatabaseModule } from '../database/database.module';
import { ISong, ISongCreate } from './interfaces/song.interface';
import { SongsQueries } from './providers/songs.queries';
import { Pool } from 'pg';

const safeParse = (val: string | unknown) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val; // o null si prefieres
    }
  }
  return val;
}

export class SongsService {
  private db: Pool;

  constructor() {
    this.db = DatabaseModule.getInstance();
  }

  async create(songData: ISongCreate) {
    const id = uuidv4();
    const query = SongsQueries.CREATE;
    const paragraphsString = JSON.stringify(songData.paragraphs ?? null);
    const chorusString = JSON.stringify(songData.chorus ?? null);

    await this.db.query(query, [
      id,
      songData.code,
      songData.title,
      songData.musicalNote,
      paragraphsString,
      chorusString
    ]);

    return { id, ...songData };
  }


  async findAll(): Promise<ISong[]> {
    const result = await this.db.query(SongsQueries.FIND_ALL);
    return result.rows.map((s: any) => ({
      ...s,
      paragraphs: safeParse(s.paragraphs),
      chorus: safeParse(s.chorus),
    }));
  }

  async findOne(id: string): Promise<ISong | null> {
    const result = await this.db.query(SongsQueries.FIND_ONE, [id]);
    const song = result.rows[0];
    return song
      ? {
        ...song,
        paragraphs: safeParse(song.paragraphs),
        chorus: safeParse(song.chorus),
      }
      : null;
  }

  async update(id: string, songData: Partial<ISong>): Promise<boolean> {
    const query = SongsQueries.UPDATE;

    const result = await this.db.query(query, [
      songData.code,
      songData.title,
      songData.musicalNote,
      JSON.stringify(songData.paragraphs ?? null),
      JSON.stringify(songData.chorus ?? null),
      id
    ]);

    return (result.rowCount || 0) > 0;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db.query(SongsQueries.DELETE, [id]);
    return (result.rowCount || 0) > 0;
  }
}