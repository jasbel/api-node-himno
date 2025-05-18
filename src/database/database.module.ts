import { Pool } from 'pg';
import { ENV } from '../common/config/environment.config';
import { SongsQueries } from '../songs/providers/songs.queries';

export class DatabaseModule {
  private static instance: Pool;

  private constructor() {}

  static getInstance(): Pool {
    if (!DatabaseModule.instance) {
      DatabaseModule.instance = new Pool({
        user: ENV.DB_USER,
        host: ENV.DB_HOST,
        database: ENV.DB_NAME,
        password: ENV.DB_PASS,
        port: Number(ENV.DB_PORT) || 5432,
        ssl: ENV.DB_SSL ? { rejectUnauthorized: false } : undefined,
      });

      DatabaseModule.instance.on('error', (err) => {
        console.error('Unexpected error on idle PostgreSQL client', err);
        process.exit(-1);
      });
    }

    return DatabaseModule.instance;
  }

  static async connect(): Promise<void> {
    const pool = DatabaseModule.getInstance();
    try {
      await pool.query('SELECT 1'); // prueba simple para verificar conexión
      console.log('PostgreSQL connected successfully');
    } catch (error) {
      console.error('Failed to connect to PostgreSQL', error);
      throw error;
    }
  }

  static async initialize() {
    const pool = this.getInstance();
    const createTableSQL = SongsQueries.CREATE_TABLE;
    await pool.query(createTableSQL);
    console.log('Table "songs" ensured.');
  }
}
