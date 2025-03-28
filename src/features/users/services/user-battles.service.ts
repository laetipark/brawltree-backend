import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { AppConfigService } from '~/utils/services/app-config.service';
import { SeasonsService } from '~/seasons/seasons.service';
import { EventsService } from '~/maps/services/events.service';
import { UserBattles } from '~/users/entities/user-battles.entity';
import { UserBrawlerBattles } from '~/users/entities/user-brawlers.entity';
import { GameMaps } from '~/maps/entities/maps.entity';
import {
  SelectRecentUserBattlesDto,
  SelectUserBattleLogsDto,
  SelectUserBattlesDto,
  SelectUserSummaryBattlesDto,
  SelectUserBrawlerBattlesDto
} from '~/users/dto/select-user-battles.dto';
import { SeasonDto } from '~/seasons/dto/season.dto';
import { ModesService } from '~/maps/services/modes.service';

@Injectable()
export class UserBattlesService {
  constructor(
    @InjectRepository(UserBattles)
    private readonly userBattles: Repository<UserBattles>,
    @InjectRepository(UserBrawlerBattles)
    private readonly userBrawlerBattles: Repository<UserBrawlerBattles>,
    private readonly eventsService: EventsService,
    private readonly modesService: ModesService,
    private readonly seasonsService: SeasonsService,
    private readonly configService: AppConfigService
  ) {}

  /** 사용자 전투 요약 통계 정보 반환
   * @param id 사용자 ID
   * @param type 전투 타입
   * @param mode 전투 모드
   * @param season 최근 시즌 정보 */
  async selectUserDailyBattles(
    id: string,
    type: string,
    mode: string,
    season: SeasonDto
  ) {
    const query = await this.getQuery(type, mode);

    // 모드별 시즌 전투 요약 통계
    const summaryBattles = plainToInstance(SelectUserSummaryBattlesDto, [
      await this.userBattles
        .createQueryBuilder('uBattle')
        .select('DATE_FORMAT(uBattle.battleTime, "%Y-%m-%d")', 'day')
        .addSelect('COUNT(uBattle.battleTime)', 'value')
        .innerJoin(GameMaps, 'map', 'uBattle.mapID = map.id')
        .where('uBattle.userID = :id AND uBattle.playerID = :id', {
          id: `#${id}`
        })
        .andWhere('uBattle.battleTime BETWEEN :begin AND :end', {
          begin: season.beginDate,
          end: season.endDate
        })
        .andWhere('uBattle.matchType IN (:type)', {
          type: query.matchType
        })
        .andWhere('map.mode IN (:mode)', {
          mode: query.matchMode
        })
        .groupBy('DATE_FORMAT(uBattle.battleTime, "%Y-%m-%d")')
        .getRawMany(),
      await this.userBattles
        .createQueryBuilder('uBattle')
        .select('DATE_FORMAT(uBattle.battleTime, "%Y-%m-%d")', 'day')
        .addSelect(
          'SUM(CASE WHEN uBattle.matchType NOT IN (4, 5) THEN uBattle.trophyChange ELSE 0 END)',
          'value'
        )
        .innerJoin(GameMaps, 'map', 'uBattle.mapID = map.id')
        .where('uBattle.userID = :id AND uBattle.playerID = :id', {
          id: `#${id}`
        })
        .andWhere('uBattle.battleTime BETWEEN :begin AND :end', {
          begin: season.beginDate,
          end: season.endDate
        })
        .andWhere('uBattle.matchType IN (:type)', {
          type: query.matchType
        })
        .andWhere('map.mode IN (:mode)', {
          mode: query.matchMode
        })
        .groupBy('DATE_FORMAT(uBattle.battleTime, "%Y-%m-%d")')
        .getRawMany()
    ]);

    // 모드별 최근 브롤러 전투 요약 통계
    const dailyStatsQuery = this.userBattles
      .createQueryBuilder('uBattles')
      .select('DATE(uBattles.battleTime)', 'date')
      .addSelect('COUNT(*)', 'dailyTotalCount')
      .innerJoin(GameMaps, 'map', 'uBattles.mapID = map.id')
      .where('uBattles.userID = :id AND uBattles.playerID = :id', {
        id: `#${id}`
      })
      .andWhere('uBattles.matchType IN (:type)', {
        type: query.matchType
      })
      .andWhere('map.mode IN (:mode)', {
        mode: query.matchMode
      })
      .groupBy('DATE(uBattles.battleTime)');

    const dailyBrawlerStats = await this.userBattles
      .createQueryBuilder('uBattles')
      .select('uBattles.brawlerID', 'brawlerID')
      .addSelect('brawler.name', 'brawlerName')
      .addSelect('DATE(uBattles.battleTime)', 'date')
      .addSelect('COUNT(*)', 'matchCount')
      .addSelect(
        'SUM(CASE WHEN uBattles.gameResult = -1 THEN 1 ELSE 0 END)',
        'victoriesCount'
      )
      .addSelect(
        'SUM(CASE WHEN uBattles.gameResult = 1 THEN 1 ELSE 0 END)',
        'defeatsCount'
      )
      .addSelect('dailyBattles.dailyTotalCount', 'dailyTotalCount')
      .innerJoin(
        `(${dailyStatsQuery.getQuery()})`,
        'dailyBattles',
        'dailyBattles.date = DATE(uBattles.battleTime)'
      )
      .innerJoin('uBattles.brawler', 'brawler')
      .innerJoin(GameMaps, 'map', 'uBattles.mapID = map.id')
      .where('uBattles.userID = :id AND uBattles.playerID = :id', {
        id: `#${id}`
      })
      .andWhere('uBattles.matchType IN (:type)', {
        type: query.matchType
      })
      .andWhere('map.mode IN (:mode)', {
        mode: query.matchMode
      })
      .groupBy('DATE(uBattles.battleTime)')
      .addGroupBy('uBattles.brawlerID')
      .addGroupBy('brawler.name')
      .addGroupBy('dailyBattles.dailyTotalCount')
      .orderBy('date', 'ASC')
      .addOrderBy('brawler.id', 'ASC')
      .getRawMany();

    const groupedData = dailyBrawlerStats.reduce((acc, curr) => {
      const date = curr.date;
      if (!acc[date]) {
        acc[date] = {
          date: date,
          brawlers: []
        };
      }

      const pickPercentage = (curr.matchCount * 100) / curr.dailyTotalCount;
      const victoryRate =
        (curr.victoriesCount * 100) /
        (Number(curr.victoriesCount) + Number(curr.defeatsCount));

      acc[date].brawlers.push({
        brawlerID: curr.brawlerID,
        brawlerName: curr.brawlerName,
        matchCount: curr.matchCount,
        pickRate: parseFloat(((pickPercentage * 100) / 100).toFixed(2)),
        victoryRate: parseFloat(victoryRate.toFixed(2))
      });
      return acc;
    }, {});

    const dailyBrawlers = Object.values(groupedData);

    return { summaryBattles, dailyBrawlers };
  }

  /** 사용자 전투 상세 통계 및 전투 기록 정보 반환
   * @param id 사용자 ID
   * @param type 전투 타입
   * @param mode 전투 모드
   * @param stack */
  async selectUserBattleLogs(
    id: string,
    type: string,
    mode: string,
    stack: number
  ): Promise<SelectUserBattleLogsDto> {
    const season = this.seasonsService.getRecentSeason();
    const query = await this.getQuery(type, mode);
    const limit = 30 * stack;

    // 최근 전투 통계
    const recentUserBattles: SelectRecentUserBattlesDto[] =
      await this.userBattles
        .createQueryBuilder('uBattle')
        .select('uBattle.battleTime', 'battleTime')
        .addSelect('uBattle.duration', 'duration')
        .addSelect('uBattle.brawlerID', 'brawlerID')
        .addSelect('uBattle.gameResult', 'gameResult')
        .addSelect('uBattle.mapID', 'mapID')
        .addSelect('uBattle.isStarPlayer', 'isStarPlayer')
        .addSelect('map.mode', 'mode')
        .addSelect('map.name', 'mapName')
        .addSelect('brawler.name', 'brawlerName')
        .addSelect('brawler.role', 'role')
        .innerJoin('uBattle.brawler', 'brawler')
        .innerJoin(GameMaps, 'map', 'uBattle.mapID = map.id')
        .where('uBattle.userID = :id AND uBattle.playerID = :id', {
          id: `#${id}`
        })
        .andWhere('uBattle.battleTime BETWEEN :begin AND :end', {
          begin: season.beginDate,
          end: season.endDate
        })
        .andWhere('uBattle.matchType IN (:type)', {
          type: query.matchType
        })
        .andWhere('map.mode IN (:mode)', {
          mode: query.matchMode
        })
        .orderBy('uBattle.battleTime', 'DESC')
        .limit(limit)
        .getRawMany();

    // 시즌 사용한 브롤러 통계
    const counter = {};
    recentUserBattles.forEach(function (item) {
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

    const userBrawlerBattles: SelectUserBrawlerBattlesDto[] = Object.keys(
      counter
    )
      .map((brawlerID) => {
        const gameResultCounts = counter[brawlerID];
        const brawlerName = recentUserBattles.find(
          (brawler) => brawler.brawlerID === brawlerID
        ).brawlerName;

        return {
          brawlerID: brawlerID,
          brawlerName: brawlerName,
          resultCount: gameResultCounts,
          matchCount: Number(
            Object.values(gameResultCounts).reduce(
              (sum: number, count: number) => sum + count,
              0
            )
          )
        };
      })
      .sort(
        (
          a: {
            brawlerName: string;
            matchCount: number;
            resultCount: { '-1': number; '0': number; '1': number };
            brawlerID: string;
          },
          b: {
            brawlerName: string;
            matchCount: number;
            resultCount: { '-1': number; '0': number; '1': number };
            brawlerID: string;
          }
        ) => b.matchCount - a.matchCount
      );

    // 전투 기록 목록
    const userBattleLogs: SelectUserBattlesDto[] = await this.userBattles
      .createQueryBuilder('uBattle')
      .select('uBattle.userID', 'userID')
      .addSelect(
        'JSON_OBJECT(' +
          '"userID", uBattle.userID,' +
          '"battleTime", uBattle.battleTime,' +
          '"duration", uBattle.duration,' +
          '"matchType", uBattle.matchType,' +
          '"modeCode", uBattle.modeCode,' +
          '"matchGrade", uBattle.matchGrade,' +
          '"trophyChange", uBattle.trophyChange)',
        'battleInfo'
      )
      .addSelect(
        'JSON_ARRAYAGG(' +
          'JSON_OBJECT(' +
          '"playerID", uBattle.playerID,' +
          '"playerName", uBattle.playerName,' +
          '"teamNumber", uBattle.teamNumber,' +
          '"brawlerID", uBattle.brawlerID,' +
          '"brawlerPower", uBattle.brawlerPower,' +
          '"brawlerTrophies", uBattle.brawlerTrophies,' +
          '"gameRank", uBattle.gameRank,' +
          '"gameResult", uBattle.gameResult,' +
          '"isStarPlayer", uBattle.isStarPlayer))',
        'battlePlayers'
      )
      .innerJoin(GameMaps, 'map', 'uBattle.mapID = map.id')
      .where('uBattle.userID = :id', {
        id: `#${id}`
      })
      .andWhere('uBattle.battleTime BETWEEN :begin AND :end', {
        begin: season.beginDate,
        end: season.endDate
      })
      .andWhere('uBattle.matchType IN (:type)', {
        type: query.matchType
      })
      .andWhere('map.mode IN (:mode)', {
        mode: query.matchMode
      })
      .groupBy('uBattle.userID')
      .addGroupBy('uBattle.battleTime')
      .addGroupBy('uBattle.duration')
      .addGroupBy('uBattle.matchType')
      .addGroupBy('uBattle.modeCode')
      .addGroupBy('uBattle.matchGrade')
      .addGroupBy('uBattle.trophyChange')
      .orderBy('uBattle.battleTime', 'DESC')
      .limit(limit)
      .getRawMany()
      .then((result) => {
        return result.map((battle) => {
          return {
            battleInfo: Object.assign(
              battle.battleInfo,
              recentUserBattles.find((item) => {
                return (
                  new Date(battle.battleInfo.battleTime).toString() ===
                  new Date(item.battleTime).toString()
                );
              })
            ),
            battlePlayers: battle.battlePlayers
          };
        });
      });

    return { recentUserBattles, userBrawlerBattles, userBattleLogs };
  }

  /** 최근 시즌 및 게임 모드 정보 반환 */
  async selectUserBattleModes(id: string) {
    const modeTL = await this.userBrawlerBattles
      .createQueryBuilder('uBrawlerBattles')
      .select('uBrawlerBattles.mode', 'modeName')
      .where('uBrawlerBattles.userID = :id', {
        id: `#${id}`
      })
      .andWhere('uBrawlerBattles.matchType = 0')
      .addGroupBy('uBrawlerBattles.mode')
      .getRawMany()
      .then((results) => {
        const filterModeList = results.map((map) => map.modeName);

        filterModeList.unshift('all');
        return filterModeList;
      });

    const modePL = await this.userBrawlerBattles
      .createQueryBuilder('uBrawlerBattles')
      .select('uBrawlerBattles.mode', 'modeName')
      .where('uBrawlerBattles.userID = :id', {
        id: `#${id}`
      })
      .andWhere('uBrawlerBattles.matchType IN (2, 3)')
      .addGroupBy('uBrawlerBattles.mode')
      .getRawMany()
      .then((results) => {
        const filterModeList = results.map((map) => map.modeName);

        filterModeList.unshift('all');
        return filterModeList;
      });

    return {
      season: this.seasonsService.getRecentSeason(),
      modeTL,
      modePL
    };
  }

  /** 전투 타입 및 전투 모드
   * @param type 전투 타입
   * @param mode 전투 모드
   */
  private async getQuery(type: string, mode: string) {
    const match = {
      matchType: [],
      matchMode: []
    };

    if (type === '7') {
      match.matchType = await this.configService.getTypeList();
    } else {
      match.matchType = [type];
    }

    if (mode === 'all') {
      match.matchMode = await this.modesService.selectModeList();
    } else {
      match.matchMode = [mode];
    }

    return match;
  }
}
