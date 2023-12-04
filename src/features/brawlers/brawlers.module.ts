import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { BattleStats } from './entities/battle-stats.entity';
import { Brawlers } from './entities/brawlers.entity';

import { BrawlersController } from './brawlers.controller';
import { BrawlersService } from './brawlers.service';
import { UtilsModule } from '~/utils/utils.module';

@Module({
  imports: [TypeOrmModule.forFeature([Brawlers, BattleStats]), UtilsModule],
  controllers: [BrawlersController],
  providers: [BrawlersService],
  exports: [BrawlersService],
})
export class BrawlersModule {}
