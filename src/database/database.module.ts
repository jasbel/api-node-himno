import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { ENV } from '../common/config/environment.config';
import { SongsQueries } from '../songs/providers/songs.queries';

export class DatabaseModule {
  private static instance: any;

  static async connect() {
    if (!this.instance) {
      try {
        this.instance = await open({
          filename: ENV.DATABASE_PATH,
          driver: sqlite3.Database
        });

        // Create songs table if not exists
        await this.instance.exec(SongsQueries.CREATE_TABLE);

        console.log('Connected to the DB');
        return this.instance;
      } catch (err) {
        console.error('Error connecting to SQLite:', err);
        throw err;
      }
    }
    return this.instance;
  }

  static getInstance() {
    return this.instance;
  }
}