import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { BrawlerStats } from './entities/stats.entity';
import { Brawlers } from './entities/brawlers.entity';

import { BrawlersController } from './brawlers.controller';
import { BrawlersService } from './brawlers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Brawlers, BrawlerStats])],
  controllers: [BrawlersController],
  providers: [BrawlersService],
})
export class BrawlersModule {}
