import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';

export class SongsModule {
  private controller: SongsController;

  constructor() {
    this.controller = new SongsController();
  }

  getRouter() {
    return this.controller.getRouter();
  }
}