import { Controller, Get, Param, Query } from '@nestjs/common';
import { MapsService } from '~/maps/services/maps.service';
import { Events } from '~/maps/entities/events.entity';

@Controller('maps')
export class MapsController {
  constructor(private mapsService: MapsService) {}

  @Get('/:id')
  async selectMap(@Param('id') id: string): Promise<Events> {
    return this.mapsService.findMapInfo(id);
  }

  @Get('/:id/stats')
  async selectMapStats(
    @Param('id') id: string,
    @Query('type') type: string,
    @Query('grade') grade: string[],
  ) {
    return this.mapsService.findMapStats(id, type, grade);
  }
}
