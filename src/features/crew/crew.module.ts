import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeasonsModule } from '~/seasons/seasons.module';
import { UtilsModule } from '~/utils/utils.module';
import { CrewController } from './crew.controller';
import { CrewService } from './crew.service';
import { BattleStats } from '~/brawlers/entities/battle-stats.entity';
import { Users } from '~/users/entities/users.entity';
import { UserBattles } from '~/users/entities/user-battles.entity';
import { UserFriends, UserRecords } from './entities/crew.entity';
import { MapsModule } from '~/maps/maps.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BattleStats,
      Users,
      UserBattles,
      UserRecords,
      UserFriends
    ]),
    MapsModule,
    SeasonsModule,
    UtilsModule
  ],
  controllers: [CrewController],
  providers: [CrewService]
})
export class CrewModule {}
