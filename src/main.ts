import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['https://brawltree.me', 'http://localhost:3323'],
    methods: 'GET, POST, PATCH',
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true
    })
  );
  const configService = app.get(ConfigService);
  const port = configService.get<number>('HOST_PORT', 3000);
  await app.listen(port);

  return port;
}

bootstrap().then((port) => {
  Logger.log(`🌸 | Plant Brawl Tree at ${port}`);
});
