import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maps } from '../entities/maps.entity';
import { MapRotation } from '~/maps/entities/map-rotation.entity';
import { Events } from '../entities/events.entity';
import { AppConfigService } from '~/utils/services/app-config.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(MapRotation)
    private readonly mapRotation: Repository<MapRotation>,
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

    const modeList = rotation.map((map) => map.mode);
    const filterModeList = (await this.configService.getModeList()).filter(
      (mode) => modeList.includes(mode),
    );
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

    const modeList = rotation.map((map) => map.mode);
    const filterModeList = (await this.configService.getModeList()).filter(
      (mode) => modeList.includes(mode),
    );
    filterModeList.unshift('all');
    return filterModeList;
  }

  /** 금일 트로피 리그 맵 목록 반환 */
  async selectRotationTLDaily(): Promise<Events[]> {
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
          .from(Events, 'e')
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
  async findRotationTLNext(): Promise<Events[]> {
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
          .from(Events, 'e')
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
  async findRotationPL(): Promise<Maps[]> {
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
