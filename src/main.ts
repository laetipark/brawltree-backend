import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,PUT,PATCH,POST',
    credentials: true,
  });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('HOST_PORT', 3000);
  await app.listen(port);

  return port;
}

bootstrap().then((port) => {
  Logger.log(`🌸 | Plant Brawl Tree at ${port}`);
});
