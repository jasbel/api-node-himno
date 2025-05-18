import { AppModule } from './app.module';
import { DatabaseModule } from './database/database.module';
import { ENV } from './common/config/environment.config';

async function bootstrap() {
  await DatabaseModule.connect();

  const appModule = new AppModule();
  const app = appModule.getApp();

  app.listen(ENV.PORT, () => {
    console.log(`Server running on port ${ENV.PORT}`);
  });
}

bootstrap();