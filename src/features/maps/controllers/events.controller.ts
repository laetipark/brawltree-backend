import { Controller, Get } from '@nestjs/common';

import { GameMaps } from '../entities/maps.entity';
import { GameEvents } from '../entities/events.entity';

import { EventsService } from '../services/events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /** 금일 트로피 리그 맵 목록 조회 */
  @Get('/tl/curr')
  async selectTLDailyEvents(): Promise<GameEvents[]> {
    return this.eventsService.selectRotationTLDaily();
  }

  /** 익일 트로피 리그 맵 목록 조회 */
  @Get('/tl/tomm')
  async selectTLNextEvents(): Promise<GameEvents[]> {
    return this.eventsService.findRotationTLNext();
  }

  /** 파워 리그 맵 목록 조회 */
  @Get('/pl')
  async selectPLEvents(): Promise<GameMaps[]> {
    return this.eventsService.findRotationPL();
  }
}
