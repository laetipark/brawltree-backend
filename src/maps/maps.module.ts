import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Maps, MapRotation } from './entities/maps.entity';
import { Events } from './entities/events.entity';
import { Brawlers } from '~/brawlers/entities/brawlers.entity';

import { MapsController } from './maps.controller';
import { EventsController } from './events.controller';

import { EventsService } from './services/events.service';
import { AppConfigService } from '~/configs/app-config.service';
import { MapsService } from '~/maps/services/maps.service';
import { BrawlerStats } from '~/brawlers/entities/brawler-stats.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Brawlers,
      BrawlerStats,
      Maps,
      MapRotation,
      Events,
    ]),
  ],
  controllers: [MapsController, EventsController],
  providers: [MapsService, EventsService, AppConfigService],
})
export class MapsModule {}
