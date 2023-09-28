import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MapRotation } from '../entities/maps.entity';
import { Repository } from 'typeorm';
import { GameConfigService } from '../../config/gameConfig.service';

const groupBy = (data: any[], key: string) =>
  data.reduce((carry, el) => {
    const group = el[key];

    if (carry[group] === undefined) {
      carry[group] = [];
    }

    carry[group].push(el);
    return carry;
  }, {});

@Injectable()
export class RotationService {
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

  async findRotationTL() {
    const beginDate = new Date(
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 1,
      ).getTime(),
    );

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
      .where('e.ROTATION_BGN_DT <= :begin', {
        begin: beginDate,
      })
      .andWhere('mr.ROTATION_TL_BOOL = TRUE')
      .orderBy('ROTATION_BGN_DT', 'DESC')
      .getRawMany()
      .then((result) => {
        return groupBy(result, 'ROTATION_SLT_NO');
      });
  }

  async findRotationPL() {
    return await this.mapRotation
      .createQueryBuilder('mr')
      .select('m.MAP_ID', 'MAP_ID')
      .addSelect('m.MAP_MD', 'MAP_MD')
      .addSelect('m.MAP_NM', 'MAP_NM')
      .innerJoin('mr.maps', 'm')
      .where('ROTATION_PL_BOOL = TRUE')
      .getRawMany()
      .then((result) => {
        return groupBy(result, 'MAP_MD');
      });
  }
}
