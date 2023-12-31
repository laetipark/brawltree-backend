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
      .createQueryBuilder('mr')
      .select('m.mode', 'mode')
      .innerJoin('mr.map', 'm')
      .where('mr.isTrophyLeague = TRUE')
      .groupBy('m.mode')
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
      .createQueryBuilder('mr')
      .select('m.mode', 'mode')
      .innerJoin('mr.map', 'm')
      .where('mr.isPowerLeague = TRUE')
      .groupBy('m.mode')
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
      .createQueryBuilder('mr')
      .select('e.id', 'id')
      .addSelect('e.startTime', 'startTime')
      .addSelect('e.endTime', 'endTime')
      .addSelect('e.mapID', 'mapID')
      .addSelect('e.modifiers', 'modifiers')
      .addSelect('m.name', 'mapName')
      .addSelect('m.mode', 'mode')
      .innerJoin('mr.map', 'm')
      .innerJoin('mr.events', 'e')
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
      .andWhere('mr.isTrophyLeague = TRUE')
      .andWhere('e.endTime >= :time', {
        time: new Date(),
      })
      .orderBy('e.id', 'ASC')
      .addOrderBy('e.startTime', 'DESC')
      .getRawMany();
  }

  /** 익일 트로피 리그 맵 목록 반환 */
  async findRotationTLNext(): Promise<Events[]> {
    return await this.mapRotation
      .createQueryBuilder('mr')
      .select('e.id', 'id')
      .addSelect('e.startTime', 'startTime')
      .addSelect('e.endDate', 'endDate')
      .addSelect('e.mapID', 'mapID')
      .addSelect('e.modifiers', 'modifiers')
      .addSelect('m.mode', 'mode')
      .addSelect('m.name', 'mapName')
      .innerJoin('mr.map', 'm')
      .innerJoin('mr.events', 'e')
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
      .andWhere('mr.isTrophyLeague = TRUE')
      .orderBy('e.id', 'ASC')
      .addOrderBy('e.startTime', 'DESC')
      .getRawMany();
  }

  /** 파워 리그 맵 목록 반환 */
  async findRotationPL(): Promise<Maps[]> {
    return await this.mapRotation
      .createQueryBuilder('mr')
      .select('m.id', 'mapID')
      .addSelect('m.mode', 'mode')
      .addSelect('m.name', 'mapName')
      .innerJoin('mr.map', 'm')
      .where('mr.isPowerLeague = TRUE')
      .orderBy('m.mode', 'ASC')
      .getRawMany();
  }
}
