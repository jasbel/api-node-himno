// songs.module.ts

import { SongsController } from './songs.controller';

export class SongsModule {
  private controller: SongsController;

  constructor() {
    this.controller = new SongsController();
  }

  getRouter() {
    return this.controller.getRouter();
  }
}