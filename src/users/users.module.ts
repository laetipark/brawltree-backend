import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { UserProfile, UserBattles } from './entities/users.entity';
import {
  UserBrawlerBattles,
  UserBrawlerItems,
  UserBrawlers,
} from './entities/userBrawlers.entity';
import { MapRotation, Maps } from '~/maps/entities/maps.entity';
import { Events } from '~/maps/entities/events.entity';
import { Brawlers } from '~/brawlers/entities/brawlers.entity';
import { SeasonsService } from '~/seasons/seasons.service';
import { Seasons } from '~/seasons/seasons.entity';

import { UsersController } from './users.controller';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersService } from './services/users.service';
import { UserProfileService } from './services/userProfile.service';
import { UserBattlesService } from './services/userBattles.service';
import { UserBrawlersService } from './services/userBrawlers.service';
import { EventsService } from '~/maps/services/events.service';
import { DateService } from '~/date/date.service';
import { GameConfigService } from '~/config/gameConfig.service';

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
      Seasons,
      Maps,
      MapRotation,
      Events,
    ]),
  ],
  controllers: [UsersController],
  providers: [
    EventsService,
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
