import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { TypeOrmModule } from '@nestjs/typeorm';
import { MapRotation } from '~/maps/entities/maps.entity';
import { Events } from '~/maps/entities/events.entity';
import { BrawlerStats } from '~/brawlers/entities/brawler-stats.entity';
import { Users } from '~/users/entities/users.entity';
import { UserBattles, UserProfile } from '~/users/entities/users.entity';
import {
  UserBrawlers,
  UserBrawlerBattles,
  UserBrawlerItems,
} from '~/users/entities/user-brawlers.entity';
import { UserRecords, UserFriends } from './entities/blossom.entity';
import { Seasons } from '~/seasons/entities/seasons.entity';

import { BlossomController } from './blossom.controller';

import { BlossomService } from './blossom.service';
import { EventsService } from '~/maps/services/events.service';
import { DateService } from '~/utils/date.service';
import { UsersService } from '~/users/services/users.service';
import { UserProfileService } from '~/users/services/user-profile.service';
import { UserBattlesService } from '~/users/services/user-battles.service';
import { SeasonsService } from '~/seasons/seasons.service';

import { ConfigModule, ConfigService } from '@nestjs/config';
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
    AppConfigService,
  ],
})
export class BlossomModule {}
