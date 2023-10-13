import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maps } from '~/maps/entities/maps.entity';

import { BrawlerStats } from '~/brawlers/entities/brawler-stats.entity';

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
      .select('m.mapID', 'mapID')
      .addSelect('m.name', 'name')
      .addSelect('m.mode', 'mode')
      .addSelect('mr.isTrophyLeague', 'isTrophyLeague')
      .addSelect('mr.isPowerLeague', 'isPowerLeague')
      .leftJoin('m.mapRotation', 'mr')
      .where('m.mapID = :id', {
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
      .select('bs.mapID', 'mapID')
      .addSelect('bs.brawlerID', 'brawlerID')
      .addSelect(
        'ROUND(SUM(bs.matchCount) * 100 / SUM(SUM(bs.matchCount)) OVER(), 2)',
        'pickRate',
      )
      .addSelect(
        'ROUND(SUM(bs.victoryCount) * 100 / (SUM(bs.victoryCount) + SUM(bs.defeatCount)), 2)',
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
        grade: matchGrade(type, grade),
      })
      .groupBy('bs.brawlerID')
      .addGroupBy('b.name')
      .orderBy('pickRate', 'DESC')
      .addOrderBy('victoryRate', 'DESC')
      .getRawMany();
  }
}
