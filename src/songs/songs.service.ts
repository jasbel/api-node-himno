// songs.service.ts

import { ISong, ISongCreate } from './song.interface';
import { SongsQueries } from './songs.queries';

// Fila cruda de D1: paragraphs y chorus se almacenan como texto JSON
interface SongRow {
  id: string;
  code: string | null;
  title: string | null;
  'musicalNote': string | null;
  paragraphs: string | null;
  chorus: string | null;
}

// Parse seguro: devuelve el valor original si el parseo falla
const safeParse = (val: unknown): any => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val; // o null si prefieres
    }
  }
  return val;
}

// Serializa a texto JSON para almacenar en columnas TEXT de D1
const safeVerifyParse = (data: unknown) => {
  return JSON.stringify(data ?? null)
}

export class SongsService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async create(songData: ISongCreate) {
    const id = crypto.randomUUID();
    const query = SongsQueries.CREATE;
    const paragraphsString = safeVerifyParse(songData.paragraphs);
    const chorusString = safeVerifyParse(songData.chorus);

    await this.db.prepare(query)
      .bind(
        id,
        songData.code ?? null,
        songData.title ?? null,
        songData.musicalNote ?? null,
        paragraphsString,
        chorusString
      )
      .run();

    return { id, ...songData };
  }


  async findAll(): Promise<ISong[]> {
    const { results } = await this.db.prepare(SongsQueries.FIND_ALL).all<SongRow>();
    return (results ?? []).map((s) => ({
      ...s,
      paragraphs: safeParse(s.paragraphs),
      chorus: safeParse(s.chorus),
    })) as ISong[];
  }

  async findOne(id: string): Promise<ISong | null> {
    const song = await this.db.prepare(SongsQueries.FIND_ONE).bind(id).first<SongRow>();
    return song
      ? ({
        ...song,
        paragraphs: safeParse(song.paragraphs),
        chorus: safeParse(song.chorus),
      } as ISong)
      : null;
  }

  async update(id: string, songData: Partial<ISong>): Promise<boolean> {
    const query = SongsQueries.UPDATE;

    const result = await this.db.prepare(query)
      .bind(
        songData.code ?? null,
        songData.title ?? null,
        songData.musicalNote ?? null,
        JSON.stringify(songData.paragraphs ?? null),
        JSON.stringify(songData.chorus ?? null),
        id
      )
      .run();

    return (result.meta.changes ?? 0) > 0;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db.prepare(SongsQueries.DELETE).bind(id).run();
    return (result.meta.changes ?? 0) > 0;
  }
}
