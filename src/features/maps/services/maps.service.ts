import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maps } from '../entities/maps.entity';

import { BattleStats } from '~/brawlers/entities/battle-stats.entity';
import { BattleService } from '~/utils/services/battle.service';

@Injectable()
export class MapsService {
  constructor(
    @InjectRepository(BattleStats)
    private battleStats: Repository<BattleStats>,
    @InjectRepository(Maps)
    private maps: Repository<Maps>,
    private readonly battleService: BattleService,
  ) {}

  async findMapInfo(id: string) {
    return await this.maps
      .createQueryBuilder('m')
      .select('m.id', 'mapID')
      .addSelect('m.name', 'name')
      .addSelect('m.mode', 'mode')
      .addSelect('mr.isTrophyLeague', 'isTrophyLeague')
      .addSelect('mr.isPowerLeague', 'isPowerLeague')
      .leftJoin('m.mapRotation', 'mr')
      .where('m.id = :id', {
        id: id,
      })
      .getRawOne();
  }

  async findMapStats(id: string, type: string, grade: string[]) {
    const matchGrade = this.battleService.setMatchGrade(type, grade);

    return await this.battleStats
      .createQueryBuilder('bs')
      .select('bs.mapID', 'mapID')
      .addSelect('bs.brawlerID', 'brawlerID')
      .addSelect(
        'ROUND(SUM(bs.matchCount) * 100 / SUM(SUM(bs.matchCount)) OVER(), 2)',
        'pickRate',
      )
      .addSelect(
        'ROUND(SUM(bs.victoriesCount) * 100 / (SUM(bs.victoriesCount) + SUM(bs.defeatsCount)), 2)',
        'victoryRate',
      )
      .addSelect('b.name', 'name')
      .leftJoin('bs.brawler', 'b')
      .where('bs.mapID = :id', {
        id: id,
      })
      .andWhere('bs.matchType = :type', {
        type: type,
      })
      .andWhere('bs.matchGrade IN (:grade)', {
        grade: matchGrade,
      })
      .groupBy('bs.brawlerID')
      .addGroupBy('b.name')
      .orderBy('pickRate', 'DESC')
      .addOrderBy('victoryRate', 'DESC')
      .getRawMany();
  }
}
