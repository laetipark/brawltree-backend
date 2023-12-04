import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBattles } from '~/users/entities/user-battles.entity';
import { Maps } from '~/maps/entities/maps.entity';
import { Seasons } from '~/seasons/entities/seasons.entity';
import { UserBrawlerBattles } from '~/users/entities/user-brawlers.entity';
import { AppConfigService } from '~/utils/services/app-config.service';

@Injectable()
export class UserBattlesService {
  constructor(
    @InjectRepository(UserBattles)
    private userBattles: Repository<UserBattles>,
    @InjectRepository(UserBrawlerBattles)
    private userBrawlerBattles: Repository<UserBrawlerBattles>,
    private configService: AppConfigService,
  ) {}

  async findUserBattles(
    id: string,
    type: string,
    mode: string,
    season: Seasons,
  ) {
    const query = await this.getQuery(type, mode);

    const battlesSummary = [
      await this.userBattles
        .createQueryBuilder('ub')
        .select('DATE_FORMAT(ub.battleTime, "%Y-%m-%d")', 'day')
        .addSelect('COUNT(ub.battleTime)', 'value')
        .innerJoin(Maps, 'm', 'ub.mapID = m.id')
        .where('ub.userID = :id AND ub.playerID = :id', {
          id: `#${id}`,
        })
        .andWhere('ub.battleTime BETWEEN :begin AND :end', {
          begin: season.beginDate,
          end: season.endDate,
        })
        .andWhere('ub.matchType IN (:type)', {
          type: query.matchType,
        })
        .andWhere('m.mode IN (:mode)', {
          mode: query.matchMode,
        })
        .groupBy('DATE_FORMAT(ub.battleTime, "%Y-%m-%d")')
        .getRawMany(),
      await this.userBattles
        .createQueryBuilder('ub')
        .select('DATE_FORMAT(ub.battleTime, "%Y-%m-%d")', 'day')
        .addSelect(
          'SUM(CASE WHEN ub.matchType NOT IN (4, 5) THEN ub.trophyChange ELSE 0 END)',
          'value',
        )
        .innerJoin(Maps, 'm', 'ub.mapID = m.id')
        .where('ub.userID = :id AND ub.playerID = :id', {
          id: `#${id}`,
        })
        .andWhere('ub.battleTime BETWEEN :begin AND :end', {
          begin: season.beginDate,
          end: season.endDate,
        })
        .andWhere('ub.matchType IN (:type)', {
          type: query.matchType,
        })
        .andWhere('m.mode IN (:mode)', {
          mode: query.matchMode,
        })
        .groupBy('DATE_FORMAT(ub.battleTime, "%Y-%m-%d")')
        .getRawMany(),
    ];

    const brawlersSummary = await this.userBrawlerBattles
      .createQueryBuilder('ubb')
      .select('ubb.brawlerID', 'brawlerID')
      .addSelect('SUM(ubb.matchCount)', 'matchCount')
      .addSelect(
        'ROUND(SUM(ubb.matchCount) * 100 / SUM(SUM(ubb.matchCount)) OVER(), 2)',
        'pickRate',
      )
      .addSelect(
        'ROUND(SUM(ubb.victoriesCount) * 100 / SUM(ubb.victoriesCount + ubb.defeatsCount), 2)',
        'victoryRate',
      )
      .addSelect('b.name', 'name')
      .innerJoin('ubb.brawler', 'b')
      .innerJoin('ubb.map', 'm')
      .where('ubb.userID = :id', {
        id: `#${id}`,
      })
      .andWhere('ubb.matchType IN (:type)', {
        type: query.matchType,
      })
      .andWhere('m.mode IN (:mode)', {
        mode: query.matchMode,
      })
      .groupBy('ubb.brawlerID')
      .addGroupBy('b.name')
      .orderBy('matchCount', 'DESC')
      .limit(5)
      .getRawMany();

    return [battlesSummary, brawlersSummary];
  }

  async findUserBattleLogs(
    id: string,
    type: string,
    mode: string,
    season: Seasons,
  ) {
    const query = await this.getQuery(type, mode);

    const recentBattles = await this.userBattles
      .createQueryBuilder('ub')
      .select('ub.battleTime', 'battleTime')
      .addSelect('ub.duration', 'duration')
      .addSelect('ub.brawlerID', 'brawlerID')
      .addSelect('ub.gameResult', 'gameResult')
      .addSelect('ub.mapID', 'mapID')
      .addSelect('ub.isStarPlayer', 'isStarPlayer')
      .addSelect('m.mode', 'mode')
      .addSelect('m.name', 'mapName')
      .addSelect('b.name', 'brawlerName')
      .addSelect('b.role', 'role')
      .innerJoin('ub.brawler', 'b')
      .innerJoin(Maps, 'm', 'ub.mapID = m.id')
      .where('ub.userID = :id AND ub.playerID = :id', {
        id: `#${id}`,
      })
      .andWhere('ub.battleTime BETWEEN :begin AND :end', {
        begin: season.beginDate,
        end: season.endDate,
      })
      .andWhere('ub.matchType IN (:type)', {
        type: query.matchType,
      })
      .andWhere('m.mode IN (:mode)', {
        mode: query.matchMode,
      })
      .orderBy('ub.battleTime', 'DESC')
      .limit(30)
      .getRawMany();

    const counter = {};

    recentBattles.forEach(function (item) {
      const brawlerID = item.brawlerID;
      const matchRes = item.gameResult;

      if (!counter[brawlerID]) {
        counter[brawlerID] = {};
      }

      if (!counter[brawlerID][matchRes]) {
        counter[brawlerID][matchRes] = 1;
      } else {
        counter[brawlerID][matchRes]++;
      }
    });

    const brawlerCounts = Object.keys(counter).map((brawlerID) => {
      const gameResultCounts = counter[brawlerID];
      const brawlerName = recentBattles.find(
        (brawler) => brawler.brawlerID === brawlerID,
      ).brawlerName;

      return {
        brawlerID: brawlerID,
        brawlerName: brawlerName,
        resultCount: gameResultCounts,
        matchCount: Object.values(gameResultCounts).reduce(
          (sum: number, count: number) => sum + count,
          0,
        ),
      };
    });

    const recentBrawlers = brawlerCounts
      .sort(
        (
          a: {
            brawlerName: string;
            matchCount: number;
            resultCount: number;
            brawlerID: string;
          },
          b: {
            brawlerName: string;
            matchCount: number;
            resultCount: number;
            brawlerID: string;
          },
        ) => b.matchCount - a.matchCount,
      )
      .slice(0, 6);

    const battles = await this.userBattles
      .createQueryBuilder('ub')
      .select('ub.userID', 'userID')
      .addSelect(
        'JSON_OBJECT(' +
          '"userID", ub.userID,' +
          '"battleTime", ub.battleTime,' +
          '"duration", ub.duration,' +
          '"matchType", ub.matchType,' +
          '"modeCode", ub.modeCode,' +
          '"matchGrade", ub.matchGrade,' +
          '"trophyChange", ub.trophyChange)',
        'BATTLE_INFO',
      )
      .addSelect(
        'JSON_ARRAYAGG(' +
          'JSON_OBJECT(' +
          '"playerID", ub.playerID,' +
          '"playerName", ub.playerName,' +
          '"teamNumber", ub.teamNumber,' +
          '"brawlerID", ub.brawlerID,' +
          '"brawlerPower", ub.brawlerPower,' +
          '"brawlerTrophies", ub.brawlerTrophies,' +
          '"gameRank", ub.gameRank,' +
          '"gameResult", ub.gameResult,' +
          '"isStarPlayer", ub.isStarPlayer))',
        'BATTLE_PLAYERS',
      )
      .innerJoin(Maps, 'm', 'ub.mapID = m.id')
      .where('ub.userID = :id', {
        id: `#${id}`,
      })
      .andWhere('ub.battleTime BETWEEN :begin AND :end', {
        begin: season.beginDate,
        end: season.endDate,
      })
      .andWhere('ub.matchType IN (:type)', {
        type: query.matchType,
      })
      .andWhere('m.mode IN (:mode)', {
        mode: query.matchMode,
      })
      .groupBy('ub.userID')
      .addGroupBy('ub.battleTime')
      .addGroupBy('ub.duration')
      .addGroupBy('ub.matchType')
      .addGroupBy('ub.modeCode')
      .addGroupBy('ub.matchGrade')
      .addGroupBy('ub.trophyChange')
      .orderBy('ub.battleTime', 'DESC')
      .limit(30)
      .getRawMany()
      .then((result) => {
        return result.map((battle) => {
          return {
            BATTLE_INFO: Object.assign(
              battle.BATTLE_INFO,
              recentBattles.find(
                (item) =>
                  new Date(battle.BATTLE_INFO.battleTime).toString() ===
                  new Date(item.battleTime).toString(),
              ),
            ),
            BATTLE_PLAYERS: battle.BATTLE_PLAYERS,
          };
        });
      });

    return [recentBattles, recentBrawlers, battles];
  }

  private async getQuery(type: string, mode: string) {
    const match = {
      matchType: [],
      matchMode: [],
    };

    if (type === '7') {
      match.matchType = await this.configService.getTypeList();
    } else {
      match.matchType = [type];
    }

    if (mode === 'all') {
      match.matchMode = await this.configService.getModeList();
    } else {
      match.matchMode = [mode];
    }

    return match;
  }
}
