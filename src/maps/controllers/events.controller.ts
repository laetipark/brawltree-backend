import { Controller, Get } from '@nestjs/common';

import { Maps } from '../entities/maps.entity';
import { Events } from '../entities/events.entity';

import { EventsService } from '../services/events.service';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get('/tl/curr')
  async selectTLDailyEvents(): Promise<Events[]> {
    return this.eventsService.findRotationTLDaily();
  }

  @Get('/tl/tomm')
  async selectTLNextEvents(): Promise<Events[]> {
    return this.eventsService.findRotationTLNext();
  }

  @Get('/pl')
  async selectPLEvents(): Promise<Maps[]> {
    return this.eventsService.findRotationPL();
  }
}
