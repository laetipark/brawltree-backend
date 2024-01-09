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
      .createQueryBuilder('brawler')
      .select('brawler.id', 'brawlerID')
      .addSelect('brawler.name', 'name')
      .addSelect('brawler.rarity', 'rarity')
      .addSelect('uBrawler.userID', 'userID')
      .addSelect('uBrawler.brawlerPower', 'brawlerPower')
      .addSelect('uBrawler.beginTrophies', 'beginTrophies')
      .addSelect('uBrawler.currentTrophies', 'currentTrophies')
      .addSelect('uBrawler.highestTrophies', 'highestTrophies')
      .addSelect('uBrawler.brawlerRank', 'brawlerRank')
      .addSelect(
        'ROUND(IFNULL(' +
          'SUM(CASE WHEN uBrawlerBattle.matchType = 0 ' +
          'THEN uBrawlerBattle.matchCount ELSE 0 END) * 100 / ' +
          'SUM(SUM(CASE WHEN uBrawlerBattle.matchType = 0 ' +
          'THEN uBrawlerBattle.matchCount ELSE 0 END)) OVER(), 0), 2)',
        'trophyLeaguePickRate',
      )
      .addSelect(
        'ROUND(IFNULL(' +
          'SUM(CASE WHEN uBrawlerBattle.matchType = 0 ' +
          'THEN uBrawlerBattle.victoriesCount ELSE 0 END) * 100 / ' +
          'SUM(CASE WHEN uBrawlerBattle.matchType = 0 ' +
          'THEN uBrawlerBattle.victoriesCount + uBrawlerBattle.defeatsCount ELSE 0 END), 0), 2)',
        'trophyLeagueVictoryRate',
      )
      .addSelect(
        'ROUND(IFNULL(' +
          'SUM(CASE WHEN uBrawlerBattle.matchType IN (2, 3) ' +
          'THEN uBrawlerBattle.matchCount ELSE 0 END) * 100 / ' +
          'SUM(SUM(CASE WHEN uBrawlerBattle.matchType IN (2, 3) ' +
          'THEN uBrawlerBattle.matchCount ELSE 0 END)) OVER(), 0), 2)',
        'powerLeaguePickRate',
      )
      .addSelect(
        'ROUND(IFNULL(' +
          'SUM(CASE WHEN uBrawlerBattle.matchType IN (2, 3) ' +
          'THEN uBrawlerBattle.victoriesCount ELSE 0 END) * 100 / ' +
          'SUM(CASE WHEN uBrawlerBattle.matchType IN (2, 3) ' +
          'THEN uBrawlerBattle.victoriesCount + uBrawlerBattle.defeatsCount ELSE 0 END), 0), 2)',
        'powerLeagueVictoryRate',
      )
      .innerJoin('brawler.userBrawlers', 'uBrawler')
      .leftJoin('brawler.userBrawlerBattles', 'ubb')
      .where('uBrawler.userID = :id', {
        id: `#${id}`,
      })
      .groupBy('brawler.id')
      .addGroupBy('brawler.name')
      .orderBy('uBrawler.currentTrophies', 'DESC')
      .getRawMany();

    const items = await this.userBrawlerItems
      .createQueryBuilder('uBrawlerItem')
      .select('uBrawlerItem.userID', 'userID')
      .addSelect('uBrawlerItem.brawlerID', 'brawlerID')
      .addSelect('uBrawlerItem.itemID', 'itemID')
      .addSelect('bItem.kind', 'itemKind')
      .addSelect('bItem.name', 'itemName')
      .innerJoin('uBrawlerItem.brawlerItem', 'bi')
      .where('uBrawlerItem.userID = :id', {
        id: `#${id}`,
      })
      .getRawMany();

    const graph = await this.userBattles
      .createQueryBuilder('uBrawler')
      .select('DISTINCT(uBrawler.brawlerID)', 'brawlerID')
      .addSelect('DATE_FORMAT(uBrawler.battleTime, "%m-%d")', 'x')
      .addSelect(
        'SUM(uBrawler.trophyChange) OVER(PARTITION BY uBrawler.brawlerID ORDER BY DATE(uBrawler.battleTime))',
        'y',
      )
      .where('uBrawler.userID = :id AND uBrawler.playerID = :id', {
        id: `#${id}`,
      })
      .andWhere('uBrawler.battleTime BETWEEN :begin AND :end', {
        begin: season.beginDate,
        end: season.endDate,
      })
      .andWhere('uBrawler.matchType = 0')
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
