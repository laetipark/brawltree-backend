import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maps } from '~/maps/entities/maps.entity';

import { BrawlerStats } from '~/brawlers/entities/stats.entity';

@Injectable()
export class MapsService {
  constructor(
    @InjectRepository(BrawlerStats)
    private brawlerStats: Repository<BrawlerStats>,
    @InjectRepository(Maps)
    private maps: Repository<Maps>,
  ) {}

  async findMapInfo(id: string) {
    return await this.maps
      .createQueryBuilder('m')
      .select('m.MAP_ID', 'MAP_ID')
      .addSelect('m.MAP_NM', 'MAP_NM')
      .addSelect('m.MAP_MD', 'MAP_MD')
      .addSelect('mr.ROTATION_TL_BOOL', 'ROTATION_TL_BOOL')
      .addSelect('mr.ROTATION_PL_BOOL', 'ROTATION_PL_BOOL')
      .leftJoin('m.mapRotation', 'mr')
      .where('m.MAP_ID = :id', {
        id: id,
      })
      .getRawOne();
  }

  async findMapStats(id: string, type: string, grade: string[]) {
    const matchGrade = (type: string, grade: string[]) => {
      if (type === '0') {
        return grade;
      } else {
        const array = [];
        grade?.map((num) => {
          array.push(parseInt(num) * 3 + 1);
          if (num !== '6') {
            array.push(parseInt(num) * 3 + 2);
            array.push(parseInt(num) * 3 + 3);
          }
        });

        return array;
      }
    };

    return await this.brawlerStats
      .createQueryBuilder('bs')
      .select('bs.MAP_ID', 'MAP_ID')
      .addSelect('bs.BRAWLER_ID', 'BRAWLER_ID')
      .addSelect(
        'ROUND(SUM(bs.MATCH_CNT) * 100 / SUM(SUM(bs.MATCH_CNT)) OVER(), 2)',
        'MATCH_P_RATE',
      )
      .addSelect(
        'ROUND(SUM(bs.MATCH_CNT_VIC) * 100 / (SUM(bs.MATCH_CNT_VIC) + SUM(bs.MATCH_CNT_DEF)), 2)',
        'MATCH_VIC_RATE',
      )
      .addSelect('b.BRAWLER_NM', 'BRAWLER_NM')
      .leftJoin('bs.brawler', 'b')
      .where('MAP_ID = :id', {
        id: id,
      })
      .andWhere('MATCH_TYP = :type', {
        type: type,
      })
      .andWhere('MATCH_GRD IN (:grade)', {
        grade: matchGrade(type, grade),
      })
      .groupBy('bs.BRAWLER_ID')
      .addGroupBy('b.BRAWLER_NM')
      .orderBy('MATCH_P_RATE', 'DESC')
      .addOrderBy('MATCH_VIC_RATE', 'DESC')
      .getRawMany();
  }
}
