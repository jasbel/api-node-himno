// src/index.ts
import { cors } from 'hono/cors';
import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { SongsController } from './songs/songs.controller';
import type { Bindings } from './types';

const app = new OpenAPIHono<{ Bindings: Bindings }>();

// CORS abierto (paridad con la app Express original)
app.use('*', cors());

// Registra las rutas de canciones directo sobre la app raíz
// para que queden en su registry de OpenAPI
const songsController = new SongsController();
songsController.registerRoutes(app);

// Documento OpenAPI y UI de referencia (Scalar)
app.doc('/doc', {
  openapi: '3.0.0',
  info: { title: 'Himno API', version: '1.0.0' },
});
app.get('/docs', Scalar({ url: '/doc' }));

export default app;
