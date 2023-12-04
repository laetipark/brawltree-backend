import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UtilsModule } from '~/utils/utils.module';
import { MapsController } from './controllers/maps.controller';
import { EventsController } from './controllers/events.controller';
import { EventsService } from './services/events.service';
import { MapsService } from './services/maps.service';
import { Maps } from './entities/maps.entity';
import { MapRotation } from '~/maps/entities/map-rotation.entity';
import { Events } from './entities/events.entity';
import { BattleStats } from '~/brawlers/entities/battle-stats.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BattleStats, Maps, MapRotation, Events]),
    UtilsModule,
  ],
  controllers: [MapsController, EventsController],
  providers: [MapsService, EventsService],
  exports: [EventsService],
})
export class MapsModule {}
