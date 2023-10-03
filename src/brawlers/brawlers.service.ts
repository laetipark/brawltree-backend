import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brawlers } from './entities/brawlers.entity';
import { BrawlerStats } from './entities/stats.entity';

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
      .select('bs.BRAWLER_ID', 'BRAWLER_ID')
      .addSelect('bs.MATCH_TYP', 'MATCH_TYP')
      .addSelect(
        'SUM(bs.MATCH_CNT) * 100 / SUM(SUM(bs.MATCH_CNT)) OVER(PARTITION BY bs.MATCH_TYP)',
        'MATCH_CNT_RATE',
      )
      .addSelect(
        'SUM(bs.MATCH_CNT_VIC) * 100 / (SUM(bs.MATCH_CNT_VIC) + SUM(bs.MATCH_CNT_DEF))',
        'MATCH_CNT_VIC_RATE',
      )
      .groupBy('bs.BRAWLER_ID')
      .addGroupBy('bs.MATCH_TYP')
      .getRawMany();
  }
}
