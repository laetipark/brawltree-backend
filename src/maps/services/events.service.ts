import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MapRotation, Maps } from '~/maps/entities/maps.entity';
import { Events } from '~/maps/entities/events.entity';

import { GameConfigService } from '~/config/gameConfig.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(MapRotation)
    private mapRotation: Repository<MapRotation>,
    private configService: GameConfigService,
  ) {}

  async findModeTL() {
    const rotation = await this.mapRotation
      .createQueryBuilder('mr')
      .select('m.MAP_MD', 'MAP_MD')
      .innerJoin('mr.map', 'm')
      .where('ROTATION_TL_BOOL = TRUE')
      .groupBy('MAP_MD')
      .getRawMany();

    const modeList = rotation.map((map) => map.MAP_MD);
    const filterModeList = (await this.configService.getModeList()).filter(
      (mode) => modeList.includes(mode),
    );
    filterModeList.unshift('all');
    return filterModeList;
  }

  async findModePL() {
    const rotation = await this.mapRotation
      .createQueryBuilder('mr')
      .select('m.MAP_MD', 'MAP_MD')
      .innerJoin('mr.map', 'm')
      .where('ROTATION_PL_BOOL = TRUE')
      .groupBy('MAP_MD')
      .getRawMany();

    const modeList = rotation.map((map) => map.MAP_MD);
    const filterModeList = (await this.configService.getModeList()).filter(
      (mode) => modeList.includes(mode),
    );
    filterModeList.unshift('all');
    return filterModeList;
  }

  async findRotationTLDaily(): Promise<Events[]> {
    return await this.mapRotation
      .createQueryBuilder('mr')
      .select('e.ROTATION_SLT_NO', 'ROTATION_SLT_NO')
      .addSelect('e.ROTATION_BGN_DT', 'ROTATION_BGN_DT')
      .addSelect('e.ROTATION_END_DT', 'ROTATION_END_DT')
      .addSelect('e.MAP_ID', 'MAP_ID')
      .addSelect('e.MAP_MDFS', 'MAP_MDFS')
      .addSelect('m.MAP_NM', 'MAP_NM')
      .addSelect('m.MAP_MD', 'MAP_MD')
      .innerJoin('mr.map', 'm')
      .innerJoin('mr.events', 'e')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('e.ROTATION_SLT_NO', 'ROTATION_SLT_NO')
          .addSelect('MAX(e.ROTATION_BGN_DT)', 'ROTATION_BGN_DT')
          .from(Events, 'e')
          .groupBy('e.ROTATION_SLT_NO')
          .getQuery();
        return '(e.ROTATION_SLT_NO, e.ROTATION_BGN_DT) IN ' + subQuery;
      })
      .andWhere('mr.ROTATION_TL_BOOL = TRUE')
      .orderBy('ROTATION_SLT_NO', 'ASC')
      .addOrderBy('ROTATION_BGN_DT', 'DESC')
      .getRawMany();
  }

  async findRotationTLNext(): Promise<Events[]> {
    return await this.mapRotation
      .createQueryBuilder('mr')
      .select('e.ROTATION_SLT_NO', 'ROTATION_SLT_NO')
      .addSelect('e.ROTATION_BGN_DT', 'ROTATION_BGN_DT')
      .addSelect('e.ROTATION_END_DT', 'ROTATION_END_DT')
      .addSelect('e.MAP_ID', 'MAP_ID')
      .addSelect('e.MAP_MDFS', 'MAP_MDFS')
      .addSelect('m.MAP_MD', 'MAP_MD')
      .addSelect('m.MAP_NM', 'MAP_NM')
      .innerJoin('mr.map', 'm')
      .innerJoin('mr.events', 'e')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('e.ROTATION_SLT_NO', 'ROTATION_SLT_NO')
          .addSelect('MIN(e.ROTATION_BGN_DT)', 'ROTATION_BGN_DT')
          .from(Events, 'e')
          .groupBy('e.ROTATION_SLT_NO')
          .getQuery();
        return '(e.ROTATION_SLT_NO, e.ROTATION_BGN_DT) IN ' + subQuery;
      })
      .andWhere('mr.ROTATION_TL_BOOL = TRUE')
      .orderBy('ROTATION_SLT_NO', 'ASC')
      .addOrderBy('ROTATION_BGN_DT', 'DESC')
      .getRawMany();
  }

  async findRotationPL(): Promise<Maps[]> {
    return await this.mapRotation
      .createQueryBuilder('mr')
      .select('m.MAP_ID', 'MAP_ID')
      .addSelect('m.MAP_MD', 'MAP_MD')
      .addSelect('m.MAP_NM', 'MAP_NM')
      .innerJoin('mr.map', 'm')
      .where('ROTATION_PL_BOOL = TRUE')
      .orderBy('m.MAP_MD', 'ASC')
      .getRawMany();
  }
}
