import { AppModule } from './app.module';
import { DatabaseModule } from './database/database.module';
import { ENV } from './common/config/environment.config';

async function bootstrap() {
  // Inicializar base de datos
  await DatabaseModule.connect();

  // Crear aplicación
  const appModule = new AppModule();
  const app = appModule.getApp();

  // Iniciar servidor
  app.listen(ENV.PORT, () => {
    console.log(`Server running on port ${ENV.PORT}`);
  });
}

bootstrap();