import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UtilsModule } from '~/utils/utils.module';
import { MapsController } from './controllers/maps.controller';
import { EventsController } from './controllers/events.controller';
import { EventsService } from './services/events.service';
import { MapsService } from './services/maps.service';
import { GameMaps } from './entities/maps.entity';
import { GameMapRotation } from '~/maps/entities/map-rotation.entity';
import { GameEvents } from './entities/events.entity';
import { BattleStats } from '~/brawlers/entities/battle-stats.entity';
import { GameModes } from '~/maps/entities/modes.entity';
import { ModesService } from '~/maps/services/modes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BattleStats,
      GameMaps,
      GameMapRotation,
      GameModes,
      GameEvents,
    ]),
    UtilsModule,
  ],
  controllers: [MapsController, EventsController],
  providers: [MapsService, EventsService, ModesService],
  exports: [EventsService, ModesService],
})
export class MapsModule {}
