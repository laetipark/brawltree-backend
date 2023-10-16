import { Controller, Get, HttpCode, Param } from '@nestjs/common';

import { BrawlersService } from './brawlers.service';

@Controller('brawler')
export class BrawlersController {
  constructor(private brawlerService: BrawlersService) {}

  @Get()
  @HttpCode(200)
  async selectBrawlers() {
    return {
      brawlers: await this.brawlerService.getBrawlers(),
      totalStats: await this.brawlerService.getBrawlerTotalStats(),
      stats: await this.brawlerService.getBrawlerStats(),
    };
  }

  @Get('/:id')
  @HttpCode(200)
  async selectBrawler(@Param('id') id: string) {
    return {
      brawler: await this.brawlerService.getBrawler(id),
      status: await this.brawlerService.getBrawlerStatus(id),
    };
  }
}
