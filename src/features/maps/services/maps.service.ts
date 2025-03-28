import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameMaps } from '~/maps/entities/maps.entity';

import { BattleStats } from '~/brawlers/entities/battle-stats.entity';
import { BattleService } from '~/utils/services/battle.service';
import { SelectMapDto, SelectMapStatsDto } from '~/maps/dto/select-map.dto';

@Injectable()
export class MapsService {
  constructor(
    @InjectRepository(BattleStats)
    private readonly battleStats: Repository<BattleStats>,
    @InjectRepository(GameMaps)
    private readonly maps: Repository<GameMaps>,
    private readonly battleService: BattleService
  ) {}

  /** 맵 ID에 대한 맵 정보 반환
   * @param name 맵 ID */
  async selectMap(name: string): Promise<SelectMapDto> {
    const findMap = (data: SelectMapDto[]) => {
      const bothTrue = data.find(
        (item) => item.isTrophyLeague && item.isPowerLeague
      );
      if (bothTrue) {
        return bothTrue;
      }

      const eitherTrue = data.find(
        (item) => item.isTrophyLeague || item.isPowerLeague
      );
      if (eitherTrue) {
        return eitherTrue;
      }

      return data[0];
    };

    return findMap(
      await this.maps
        .createQueryBuilder('map')
        .select('map.id', 'mapID')
        .addSelect('map.name', 'mapName')
        .addSelect('map.mode', 'mode')
        .addSelect('mRotation.isTrophyLeague', 'isTrophyLeague')
        .addSelect('mRotation.isPowerLeague', 'isPowerLeague')
        .leftJoin('map.mapRotation', 'mRotation')
        .where('map.name = :name', {
          name: name
        })
        .getRawMany()
    );
  }

  /** 맵 이름에 대한 전투 통계 반환
   * @param name 맵 ID
   * @param type 전투 타입
   * @param limit
   * @param grade 전투 등급 */
  async selectMapStats(
    name: string,
    type: string,
    grade: string[],
    limit?: number
  ): Promise<SelectMapStatsDto[]> {
    const matchGrade = this.battleService.setMatchGrade(type, grade);
    const mapName =
      (await this.maps
        .createQueryBuilder('maps')
        .select('maps.name', 'name')
        .where('maps.name = :name', {
          name: name
        })
        .limit(1)
        .getRawOne()) || 'Name Unknown';

    const mapIDs = await this.maps
      .createQueryBuilder('maps')
      .select('maps.id', 'id')
      .where('maps.name = :name', {
        name: mapName.name
      })
      .getRawMany()
      .then((maps) => maps.map((map) => map.id));

    const query = this.battleStats
      .createQueryBuilder('battleStats')
      .select('battleStats.brawlerID', 'brawlerID')
      .addSelect(
        'ROUND(SUM(battleStats.matchCount) * 100 / SUM(SUM(battleStats.matchCount)) OVER(), 2)',
        'pickRate'
      )
      .addSelect(
        'ROUND(SUM(battleStats.victoriesCount) * 100 / (SUM(battleStats.victoriesCount) + SUM(battleStats.defeatsCount)), 2)',
        'victoryRate'
      )
      .addSelect('brawler.name', 'brawlerName')
      .leftJoin('battleStats.brawler', 'brawler')
      .where('battleStats.mapID IN (:ids)', {
        ids: mapIDs
      })
      .andWhere('battleStats.matchType = :type', {
        type: type
      })
      .andWhere('battleStats.matchGrade IN (:grade)', {
        grade: matchGrade
      })
      .groupBy('battleStats.brawlerID')
      .addGroupBy('brawler.name')
      .orderBy('pickRate', 'DESC')
      .addOrderBy('victoryRate', 'DESC');

    if (limit) {
      query.limit(limit);
    }

    return await query.getRawMany();
  }

  /**
   * 모든 맵 목록 조회
   */
  async selectMaps() {
    const maps = await this.maps
      .createQueryBuilder('map')
      .select('MAX(map.id)', 'mapID')
      .addSelect('map.name', 'mapName')
      .addSelect('map.mode', 'mode')
      .groupBy('map.name')
      .addGroupBy('map.mode')
      .getRawMany();

    return maps.reduce((acc, map) => {
      const mode = map.mode;

      if (!acc[mode]) {
        acc[mode] = [];
      }

      if (!acc[mode].find((m) => m.mapID === map.mapID)) {
        acc[mode].push(map);
      }

      return acc;
    }, {});
  }

  /** 맵 이름에 대한 맵 정보 반환
   * @param name 맵 ID
   * @param mode 모드 이름 */
  async selectMapByName(name: string, mode?: string): Promise<SelectMapDto> {
    const query = this.maps
      .createQueryBuilder('map')
      .select('map.id', 'mapID')
      .addSelect('map.name', 'mapName')
      .addSelect('map.mode', 'mode')
      .leftJoin('map.mapRotation', 'mRotation')
      .where('map.name = :name', {
        name: name
      });

    if (mode) {
      query.andWhere('map.mode = :mode', {
        mode: mode
      });
    }

    return await query.getRawOne();
  }
}
