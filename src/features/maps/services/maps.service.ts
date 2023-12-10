import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maps } from '../entities/maps.entity';

import { BattleStats } from '~/brawlers/entities/battle-stats.entity';
import { BattleService } from '~/utils/services/battle.service';
import { SelectMapDto, SelectMapStatsDto } from '~/maps/dto/select-map.dto';

@Injectable()
export class MapsService {
  constructor(
    @InjectRepository(BattleStats)
    private readonly battleStats: Repository<BattleStats>,
    @InjectRepository(Maps)
    private readonly maps: Repository<Maps>,
    private readonly battleService: BattleService,
  ) {}

  /** 맵 ID에 대한 맵 정보 반환
   * @param id 맵 ID */
  async selectMap(id: string): Promise<SelectMapDto> {
    return await this.maps
      .createQueryBuilder('m')
      .select('m.id', 'mapID')
      .addSelect('m.name', 'mapName')
      .addSelect('m.mode', 'mode')
      .addSelect('mr.isTrophyLeague', 'isTrophyLeague')
      .addSelect('mr.isPowerLeague', 'isPowerLeague')
      .leftJoin('m.mapRotation', 'mr')
      .where('m.id = :id', {
        id: id,
      })
      .getRawOne();
  }

  /** 맵 ID에 대한 전투 통계 반환
   * @param id 맵 ID
   * @param type 전투 타입
   * @param grade 전투 등급 */
  async selectMapStats(
    id: string,
    type: string,
    grade: string[],
  ): Promise<SelectMapStatsDto[]> {
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
      .addSelect('b.name', 'brawlerName')
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
