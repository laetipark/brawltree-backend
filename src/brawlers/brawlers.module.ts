import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrawlersController } from './brawlers.controller';
import { BrawlersService } from './brawlers.service';
import { BrawlerStats } from './entities/stats.entity';
import { Brawlers } from './entities/brawlers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Brawlers, BrawlerStats])],
  controllers: [BrawlersController],
  providers: [BrawlersService],
})
export class BrawlersModule {}
