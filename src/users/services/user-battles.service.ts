import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '~/users/entities/users.entity';
import { UserBattles } from '~/users/entities/users.entity';
import { Maps } from '~/maps/entities/maps.entity';
import { Seasons } from '~/seasons/entities/seasons.entity';

import { HttpService } from '@nestjs/axios';
import { UsersService } from './users.service';
import { DateService } from '~/utils/date.service';
import { UserBrawlerBattles } from '~/users/entities/user-brawlers.entity';

import { AppConfigService } from '~/configs/app-config.service';

import { catchError, firstValueFrom, map, of } from 'rxjs';

const typeNameArray = [
  'ranked',
  'friendly',
  'soloRanked',
  'teamRanked',
  'challenge',
  'championshipChallenge',
];
const resultNameArray = ['victory', 'draw', 'defeat'];

@Injectable()
export class UserBattlesService {
  constructor(
    @InjectRepository(Users)
    private users: Repository<Users>,
    @InjectRepository(UserBattles)
    private userBattles: Repository<UserBattles>,
    @InjectRepository(UserBrawlerBattles)
    private userBrawlerBattles: Repository<UserBrawlerBattles>,
    private readonly usersService: UsersService,
    private readonly dateService: DateService,
    private readonly httpService: HttpService,
    private configService: AppConfigService,
  ) {}

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

  async getUserBattles(userID: string) {
    try {
      await firstValueFrom(
        this.httpService.get(`players/%23${userID}/battlelog`).pipe(
          map(async (res) => {
            const battleLogs = res.data;
            await this.createUserBattles(battleLogs, userID);

            const newUserLastBattle = this.dateService.getDate(
              battleLogs?.items[0].battleTime,
            );

            await this.users
              .createQueryBuilder()
              .update()
              .set({
                lastBattleAt: newUserLastBattle,
                updatedAt: new Date(),
              })
              .where('USER_ID = :id', { id: `#${userID}` })
              .execute();
          }),
          catchError((e) => {
            return of(e);
          }),
        ),
      );
    } catch (err) {
      Logger.error(err);
    }
  }

  async createUserBattles(battleLogs: any, userID: string) {
    const playersJSON = { teams: '' };

    // 게임 타입을 클럽 리그와 일반 게임 & 파워 리그 구분
    const getType = async (
      typeNumber: number,
      trophyChange: number,
      maxTrophies: number,
      currentPlayers: any,
      matchMode: number,
    ) => {
      if (typeNumber === 3 && [3, 5, 7, 9].includes(trophyChange)) {
        playersJSON.teams = currentPlayers;
        return 6;
      } else if (
        typeNumber === 0 &&
        [1, 2, 3, 4].includes(trophyChange) &&
        maxTrophies < 20 &&
        matchMode === 3
      ) {
        return 6;
      } else if (
        typeNumber === 3 &&
        playersJSON.teams === currentPlayers &&
        maxTrophies < 20
      ) {
        return 6;
      } else {
        playersJSON.teams = '';
        return typeNumber;
      }
    };

    const getGrade = async (matchType: number, highestTrophies: number) => {
      if ([2, 3, 6].includes(matchType)) {
        return highestTrophies;
      } else if ([4, 5].includes(matchType)) {
        return Math.floor(highestTrophies / 100);
      } else {
        if (highestTrophies < 40) {
          return 0;
        } else if (highestTrophies >= 40 && highestTrophies < 140) {
          return 1;
        } else if (highestTrophies >= 140 && highestTrophies < 300) {
          return 2;
        } else if (highestTrophies >= 300 && highestTrophies < 500) {
          return 3;
        } else if (highestTrophies >= 500 && highestTrophies < 750) {
          return 4;
        } else if (highestTrophies >= 750 && highestTrophies < 1000) {
          return 5;
        } else if (highestTrophies >= 1000 && highestTrophies < 1250) {
          return 6;
        } else {
          return 7;
        }
      }
    };

    // 전투 결과 수치형으로 변환
    const getResult = (teams: number, rank: number, result: number) => {
      if (teams > 2) {
        const rankDivide = rank / (2 / (10 / teams));
        if (rankDivide < 2) {
          return -1;
        } else if (rankDivide < 3) {
          return 0;
        } else {
          return 1;
        }
      } else {
        return result;
      }
    };

    const userTag = `#${userID}`;

    const userLastUpdate = await this.usersService
      .findUser(userID)
      .then((result) => result.lastBattleAt);
    const lastBattleDate = new Date(userLastUpdate);
    const lastBattleDateResponse = this.dateService.getDate(
      battleLogs?.items[0].battleTime,
    );
    const battles = [];

    if (lastBattleDate.toString() !== lastBattleDateResponse.toString()) {
      for (const item of battleLogs?.items) {
        if (item.event.id !== 0 && item.battle.type !== undefined) {
          const matchDate = this.dateService.getDate(item.battleTime);
          const duration =
            item.battle.duration != null && item.battle.duration > 0
              ? item.battle.duration
              : 0;
          const typeIndex = typeNameArray.indexOf(item.battle.type);

          const mapModeNumber: number = (
            await this.configService.getModeClass()
          ).tripleModes.includes(item.event.mode)
            ? 3
            : (await this.configService.getModeClass()).duoModes.includes(
                item.event.mode,
              )
            ? 2
            : (
                await this.configService.getModeClass()
              ).soloModes.survive.includes(item.event.mode)
            ? 1
            : 0;
          const matchChange =
            item.battle.trophyChange !== undefined
              ? item.battle.trophyChange
              : 0;

          const teams =
            item.battle.teams !== undefined
              ? item.battle.teams
              : item.battle.players;
          const currentPlayers = JSON.stringify(teams);
          const highestTrophies = Math.max(
            ...teams.map((team) => {
              if ([3, 2].includes(mapModeNumber)) {
                return Math.max(
                  ...team.map((player) => {
                    return player.brawler.trophies;
                  }),
                );
              } else if (mapModeNumber === 0) {
                return Math.max(
                  ...team.brawlers.map((brawler) => {
                    return brawler.trophies;
                  }),
                );
              } else {
                return team.brawler.trophies;
              }
            }),
          );

          const matchType = await getType(
            typeIndex,
            matchChange,
            highestTrophies,
            currentPlayers,
            mapModeNumber,
          );
          const matchGrade = await getGrade(matchType, highestTrophies);

          if (new Date(lastBattleDate) < matchDate) {
            const match = {
              result: resultNameArray.indexOf(item.battle.result) - 1,
              brawler: 0,
            };

            for (const teamNumber in teams) {
              const players = [2, 3].includes(mapModeNumber)
                ? teams[teamNumber]
                : teams;
              const teamResult = players
                .map((item) => item.tag)
                .includes(userTag)
                ? resultNameArray.indexOf(item.battle.result) - 1
                : (resultNameArray.indexOf(item.battle.result) - 1) * -1;

              for (const playerNumber in players) {
                const matchRank: number =
                  mapModeNumber === 1
                    ? parseInt(playerNumber)
                    : mapModeNumber === 2
                    ? parseInt(teamNumber)
                    : -1;
                const matchResult = getResult(
                  teams.length,
                  matchRank,
                  teamResult,
                );

                if (mapModeNumber === 0) {
                  for (const brawler of players[playerNumber]?.brawlers) {
                    battles.push(<UserBattles>{
                      userID: userTag,
                      playerID: players[playerNumber].tag,
                      brawlerID: brawler.id,
                      matchDate: matchDate,
                      mapID: item.event.id,
                      modeCode: mapModeNumber,
                      matchType: matchType,
                      matchTypeRaw: typeIndex,
                      matchGrade: matchGrade,
                      duration: duration,
                      matchRank: matchRank,
                      matchResult: matchResult,
                      matchChange: 0,
                      matchChangeRaw: brawler.trophyChange,
                      playerName: players[playerNumber].name,
                      teamNumber: parseInt(teamNumber),
                      isStarPlayer: false,
                      brawlerPower: brawler.power,
                      brawlerTrophies: brawler.trophies,
                    });
                  }
                } else {
                  const isStarPlayer =
                    item.battle.starPlayer !== undefined &&
                    item.battle.starPlayer !== null &&
                    players[playerNumber].tag === item.battle.starPlayer.tag;

                  if (players[playerNumber].tag === userTag) {
                    match.result = matchResult;
                    match.brawler = players[playerNumber].brawler.id;
                  }

                  battles.push(<UserBattles>{
                    userID: userTag,
                    playerID: players[playerNumber].tag,
                    brawlerID: players[playerNumber].brawler.id,
                    matchDate: matchDate,
                    mapID: item.event.id,
                    modeCode: mapModeNumber,
                    matchType: matchType,
                    matchTypeRaw: typeIndex,
                    matchGrade: matchGrade,
                    duration: duration,
                    matchRank: matchRank,
                    matchResult: matchResult,
                    matchChange: matchChange,
                    matchChangeRaw: 0,
                    playerName: players[playerNumber].name,
                    teamNumber: [1, 2].includes(mapModeNumber)
                      ? matchRank
                      : parseInt(teamNumber),
                    isStarPlayer: isStarPlayer,
                    brawlerPower: players[playerNumber].brawler.power,
                    brawlerTrophies: players[playerNumber].brawler.trophies,
                  });
                }
              }
            }
          }

          if (matchType === 6) {
            await this.userBattles
              .createQueryBuilder('ub')
              .update()
              .set({
                matchType: matchType,
              })
              .where('USER_ID = :id', {
                id: userTag,
              })
              .andWhere('MATCH_DT = :date', {
                date: matchDate,
              })
              .execute();
          }
        }
      }
    } // battleLogs 탐색 종료

    await this.userBattles
      .createQueryBuilder()
      .insert()
      .into('USER_BATTLES')
      .values(battles)
      .orIgnore()
      .execute();
  }

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
        .select('DATE_FORMAT(ub.matchDate, "%Y-%m-%d")', 'day')
        .addSelect('COUNT(ub.matchDate)', 'value')
        .innerJoin(Maps, 'm', 'ub.mapID = m.mapID')
        .where('ub.userID = :id AND ub.playerID = :id', {
          id: `#${id}`,
        })
        .andWhere('ub.matchDate BETWEEN :begin AND :end', {
          begin: season.beginDate,
          end: season.endDate,
        })
        .andWhere('ub.matchType IN (:type)', {
          type: query.matchType,
        })
        .andWhere('m.mode IN (:mode)', {
          mode: query.matchMode,
        })
        .groupBy('DATE_FORMAT(ub.matchDate, "%Y-%m-%d")')
        .getRawMany(),
      await this.userBattles
        .createQueryBuilder('ub')
        .select('DATE_FORMAT(ub.matchDate, "%Y-%m-%d")', 'day')
        .addSelect(
          'SUM(CASE WHEN ub.matchType NOT IN (4, 5) THEN ub.matchChange ELSE 0 END)',
          'value',
        )
        .innerJoin(Maps, 'm', 'ub.mapID = m.mapID')
        .where('ub.userID = :id AND ub.playerID = :id', {
          id: `#${id}`,
        })
        .andWhere('ub.matchDate BETWEEN :begin AND :end', {
          begin: season.beginDate,
          end: season.endDate,
        })
        .andWhere('ub.matchType IN (:type)', {
          type: query.matchType,
        })
        .andWhere('m.mode IN (:mode)', {
          mode: query.matchMode,
        })
        .groupBy('DATE_FORMAT(ub.matchDate, "%Y-%m-%d")')
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
        'ROUND(SUM(ubb.victoryCount) * 100 / SUM(ubb.victoryCount + ubb.defeatCount), 2)',
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
      .select('ub.matchDate', 'matchDate')
      .addSelect('ub.duration', 'duration')
      .addSelect('ub.brawlerID', 'brawlerID')
      .addSelect('ub.matchResult', 'matchResult')
      .addSelect('ub.mapID', 'mapID')
      .addSelect('ub.isStarPlayer', 'isStarPlayer')
      .addSelect('m.mode', 'mode')
      .addSelect('m.name', 'mapName')
      .addSelect('b.name', 'brawlerName')
      .addSelect('b.role', 'role')
      .innerJoin('ub.brawler', 'b')
      .innerJoin(Maps, 'm', 'ub.mapID = m.mapID')
      .where('ub.userID = :id AND ub.playerID = :id', {
        id: `#${id}`,
      })
      .andWhere('ub.matchDate BETWEEN :begin AND :end', {
        begin: season.beginDate,
        end: season.endDate,
      })
      .andWhere('ub.matchType IN (:type)', {
        type: query.matchType,
      })
      .andWhere('m.mode IN (:mode)', {
        mode: query.matchMode,
      })
      .orderBy('ub.matchDate', 'DESC')
      .limit(30)
      .getRawMany();

    const counter = {};

    recentBattles.forEach(function (item) {
      const brawlerID = item.brawlerID;
      const matchRes = item.matchResult;

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
      const matchResultCounts = counter[brawlerID];
      const brawlerName = recentBattles.find(
        (brawler) => brawler.brawlerID === brawlerID,
      ).brawlerName;

      return {
        brawlerID: brawlerID,
        brawlerName: brawlerName,
        resultCount: matchResultCounts,
        matchCount: Object.values(matchResultCounts).reduce(
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
          '"matchDate", ub.matchDate,' +
          '"duration", ub.duration,' +
          '"matchType", ub.matchType,' +
          '"modeCode", ub.modeCode,' +
          '"matchGrade", ub.matchGrade,' +
          '"matchChange", ub.matchChange)',
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
          '"matchRank", ub.matchRank,' +
          '"matchResult", ub.matchResult,' +
          '"isStarPlayer", ub.isStarPlayer))',
        'BATTLE_PLAYERS',
      )
      .innerJoin(Maps, 'm', 'ub.mapID = m.mapID')
      .where('ub.userID = :id', {
        id: `#${id}`,
      })
      .andWhere('ub.matchDate BETWEEN :begin AND :end', {
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
      .addGroupBy('ub.matchDate')
      .addGroupBy('ub.duration')
      .addGroupBy('ub.matchType')
      .addGroupBy('ub.modeCode')
      .addGroupBy('ub.matchGrade')
      .addGroupBy('ub.matchChange')
      .orderBy('ub.matchDate', 'DESC')
      .limit(30)
      .getRawMany()
      .then((result) => {
        return result.map((battle) => {
          return {
            BATTLE_INFO: Object.assign(
              battle.BATTLE_INFO,
              recentBattles.find(
                (item) =>
                  new Date(battle.BATTLE_INFO.matchDate).toString() ===
                  new Date(item.matchDate).toString(),
              ),
            ),
            BATTLE_PLAYERS: battle.BATTLE_PLAYERS,
          };
        });
      });

    return [recentBattles, recentBrawlers, battles];
  }
}
