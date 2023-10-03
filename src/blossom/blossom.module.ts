import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { TypeOrmModule } from '@nestjs/typeorm';
import { MapRotation } from '~/maps/entities/maps.entity';
import { Events } from '~/maps/entities/events.entity';
import { BrawlerStats } from '~/brawlers/entities/stats.entity';
import { Users } from '~/users/entities/users.entity';
import { UserBattles, UserProfile } from '~/users/entities/users.entity';
import {
  UserBrawlers,
  UserBrawlerBattles,
  UserBrawlerItems,
} from '~/users/entities/userBrawlers.entity';
import { UserRecords, UserFriends } from './blossom.entity';
import { Seasons } from '~/seasons/seasons.entity';

import { BlossomController } from './blossom.controller';

import { BlossomService } from './blossom.service';
import { EventsService } from '~/maps/services/events.service';
import { DateService } from '~/date/date.service';
import { UsersService } from '~/users/services/users.service';
import { UserProfileService } from '~/users/services/userProfile.service';
import { UserBattlesService } from '~/users/services/userBattles.service';
import { SeasonsService } from '~/seasons/seasons.service';

import { ConfigModule, ConfigService } from '@nestjs/config';
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
      BrawlerStats,
      MapRotation,
      Events,
      Users,
      UserProfile,
      UserBattles,
      UserBrawlers,
      UserBrawlerBattles,
      UserBrawlerItems,
      UserRecords,
      UserFriends,
      Seasons,
    ]),
  ],
  controllers: [BlossomController],
  providers: [
    BlossomService,
    EventsService,
    UsersService,
    UserProfileService,
    UserBattlesService,
    SeasonsService,
    DateService,
    GameConfigService,
  ],
})
export class BlossomModule {}
