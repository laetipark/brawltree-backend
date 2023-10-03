import { Controller, Get, HttpCode } from '@nestjs/common';

import { Brawlers } from './entities/brawlers.entity';

import { BrawlersService } from './brawlers.service';

@Controller('brawler')
export class BrawlersController {
  constructor(private brawlerService: BrawlersService) {}

  @Get()
  @HttpCode(200)
  async selectBrawlers(): Promise<Brawlers[]> {
    return await this.brawlerService.findBrawlers();
  }

  @Get('/stats')
  @HttpCode(200)
  async selectBrawlerStats() {
    return await this.brawlerService.findTotalBrawlerStats();
  }
}
