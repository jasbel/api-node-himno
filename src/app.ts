import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import { constrainedMemory } from 'process';

type ID = string;
type TNote = '_' | 'G|Sol' | 'A|La' | 'C|Do' | 'D|Re' | 'E|Mi' | 'B|Si' | 'F|Fa' | 'F#|Fa#' | 'C/D|Do-Re';

// Interface for Song matches your specification
interface IParagraph {
  id: ID;
  paragraph: string;
  chorusPos: [positionOrId: number | ID, repeat?: number][];
}

interface IChoir {
  id: ID;
  choir: string,
}

interface ISong {
  id: ID,
  code: string,
  title: string,
  musicalNote: TNote | string,
  paragraphs: IParagraph[] | string,
  chorus: IChoir[],
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Database Initialization
let db: any;

async function initializeDatabase() {
  db = await open({
    filename: './songs.db',
    driver: sqlite3.Database
  });

  // Create songs table if not exists
  await db.exec(`
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
}

// Create a new song
app.post('/songs', async (req: Request, res: Response) => {
  try {
    const { 
      num_song, 
      title, 
      description, 
      musicalNote, 
      paragraphs, 
      chorus 
    } = req.body;

    const id = uuidv4();

    const query = `
      INSERT INTO songs 
      (id, num_song, title, description, musicalNote, paragraphs, chorus) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const paragraphsString = JSON.stringify(paragraphs);
    console.log({paragraphsString});

    await db.run(query, [
      id, 
      num_song, 
      title, 
      description, 
      musicalNote, 
      paragraphsString, 
      chorus
    ]);

    res.status(201).json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Error creating song' });
  }
});

// Get all songs
app.get('/songs', async (req: Request, res: Response) => {
  try {
    let songs: ISong[] = await db.all('SELECT * FROM songs');
    songs.forEach((s, i) => {
      const paragraphs = typeof s.paragraphs === 'string' 
      ? JSON.parse(<string>s.paragraphs) 
      : s.paragraphs;
      songs[i].paragraphs = paragraphs;
    });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching songs: ' + error,  });
  }
});

// Get song by ID
app.get('/songs/:id', async (req: Request, res: Response) => {
  try {
    const song = await db.get('SELECT * FROM songs WHERE id = ?', [req.params.id]);
    if (song) {
      res.json(song);
    } else {
      res.status(404).json({ error: 'Song not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching song' });
  }
});

// Update a song
app.put('/songs/:id', async (req: Request, res: Response) => {
  try {
    const { 
      num_song, 
      title, 
      description, 
      musicalNote, 
      paragraphs, 
      chorus 
    } = req.body;

    const query = `
      UPDATE songs 
      SET num_song = ?, title = ?, description = ?, 
          musicalNote = ?, paragraphs = ?, chorus = ? 
      WHERE id = ?
    `;

    const result = await db.run(query, [
      num_song, 
      title, 
      description, 
      musicalNote, 
      paragraphs, 
      chorus, 
      req.params.id
    ]);

    if (result.changes > 0) {
      res.json({ message: 'Song updated successfully' });
    } else {
      res.status(404).json({ error: 'Song not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating song' });
  }
});

// Delete a song
app.delete('/songs/:id', async (req: Request, res: Response) => {
  try {
    const result = await db.run('DELETE FROM songs WHERE id = ?', [req.params.id]);

    if (result.changes > 0) {
      res.json({ message: 'Song deleted successfully' });
    } else {
      res.status(404).json({ error: 'Song not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting song' });
  }
});

// Start server
async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();