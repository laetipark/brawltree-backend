import { Controller, Get, Param, Query } from '@nestjs/common';
import { MapsService } from '../services/maps.service';

@Controller('maps')
export class MapsController {
  constructor(private mapsService: MapsService) {}

  @Get('/:id')
  async selectMap(
    @Param('id') id: string,
    @Query('type') type: string,
    @Query('grade') grade: string[],
  ) {
    return {
      map: await this.mapsService.findMapInfo(id),
      stats: await this.mapsService.findMapStats(id, type, grade),
    };
  }
}
