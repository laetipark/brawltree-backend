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
      .createQueryBuilder('map')
      .select('map.id', 'mapID')
      .addSelect('map.name', 'mapName')
      .addSelect('map.mode', 'mode')
      .addSelect('mRotation.isTrophyLeague', 'isTrophyLeague')
      .addSelect('mRotation.isPowerLeague', 'isPowerLeague')
      .leftJoin('map.mapRotation', 'mRotation')
      .where('map.id = :id', {
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
      .createQueryBuilder('battleStats')
      .select('battleStats.mapID', 'mapID')
      .addSelect('battleStats.brawlerID', 'brawlerID')
      .addSelect(
        'ROUND(SUM(battleStats.matchCount) * 100 / SUM(SUM(battleStats.matchCount)) OVER(), 2)',
        'pickRate',
      )
      .addSelect(
        'ROUND(SUM(battleStats.victoriesCount) * 100 / (SUM(battleStats.victoriesCount) + SUM(battleStats.defeatsCount)), 2)',
        'victoryRate',
      )
      .addSelect('brawler.name', 'brawlerName')
      .leftJoin('battleStats.brawler', 'brawler')
      .where('battleStats.mapID = :id', {
        id: id,
      })
      .andWhere('battleStats.matchType = :type', {
        type: type,
      })
      .andWhere('battleStats.matchGrade IN (:grade)', {
        grade: matchGrade,
      })
      .groupBy('battleStats.brawlerID')
      .addGroupBy('brawler.name')
      .orderBy('pickRate', 'DESC')
      .addOrderBy('victoryRate', 'DESC')
      .getRawMany();
  }
}
