import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { BattleStats } from './entities/battle-stats.entity';
import {
  BrawlerItems,
  Brawlers,
  BrawlerSkills
} from './entities/brawlers.entity';
import { GameModes } from '~/maps/entities/modes.entity';

import { BrawlersController } from './brawlers.controller';
import { BrawlersService } from './brawlers.service';
import { UtilsModule } from '~/utils/utils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Brawlers,
      BrawlerSkills,
      BrawlerItems,
      BattleStats,
      GameModes
    ]),
    UtilsModule
  ],
  controllers: [BrawlersController],
  providers: [BrawlersService],
  exports: [BrawlersService]
})
export class BrawlersModule {}
