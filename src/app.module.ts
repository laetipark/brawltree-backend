import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';

import { ConfigModule } from '@nestjs/config';
import GameConfig from './config/app.config';
import DatabaseConfig from './config/database.config';
import { BlossomModule } from './blossom/blossom.module';
import { MapsModule } from './maps/maps.module';
import { BrawlersModule } from './brawlers/brawlers.module';
import { GameConfigService } from './config/gameConfig.service';

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
