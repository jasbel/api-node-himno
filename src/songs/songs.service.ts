import { v4 as uuidv4 } from 'uuid';
import { DatabaseModule } from '../database/database.module';
import { ISong } from './interfaces/song.interface';
import { SongsQueries } from './providers/songs.queries';

export class SongsService {
  private db: any;

  constructor() {
    DatabaseModule.connect().then(db => {
      this.db = db;
    });
  }

  async create(songData: ISong) {
    const id = uuidv4();
    const query = SongsQueries.CREATE;

    const paragraphsString = JSON.stringify(songData.paragraphs);

    await this.db.run(query, [
      id,
      songData.num_song,
      songData.title,
      songData.description,
      songData.musicalNote,
      paragraphsString,
      songData.chorus
    ]);

    return { id, ...songData };
  }

  async findAll(): Promise<ISong[]> {
    let songs: ISong[] = await this.db.all(SongsQueries.FIND_ALL);
    return songs.map(s => ({
      ...s,
      paragraphs: typeof s.paragraphs === 'string'
        ? JSON.parse(s.paragraphs)
        : s.paragraphs
    }));
  }

  async findOne(id: string): Promise<ISong | null> {
    const song = await this.db.get(SongsQueries.FIND_ONE, [id]);
    return song ? {
      ...song,
      paragraphs: typeof song.paragraphs === 'string'
        ? JSON.parse(song.paragraphs)
        : song.paragraphs
    } : null;
  }

  async update(id: string, songData: Partial<ISong>) {
    const query = SongsQueries.UPDATE;

    const result = await this.db.run(query, [
      songData.num_song,
      songData.title,
      songData.description,
      songData.musicalNote,
      JSON.stringify(songData.paragraphs),
      songData.chorus,
      id
    ]);

    return result.changes > 0;
  }

  async remove(id: string) {
    const result = await this.db.run(SongsQueries.DELETE, [id]);
    return result.changes > 0;
  }
}