import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brawlers } from './entities/brawlers.entity';
import { BrawlerStats } from './entities/brawler-stats.entity';

@Injectable()
export class BrawlersService {
  constructor(
    @InjectRepository(Brawlers)
    private brawlers: Repository<Brawlers>,
    @InjectRepository(BrawlerStats)
    private brawlerStats: Repository<BrawlerStats>,
  ) {}

  async findBrawlers(): Promise<Brawlers[]> {
    return await this.brawlers.find({});
  }

  async findTotalBrawlerStats() {
    return await this.brawlerStats
      .createQueryBuilder('bs')
      .select('bs.brawlerID', 'brawlerID')
      .addSelect('bs.matchType', 'matchType')
      .addSelect(
        'SUM(bs.matchCount) * 100 / SUM(SUM(bs.matchCount)) OVER(PARTITION BY bs.matchType)',
        'pickRate',
      )
      .addSelect(
        'SUM(bs.victoryCount) * 100 / (SUM(bs.victoryCount) + SUM(bs.defeatCount))',
        'victoryRate',
      )
      .groupBy('bs.brawlerID')
      .addGroupBy('bs.matchType')
      .getRawMany();
  }
}
