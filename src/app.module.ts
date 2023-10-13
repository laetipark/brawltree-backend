import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { BlossomModule } from './blossom/blossom.module';
import { MapsModule } from './maps/maps.module';
import { BrawlersModule } from './brawlers/brawlers.module';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from '~/configs/app-config.service';
import AppConfig from './configs/app.config';
import DatabaseConfig from './configs/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${__dirname}/configs/env/.${process.env.NODE_ENV}.env`,
      load: [AppConfig],
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    BrawlersModule,
    MapsModule,
    UsersModule,
    BlossomModule,
  ],
  controllers: [],
  providers: [AppConfigService],
})
export class AppModule {}
