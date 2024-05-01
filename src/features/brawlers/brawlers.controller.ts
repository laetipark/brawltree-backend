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
      stats: await this.brawlerService.getBrawlerStats(),
      maps: await this.brawlerService.getBrawlerMaps(),
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

  @Get('/summary')
  async selectMain() {
    const [brawlersTrophy, brawlersRanked] =
      await this.brawlerService.selectBrawlerSummary();

    return {
      brawlersTrophy: brawlersTrophy,
      brawlersRanked: brawlersRanked,
    };
  }

  @Get('/:id/info')
  async selectBrawlerSummary(@Param('id') id: string) {
    return {
      info: await this.brawlerService.getBrawler(id),
      items: await this.brawlerService.getBrawlerItems(id),
    };
  }
}
