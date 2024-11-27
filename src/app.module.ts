import express from 'express';
import { SongsModule } from './songs/songs.module';

export class AppModule {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeModules();
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
  }

  private initializeModules() {
    const songsModule = new SongsModule();
    this.app.use('/songs', songsModule.getRouter());
  }

  getApp() {
    return this.app;
  }
}