import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBrawlerItems } from '~/users/entities/user-brawlers.entity';
import { UserBattles } from '~/users/entities/user-battles.entity';
import { Brawlers } from '~/brawlers/entities/brawlers.entity';
import { SeasonsService } from '~/seasons/seasons.service';

@Injectable()
export class UserBrawlersService {
  constructor(
    @InjectRepository(Brawlers)
    private readonly brawlers: Repository<Brawlers>,
    @InjectRepository(UserBattles)
    private readonly userBattles: Repository<UserBattles>,
    @InjectRepository(UserBrawlerItems)
    private readonly userBrawlerItems: Repository<UserBrawlerItems>,
    private readonly seasonsService: SeasonsService,
  ) {}

  async selectUserBrawlers(id: string) {
    const season = await this.seasonsService.getRecentSeason();
    const brawlers = await this.brawlers
      .createQueryBuilder('b')
      .select('b.id', 'brawlerID')
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
          'THEN ubb.victoriesCount ELSE 0 END) * 100 / ' +
          'SUM(CASE WHEN ubb.matchType = 0 ' +
          'THEN ubb.victoriesCount + ubb.defeatsCount ELSE 0 END), 0), 2)',
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
          'THEN ubb.victoriesCount ELSE 0 END) * 100 / ' +
          'SUM(CASE WHEN ubb.matchType IN (2, 3) ' +
          'THEN ubb.victoriesCount + ubb.defeatsCount ELSE 0 END), 0), 2)',
        'powerLeagueVictoryRate',
      )
      .innerJoin('b.userBrawlers', 'ub')
      .leftJoin('b.userBrawlerBattles', 'ubb')
      .where('ub.userID = :id', {
        id: `#${id}`,
      })
      .groupBy('b.id')
      .addGroupBy('b.name')
      .orderBy('ub.currentTrophies', 'DESC')
      .getRawMany();

    const items = await this.userBrawlerItems
      .createQueryBuilder('ubi')
      .select('ubi.userID', 'userID')
      .addSelect('ubi.brawlerID', 'brawlerID')
      .addSelect('ubi.itemID', 'itemID')
      .addSelect('bi.kind', 'itemKind')
      .addSelect('bi.name', 'itemName')
      .innerJoin('ubi.brawlerItem', 'bi')
      .where('ubi.userID = :id', {
        id: `#${id}`,
      })
      .getRawMany();

    const graph = await this.userBattles
      .createQueryBuilder('ub')
      .select('DISTINCT(ub.brawlerID)', 'brawlerID')
      .addSelect('DATE_FORMAT(ub.battleTime, "%m-%d")', 'x')
      .addSelect(
        'SUM(ub.trophyChange) OVER(PARTITION BY ub.brawlerID ORDER BY DATE(ub.battleTime))',
        'y',
      )
      .where('ub.userID = :id AND ub.playerID = :id', {
        id: `#${id}`,
      })
      .andWhere('ub.battleTime BETWEEN :begin AND :end', {
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

    return {
      brawlers,
      brawlerItems: items,
      brawlerGraphs: graph,
    };
  }
}
