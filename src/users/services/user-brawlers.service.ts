import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBattles } from '~/users/entities/users.entity';
import { UserBrawlerItems } from '~/users/entities/user-brawlers.entity';
import { Brawlers } from '~/brawlers/entities/brawlers.entity';
import { Seasons } from '~/seasons/entities/seasons.entity';

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

  async findUserBrawlers(id: string, season: Seasons) {
    const brawlers = await this.brawlers
      .createQueryBuilder('b')
      .select('b.brawlerID', 'brawlerID')
      .addSelect('b.name', 'name')
      .addSelect('b.rarity', 'rarity')
      .addSelect('ub.userID', 'userID')
      .addSelect('ub.brawlerPower', 'brawlerPower')
      .addSelect('ub.beginTrophies', 'beginTrophies')
      .addSelect('ub.currentTrophies', 'currentTrophies')
      .addSelect('ub.highestTrophies', 'highestTrophies')
      .addSelect('ub.brawlerRank', 'brawlerRank')
      .addSelect(
        'ROUND(IFNULL(' +
          'SUM(CASE WHEN ubb.matchType = 0 ' +
          'THEN ubb.matchCount ELSE 0 END) * 100 / ' +
          'SUM(SUM(CASE WHEN ubb.matchType = 0 ' +
          'THEN ubb.matchCount ELSE 0 END)) OVER(), 0), 2)',
        'trophyLeaguePickRate',
      )
      .addSelect(
        'ROUND(IFNULL(' +
          'SUM(CASE WHEN ubb.matchType = 0 ' +
          'THEN ubb.victoryCount ELSE 0 END) * 100 / ' +
          'SUM(CASE WHEN ubb.matchType = 0 ' +
          'THEN ubb.victoryCount + ubb.defeatCount ELSE 0 END), 0), 2)',
        'trophyLeagueVictoryRate',
      )
      .addSelect(
        'ROUND(IFNULL(' +
          'SUM(CASE WHEN ubb.matchType IN (2, 3) ' +
          'THEN ubb.matchCount ELSE 0 END) * 100 / ' +
          'SUM(SUM(CASE WHEN ubb.matchType IN (2, 3) ' +
          'THEN ubb.matchCount ELSE 0 END)) OVER(), 0), 2)',
        'powerLeaguePickRate',
      )
      .addSelect(
        'ROUND(IFNULL(' +
          'SUM(CASE WHEN ubb.matchType IN (2, 3) ' +
          'THEN ubb.victoryCount ELSE 0 END) * 100 / ' +
          'SUM(CASE WHEN ubb.matchType IN (2, 3) ' +
          'THEN ubb.victoryCount + ubb.defeatCount ELSE 0 END), 0), 2)',
        'powerLeagueVictoryRate',
      )
      .innerJoin('b.userBrawlers', 'ub')
      .leftJoin('b.userBrawlerBattles', 'ubb')
      .where('ub.userID = :id', {
        id: `#${id}`,
      })
      .groupBy('b.brawlerID')
      .addGroupBy('b.name')
      .orderBy('ub.currentTrophies', 'DESC')
      .getRawMany();

    const items = await this.userBrawlerItems
      .createQueryBuilder('ubi')
      .select('ubi.userID', 'userID')
      .addSelect('ubi.brawlerID', 'brawlerID')
      .addSelect('ubi.itemID', 'itemID')
      .addSelect('ubi.itemKind', 'itemKind')
      .addSelect('ubi.itemName', 'itemName')
      .where('ubi.userID = :id', {
        id: `#${id}`,
      })
      .getRawMany();

    const graph = await this.userBattles
      .createQueryBuilder('ub')
      .select('DISTINCT(ub.brawlerID)', 'brawlerID')
      .addSelect('DATE_FORMAT(ub.matchDate, "%m-%d")', 'x')
      .addSelect(
        'SUM(ub.matchChange) OVER(PARTITION BY ub.brawlerID ORDER BY DATE(ub.matchDate))',
        'y',
      )
      .where('ub.userID = :id AND ub.playerID = :id', {
        id: `#${id}`,
      })
      .andWhere('ub.matchDate BETWEEN :begin AND :end', {
        begin: season.beginDate,
        end: season.endDate,
      })
      .andWhere('ub.matchType = 0')
      .getRawMany()
      .then((result) => {
        const graphJSON = result.map((item) => {
          return {
            brawlerID: item.brawlerID,
            x: item.x,
            y:
              parseInt(item.y) +
                brawlers.find((brawler) => brawler.brawlerID === item.brawlerID)
                  ?.beginTrophies || 0,
          };
        });

        const beginDate = new Date(season.beginDate.getTime() - 24 * 60 * 1000);
        brawlers.map((item) => {
          graphJSON.push({
            brawlerID: item.brawlerID,
            x:
              (beginDate.getMonth() + 1).toString().padStart(2, '0') +
              '-' +
              beginDate.getDate().toString().padStart(2, '0'),
            y: brawlers.find((brawler) => brawler.brawlerID === item.brawlerID)
              .beginTrophies,
          });
        });

        return graphJSON.sort((a, b) => {
          if (a.brawlerID === b.brawlerID) {
            if (a.x < b.x) return -1;
            if (a.x > b.x) return 1;
            return 0;
          }
          return a.brawlerID - b.brawlerID;
        });
      });

    return [brawlers, items, graph];
  }
}
