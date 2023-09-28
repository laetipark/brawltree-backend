import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';
import { Users } from './entities/users.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserProfile, UserBattles } from './entities/users.entity';
import {
  UserBrawlerBattles,
  UserBrawlerItems,
  UserBrawlers,
} from './entities/userBrawlers.entity';
import { SeasonsService } from '../seasons/seasons.service';
import { SeasonsEntity } from '../seasons/seasons.entity';
import { UserProfileService } from './services/userProfile.service';
import { UserBattlesService } from './services/userBattles.service';
import { DateService } from '../date/date.service';
import { MapRotation, Maps } from '../maps/entities/maps.entity';
import { Events } from '../maps/entities/events.entity';
import { GameConfigService } from '../config/gameConfig.service';
import { UserBrawlersService } from './services/userBrawlers.service';
import { Brawlers } from '../brawlers/entities/brawlers.entity';
import { RotationService } from '../maps/services/rotation.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get<string>('axios.baseURL'),
        headers: configService.get<any>('axios.headers'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      Brawlers,
      Users,
      UserProfile,
      UserBattles,
      UserBrawlers,
      UserBrawlerBattles,
      UserBrawlerItems,
      SeasonsEntity,
      Maps,
      MapRotation,
      Events,
    ]),
  ],
  controllers: [UsersController],
  providers: [
    RotationService,
    UsersService,
    UserProfileService,
    UserBattlesService,
    UserBrawlersService,
    DateService,
    SeasonsService,
    GameConfigService,
  ],
})
export class UsersModule {}
