import { Controller, Get, Param, Query } from '@nestjs/common';

import { BrawlersService } from './brawlers.service';
import { Brawlers } from './entities/brawlers.entity';

@Controller('brawler')
export class BrawlersController {
  constructor(private readonly brawlerService: BrawlersService) {}

  @Get('/')
  async selectBrawlers() {
    return {
      brawlers: await this.brawlerService.getBrawlers(),
      totalStats: await this.brawlerService.getBrawlerTotalStats(),
      stats: await this.brawlerService.getBrawlerStats(),
    };
  }

  @Get('/random')
  async selectRandomBrawler(
    @Query('rarity') rarity: string,
    @Query('role') role: string,
    @Query('gender') gender: string,
  ): Promise<Brawlers> {
    return await this.brawlerService.getRandomBrawler(rarity, role, gender);
  }

  @Get('/:id/summary')
  async selectBrawlerSummary(@Param('id') id: string) {
    return {
      brawler: await this.brawlerService.getBrawler(id),
      status: await this.brawlerService.getBrawlerStatus(id),
    };
  }
}
