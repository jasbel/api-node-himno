import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { ENV } from '../common/config/environment.config';

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
        await this.instance.exec(`
          CREATE TABLE IF NOT EXISTS songs (
            id TEXT PRIMARY KEY,
            num_song TEXT,
            title TEXT,
            description TEXT,
            musicalNote TEXT,
            paragraphs TEXT,
            chorus TEXT
          )
        `);

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