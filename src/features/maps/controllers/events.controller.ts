import { Controller, Get } from '@nestjs/common';

import { Maps } from '../entities/maps.entity';
import { Events } from '../entities/events.entity';

import { EventsService } from '../services/events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /** 금일 트로피 리그 맵 목록 조회 */
  @Get('/tl/curr')
  async selectTLDailyEvents(): Promise<Events[]> {
    return this.eventsService.selectRotationTLDaily();
  }

  /** 익일 트로피 리그 맵 목록 조회 */
  @Get('/tl/tomm')
  async selectTLNextEvents(): Promise<Events[]> {
    return this.eventsService.findRotationTLNext();
  }

  /** 파워 리그 맵 목록 조회 */
  @Get('/pl')
  async selectPLEvents(): Promise<Maps[]> {
    return this.eventsService.findRotationPL();
  }
}
