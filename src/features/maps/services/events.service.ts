import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameMaps } from '../entities/maps.entity';
import { GameMapRotation } from '~/maps/entities/map-rotation.entity';
import { GameEvents } from '../entities/events.entity';
import { GameModes } from '~/maps/entities/modes.entity';
import { AppConfigService } from '~/utils/services/app-config.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(GameMapRotation)
    private readonly mapRotation: Repository<GameMapRotation>,
    @InjectRepository(GameModes)
    private readonly gameModes: Repository<GameModes>,
    private readonly configService: AppConfigService,
  ) {}

  /** 트로피 리그 모드 반환 */
  async selectModeTL() {
    const rotation = await this.mapRotation
      .createQueryBuilder('mRotation')
      .select('map.mode', 'mode')
      .innerJoin('mRotation.map', 'map')
      .where('mRotation.isTrophyLeague = TRUE')
      .groupBy('map.mode')
      .getRawMany();

    const filterModeList = rotation.map((map) => map.mode);

    filterModeList.unshift('all');
    return filterModeList;
  }

  /** 파워 리그 모드 반환 */
  async selectModePL() {
    const rotation = await this.mapRotation
      .createQueryBuilder('mRotation')
      .select('map.mode', 'mode')
      .innerJoin('mRotation.map', 'map')
      .where('mRotation.isPowerLeague = TRUE')
      .groupBy('map.mode')
      .getRawMany();

    const filterModeList = rotation.map((map) => map.mode);

    filterModeList.unshift('all');
    return filterModeList;
  }

  /** 금일 트로피 리그 맵 목록 반환 */
  async selectRotationTLDaily(): Promise<GameEvents[]> {
    return await this.mapRotation
      .createQueryBuilder('mRotation')
      .select('e.id', 'id')
      .addSelect('e.startTime', 'startTime')
      .addSelect('e.endTime', 'endTime')
      .addSelect('e.mapID', 'mapID')
      .addSelect('e.modifiers', 'modifiers')
      .addSelect('map.name', 'mapName')
      .addSelect('map.mode', 'mode')
      .innerJoin('mRotation.map', 'map')
      .innerJoin('mRotation.events', 'e')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('e.id', 'id')
          .addSelect('MAX(e.startTime)', 'startTime')
          .from(GameEvents, 'e')
          .groupBy('e.id')
          .getQuery();
        return '(e.id, e.startTime) IN ' + subQuery;
      })
      .andWhere('mRotation.isTrophyLeague = TRUE')
      .andWhere('e.startTime <= :time AND e.endTime >= :time', {
        time: new Date(),
      })
      .orderBy('e.id', 'ASC')
      .addOrderBy('e.startTime', 'DESC')
      .getRawMany();
  }

  /** 익일 트로피 리그 맵 목록 반환 */
  async findRotationTLNext(): Promise<GameEvents[]> {
    return await this.mapRotation
      .createQueryBuilder('mRotation')
      .select('e.id', 'id')
      .addSelect('e.startTime', 'startTime')
      .addSelect('e.endTime', 'endTime')
      .addSelect('e.mapID', 'mapID')
      .addSelect('e.modifiers', 'modifiers')
      .addSelect('map.mode', 'mode')
      .addSelect('map.name', 'mapName')
      .innerJoin('mRotation.map', 'map')
      .innerJoin('mRotation.events', 'e')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('e.id', 'id')
          .addSelect('MIN(e.startTime)', 'startTime')
          .from(GameEvents, 'e')
          .groupBy('e.id')
          .getQuery();
        return '(e.id, e.startTime) IN ' + subQuery;
      })
      .andWhere('mRotation.isTrophyLeague = TRUE')
      .orWhere('e.startTime > :time', {
        time: new Date(),
      })
      .orderBy('e.id', 'ASC')
      .addOrderBy('e.startTime', 'DESC')
      .getRawMany();
  }

  /** 파워 리그 맵 목록 반환 */
  async findRotationPL(): Promise<GameMaps[]> {
    return await this.mapRotation
      .createQueryBuilder('mRotation')
      .select('map.id', 'mapID')
      .addSelect('map.mode', 'mode')
      .addSelect('map.name', 'mapName')
      .innerJoin('mRotation.map', 'map')
      .where('mRotation.isPowerLeague = TRUE')
      .orderBy('map.mode', 'ASC')
      .getRawMany();
  }
}
