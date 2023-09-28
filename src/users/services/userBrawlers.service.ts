import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brawlers } from '../../brawlers/entities/brawlers.entity';
import {
  UserBrawlerItems,
} from '../entities/userBrawlers.entity';
import { UserBattles } from '../entities/users.entity';
import { SeasonsEntity } from '../../seasons/seasons.entity';

@Injectable()
export class UserBrawlersService {
  constructor(
    @InjectRepository(Brawlers)
    private brawlers: Repository<Brawlers>,
    @InjectRepository(UserBattles)
    private userBattles: Repository<UserBattles>,
    @InjectRepository(UserBrawlerItems)
    private userBrawlerItems: Repository<UserBrawlerItems>,
  ) {}

  async findUserBrawlers(id: string, season: SeasonsEntity) {
    const brawlers = await this.brawlers
      .createQueryBuilder('b')
      .select('b.BRAWLER_ID', 'BRAWLER_ID')
      .addSelect('b.BRAWLER_NM', 'BRAWLER_NM')
      .addSelect('b.BRAWLER_RRT', 'BRAWLER_RRT')
      .addSelect('ub.USER_ID', 'USER_ID')
      .addSelect('ub.BRAWLER_PWR', 'BRAWLER_PWR')
      .addSelect('ub.TROPHY_BGN', 'TROPHY_BGN')
      .addSelect('ub.TROPHY_CUR', 'TROPHY_CUR')
      .addSelect('ub.TROPHY_HGH', 'TROPHY_HGH')
      .addSelect('ub.TROPHY_RNK', 'TROPHY_RNK')
      .addSelect(
        'ROUND(IFNULL(' +
          'SUM(CASE WHEN ubb.MATCH_TYP = 0 ' +
          'THEN ubb.MATCH_CNT ELSE 0 END) * 100 / ' +
          'SUM(SUM(CASE WHEN ubb.MATCH_TYP = 0 ' +
          'THEN ubb.MATCH_CNT ELSE 0 END)) OVER(), 0), 2)',
        'MATCH_PCK_R_TL',
      )
      .addSelect(
        'ROUND(IFNULL(' +
          'SUM(CASE WHEN ubb.MATCH_TYP = 0 ' +
          'THEN ubb.MATCH_CNT_VIC ELSE 0 END) * 100 / ' +
          'SUM(CASE WHEN ubb.MATCH_TYP = 0 ' +
          'THEN ubb.MATCH_CNT_VIC + ubb.MATCH_CNT_DEF ELSE 0 END), 0), 2)',
        'MATCH_VIC_R_TL',
      )
      .addSelect(
        'ROUND(IFNULL(' +
          'SUM(CASE WHEN ubb.MATCH_TYP IN (2, 3) ' +
          'THEN ubb.MATCH_CNT ELSE 0 END) * 100 / ' +
          'SUM(SUM(CASE WHEN ubb.MATCH_TYP IN (2, 3) ' +
          'THEN ubb.MATCH_CNT ELSE 0 END)) OVER(), 0), 2)',
        'MATCH_PCK_R_PL',
      )
      .addSelect(
        'ROUND(IFNULL(' +
          'SUM(CASE WHEN ubb.MATCH_TYP IN (2, 3) ' +
          'THEN ubb.MATCH_CNT_VIC ELSE 0 END) * 100 / ' +
          'SUM(CASE WHEN ubb.MATCH_TYP IN (2, 3) ' +
          'THEN ubb.MATCH_CNT_VIC + ubb.MATCH_CNT_DEF ELSE 0 END), 0), 2)',
        'MATCH_VIC_R_PL',
      )
      .innerJoin('b.userBrawlers', 'ub')
      .leftJoin('b.userBrawlerBattles', 'ubb')
      .where('ub.USER_ID = :id', {
        id: `#${id}`,
      })
      .groupBy('b.BRAWLER_ID')
      .addGroupBy('b.BRAWLER_NM')
      .orderBy('ub.TROPHY_CUR', 'DESC')
      .getRawMany();

    const items = await this.userBrawlerItems
      .createQueryBuilder('ubi')
      .select('ubi.USER_ID', 'USER_ID')
      .addSelect('ubi.BRAWLER_ID', 'BRAWLER_ID')
      .addSelect('ubi.ITEM_ID', 'ITEM_ID')
      .addSelect('ubi.ITEM_K', 'ITEM_K')
      .addSelect('ubi.ITEM_NM', 'ITEM_NM')
      .where('ubi.USER_ID = :id', {
        id: `#${id}`,
      })
      .getRawMany();

    const graph = await this.userBattles
      .createQueryBuilder('ub')
      .select('DISTINCT(ub.BRAWLER_ID)', 'BRAWLER_ID')
      .addSelect('DATE_FORMAT(ub.MATCH_DT, "%m-%d")', 'x')
      .addSelect(
        'SUM(ub.MATCH_CHG) OVER(PARTITION BY ub.BRAWLER_ID ORDER BY DATE(ub.MATCH_DT))',
      )
      .where('ub.USER_ID = :id AND PLAYER_ID = :id', {
        id: `#${id}`,
      })
      .andWhere('ub.MATCH_DT BETWEEN :begin AND :end', {
        begin: season.SEASON_BGN_DT,
        end: season.SEASON_END_DT,
      })
      .andWhere('ub.MATCH_TYP = 0')
      .getRawMany()
      .then((result) => {
        const graphJSON = result.map((item) => {
          return {
            BRAWLER_ID: item.BRAWLER_ID,
            x: item.x,
            y:
              parseInt(item.y) +
                brawlers.find(
                  (brawler) => brawler.BRAWLER_ID === item.BRAWLER_ID,
                )?.TROPHY_BGN || 0,
          };
        });

        brawlers.map((item) => {
          graphJSON.push({
            BRAWLER_ID: item.BRAWLER_ID,
            x:
              season.SEASON_BGN_DT.toString().slice(5, 8) +
              (parseInt(season.SEASON_BGN_DT.toString().slice(8, 10)) - 1)
                .toString()
                .padStart(2, '0'),
            y: brawlers.find(
              (brawler) => brawler.BRAWLER_ID === item.BRAWLER_ID,
            ).TROPHY_BGN,
          });
        });

        return graphJSON.sort((a, b) => {
          if (a.BRAWLER_ID === b.BRAWLER_ID) {
            if (a.x < b.x) return -1;
            if (a.x > b.x) return 1;
            return 0;
          }
          return a.BRAWLER_ID - b.BRAWLER_ID;
        });
      });

    return [brawlers, items, graph];
  }
}
