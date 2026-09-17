// src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { SongsController } from './songs/songs.controller';
import type { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();

// CORS abierto (paridad con la app Express original)
app.use('*', cors());

// Monta las rutas de canciones en /songs
const songsController = new SongsController();
app.route('/songs', songsController.getRouter());

export default app;
