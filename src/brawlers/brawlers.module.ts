import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { BrawlerStats } from './entities/brawler-stats.entity';
import { Brawlers } from './entities/brawlers.entity';

import { BrawlersController } from './brawlers.controller';
import { BrawlersService } from './brawlers.service';
import { BattleService } from '~/utils/battle.service';
import { AppConfigService } from '~/configs/app-config.service';

@Module({
  imports: [TypeOrmModule.forFeature([Brawlers, BrawlerStats])],
  controllers: [BrawlersController],
  providers: [BrawlersService, BattleService, AppConfigService],
})
export class BrawlersModule {}
