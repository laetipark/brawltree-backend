import { Module } from '@nestjs/common';
import { BlossomService } from './blossom.service';
import { BlossomController } from './blossom.controller';
import { Users } from '../users/entities/users.entity';
import { UsersService } from '../users/services/users.service';
import { UserProfileService } from '../users/services/userProfile.service';
import { UserBattlesService } from '../users/services/userBattles.service';
import { SeasonsService } from '../seasons/seasons.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBattles, UserProfile } from '../users/entities/users.entity';
import {
  UserBrawlerBattles,
  UserBrawlerItems,
  UserBrawlers,
} from '../users/entities/userBrawlers.entity';
import { SeasonsEntity } from '../seasons/seasons.entity';
import { BrawlerStats } from '../brawlers/entities/stats.entity';
import { UserRecords, UserFriends } from './blossom.entity';
import { GameConfigService } from '../config/gameConfig.service';
import { DateService } from '../date/date.service';
import { RotationService } from '../maps/services/rotation.service';
import {MapRotation} from "../maps/entities/maps.entity";
import {Events} from "../maps/entities/events.entity";

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
      SeasonsEntity,
    ]),
  ],
  controllers: [BlossomController],
  providers: [
    BlossomService,
    RotationService,
    UsersService,
    UserProfileService,
    UserBattlesService,
    SeasonsService,
    DateService,
    GameConfigService,
  ],
})
export class BlossomModule {}
