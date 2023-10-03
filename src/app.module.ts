import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { BlossomModule } from './blossom/blossom.module';
import { MapsModule } from './maps/maps.module';
import { BrawlersModule } from './brawlers/brawlers.module';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@nestjs/config';
import { GameConfigService } from './config/gameConfig.service';
import GameConfig from './config/app.config';
import DatabaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${__dirname}/config/env/.${process.env.NODE_ENV}.env`,
      load: [GameConfig],
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
  providers: [GameConfigService],
})
export class AppModule {}
