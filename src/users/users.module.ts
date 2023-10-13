import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { UserProfile, UserBattles } from './entities/users.entity';
import {
  UserBrawlerBattles,
  UserBrawlerItems,
  UserBrawlers,
} from './entities/user-brawlers.entity';
import { MapRotation, Maps } from '~/maps/entities/maps.entity';
import { Events } from '~/maps/entities/events.entity';
import { Brawlers } from '~/brawlers/entities/brawlers.entity';
import { SeasonsService } from '~/seasons/seasons.service';
import { Seasons } from '~/seasons/entities/seasons.entity';

import { UsersController } from './users.controller';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersService } from './services/users.service';
import { UserProfileService } from './services/user-profile.service';
import { UserBattlesService } from './services/user-battles.service';
import { UserBrawlersService } from './services/user-brawlers.service';
import { EventsService } from '~/maps/services/events.service';
import { DateService } from '~/date/date.service';
import { AppConfigService } from '~/configs/app-config.service';

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
    AppConfigService,
  ],
})
export class UsersModule {}
