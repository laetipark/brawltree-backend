import { Controller, Get, HttpCode } from '@nestjs/common';
import { BrawlersService } from './brawlers.service';
import { Brawlers } from './entities/brawlers.entity';

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
