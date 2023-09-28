import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserBattles } from '../entities/users.entity';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { DateService } from '../../date/date.service';
import { Users } from '../entities/users.entity';
import { UsersService } from './users.service';
import { GameConfigService } from '../../config/gameConfig.service';
import { SeasonsEntity } from '../../seasons/seasons.entity';
import { UserBrawlerBattles } from '../entities/userBrawlers.entity';
import { Maps } from '../../maps/entities/maps.entity';

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
  private battleStacks = [];
  private pendingRequests = [];
  private maxRequests = 4;

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
    private configService: GameConfigService,
  ) {}

  private async getQuery(type: string, mode: string) {
    const match = {
      MATCH_TYP: [],
      MATCH_MD: [],
    };

    if (type === '7') {
      match.MATCH_TYP = await this.configService.getTypeList();
    } else {
      match.MATCH_TYP = [type];
    }

    if (mode === 'all') {
      match.MATCH_MD = await this.configService.getModeList();
    } else {
      match.MATCH_MD = [mode];
    }

    return match;
  }

  async manageUsers(userID: string, cycle: boolean) {
    // 요청 정보 생성
    const requestInfo = { userID, cycle };

    if (this.battleStacks.length >= this.maxRequests) {
      // 최대 동시 실행 요청 수를 초과한 경우 대기열에 추가
      this.pendingRequests.push(requestInfo);
    } else {
      // 최대 동시 실행 요청 수 미만이면 바로 실행
      this.battleStacks.push(requestInfo);
      await this.getUserBattles(requestInfo);
    }
  }

  async getUserBattles(request: any) {
    const { userID, cycle } = request;

    try {
      await firstValueFrom(
        this.httpService.get(`players/%23${userID}/battlelog`).pipe(
          map(async (res) => {
            const battleLogs = res.data;
            await this.createUserBattles(battleLogs, userID);

            const newUserLastCheck = new Date();
            const newUserLastBattle = this.dateService.getDate(
              battleLogs?.items[0].battleTime,
            );

            await this.users
              .createQueryBuilder()
              .update()
              .set({
                USER_LST_CK: newUserLastCheck,
                USER_LST_BT: newUserLastBattle,
              })
              .where('USER_ID = :id', { id: `#${userID}` })
              .execute();

            if (cycle) {
              setTimeout(() => {
                this.manageUsers(userID, cycle);
              }, 20 * 60 * 1000);
            }
          }),
          catchError((e) => {
            return of(e);
          }),
        ),
      );
    } catch (err) {
      console.error(err.response?.data);
      const errorTime = err.response?.status === 404 ? 20 : 0;

      setTimeout(() => {
        this.manageUsers(userID, cycle);
      }, (5 + errorTime) * 60 * 1000);
    } finally {
      // 요청이 완료되면 다음 요청을 확인하고 실행
      const index = this.battleStacks.indexOf(request);
      if (index !== -1) {
        this.battleStacks.splice(index, 1);
      }

      setTimeout(async () => {
        const nextRequest = this.pendingRequests.shift();
        if (nextRequest) {
          const { userID, cycle } = nextRequest;
          await this.manageUsers(userID, cycle);
        }
      }, Math.floor(Math.random() * 10001) + 60000);
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
      .then((result) => result.USER_LST_BT);
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
                      USER_ID: userTag,
                      PLAYER_ID: players[playerNumber].tag,
                      BRAWLER_ID: brawler.id,
                      MATCH_DT: matchDate,
                      MAP_ID: item.event.id,
                      MAP_MD_CD: mapModeNumber,
                      MATCH_TYP: matchType,
                      MATCH_TYP_RAW: typeIndex,
                      MATCH_GRD: matchGrade,
                      MATCH_DUR: duration,
                      MATCH_RNK: matchRank,
                      MATCH_RES: matchResult,
                      MATCH_CHG: 0,
                      MATCH_CHG_RAW: brawler.trophyChange,
                      PLAYER_NM: players[playerNumber].name,
                      PLAYER_TM_NO: parseInt(teamNumber),
                      PLAYER_SP_BOOL: false,
                      BRAWLER_PWR: brawler.power,
                      BRAWLER_TRP: brawler.trophies,
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
                    USER_ID: userTag,
                    PLAYER_ID: players[playerNumber].tag,
                    BRAWLER_ID: players[playerNumber].brawler.id,
                    MATCH_DT: matchDate,
                    MAP_ID: item.event.id,
                    MAP_MD_CD: mapModeNumber,
                    MATCH_TYP: matchType,
                    MATCH_TYP_RAW: typeIndex,
                    MATCH_GRD: matchGrade,
                    MATCH_DUR: duration,
                    MATCH_RNK: matchRank,
                    MATCH_RES: matchResult,
                    MATCH_CHG: matchChange,
                    MATCH_CHG_RAW: 0,
                    PLAYER_NM: players[playerNumber].name,
                    PLAYER_TM_NO: [1, 2].includes(mapModeNumber)
                      ? matchRank
                      : parseInt(teamNumber),
                    PLAYER_SP_BOOL: isStarPlayer,
                    BRAWLER_PWR: players[playerNumber].brawler.power,
                    BRAWLER_TRP: players[playerNumber].brawler.trophies,
                  });
                }
              }
            }
          }

          if (matchType === 6) {
            await this.userBattles
              .createQueryBuilder()
              .update()
              .set({
                MATCH_TYP: matchType,
              })
              .where('USER_ID = :id AND MATCH_DT = :date', {
                id: userTag,
                date: matchDate,
              })
              .execute();
          }
        }
      }
    } // battleLogs 탐색 종료

    await this.userBattles.save(battles);
  }

  async findUserBattles(
    id: string,
    type: string,
    mode: string,
    season: SeasonsEntity,
  ) {
    const query = await this.getQuery(type, mode);

    const userBattles = [
      await this.userBattles
        .createQueryBuilder('ub')
        .select('DATE_FORMAT(ub.MATCH_DT, "%Y-%m-%d")', 'day')
        .addSelect('COUNT(ub.MATCH_DT)', 'value')
        .innerJoin(Maps, 'm', 'ub.MAP_ID = m.MAP_ID')
        .where('ub.USER_ID = :id AND PLAYER_ID = :id', {
          id: `#${id}`,
        })
        .andWhere('ub.MATCH_DT BETWEEN :begin AND :end', {
          begin: season.SEASON_BGN_DT,
          end: season.SEASON_END_DT,
        })
        .andWhere('ub.MATCH_TYP IN (:type)', {
          type: query.MATCH_TYP,
        })
        .andWhere('m.MAP_MD IN (:mode)', {
          mode: query.MATCH_MD,
        })
        .groupBy('DATE_FORMAT(ub.MATCH_DT, "%Y-%m-%d")')
        .getRawMany(),
      await this.userBattles
        .createQueryBuilder('ub')
        .select('DATE_FORMAT(ub.MATCH_DT, "%Y-%m-%d")', 'day')
        .addSelect(
          'SUM(CASE WHEN ub.MATCH_TYP NOT IN (4, 5) THEN ub.MATCH_CHG ELSE 0 END)',
          'value',
        )
        .innerJoin(Maps, 'm', 'ub.MAP_ID = m.MAP_ID')
        .where('ub.USER_ID = :id AND PLAYER_ID = :id', {
          id: `#${id}`,
        })
        .andWhere('ub.MATCH_DT BETWEEN :begin AND :end', {
          begin: season.SEASON_BGN_DT,
          end: season.SEASON_END_DT,
        })
        .andWhere('ub.MATCH_TYP IN (:type)', {
          type: query.MATCH_TYP,
        })
        .andWhere('m.MAP_MD IN (:mode)', {
          mode: query.MATCH_MD,
        })
        .groupBy('DATE_FORMAT(ub.MATCH_DT, "%Y-%m-%d")')
        .getRawMany(),
    ];

    const userBrawlers = await this.userBrawlerBattles
      .createQueryBuilder('ubb')
      .select('ubb.BRAWLER_ID', 'BRAWLER_ID')
      .addSelect('SUM(ubb.MATCH_CNT)', 'MATCH_CNT')
      .addSelect(
        'ROUND(SUM(ubb.MATCH_CNT) * 100 / SUM(SUM(ubb.MATCH_CNT)) OVER(), 2)',
        'MATCH_PCK_R',
      )
      .addSelect(
        'ROUND(SUM(ubb.MATCH_CNT_VIC) * 100 / SUM(ubb.MATCH_CNT_VIC + ubb.MATCH_CNT_DEF), 2)',
        'MATCH_VIC_R',
      )
      .addSelect('b.BRAWLER_NM', 'BRAWLER_NM')
      .innerJoin('ubb.brawler', 'b')
      .innerJoin('ubb.map', 'm')
      .where('ubb.USER_ID = :id', {
        id: `#${id}`,
      })
      .andWhere('ubb.MATCH_TYP IN (:type)', {
        type: query.MATCH_TYP,
      })
      .andWhere('m.MAP_MD IN (:mode)', {
        mode: query.MATCH_MD,
      })
      .groupBy('ubb.BRAWLER_ID')
      .addGroupBy('b.BRAWLER_NM')
      .orderBy('MATCH_CNT', 'DESC')
      .limit(5)
      .getRawMany();

    return [userBattles, userBrawlers];
  }

  async findUserBattleLogs(
    id: string,
    type: string,
    mode: string,
    season: SeasonsEntity,
  ) {
    const query = await this.getQuery(type, mode);

    const userRecentBattles = await this.userBattles
      .createQueryBuilder('ub')
      .select('ub.MATCH_DT', 'MATCH_DT')
      .addSelect('ub.MATCH_DUR', 'MATCH_DUR')
      .addSelect('ub.BRAWLER_ID', 'BRAWLER_ID')
      .addSelect('ub.MATCH_RES', 'MATCH_RES')
      .addSelect('ub.MAP_ID', 'MAP_ID')
      .addSelect('ub.PLAYER_SP_BOOL', 'PLAYER_SP_BOOL')
      .addSelect('m.MAP_MD', 'MAP_MD')
      .addSelect('m.MAP_NM', 'MAP_NM')
      .addSelect('b.BRAWLER_NM', 'BRAWLER_NM')
      .addSelect('b.BRAWLER_CL', 'BRAWLER_CL')
      .innerJoin('ub.brawler', 'b')
      .innerJoin(Maps, 'm', 'ub.MAP_ID = m.MAP_ID')
      .where('ub.USER_ID = :id AND PLAYER_ID = :id', {
        id: `#${id}`,
      })
      .andWhere('ub.MATCH_DT BETWEEN :begin AND :end', {
        begin: season.SEASON_BGN_DT,
        end: season.SEASON_END_DT,
      })
      .andWhere('ub.MATCH_TYP IN (:type)', {
        type: query.MATCH_TYP,
      })
      .andWhere('m.MAP_MD IN (:mode)', {
        mode: query.MATCH_MD,
      })
      .orderBy('MATCH_DT', 'DESC')
      .take(30)
      .getRawMany();

    const counter = {};

    userRecentBattles.forEach(function (item) {
      const brawlerID = item.BRAWLER_ID;
      const matchRes = item.MATCH_RES;

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
      const brawlerName = userRecentBattles.find(
        (brawler) => brawler.BRAWLER_ID === brawlerID,
      ).BRAWLER_NM;

      return {
        BRAWLER_ID: brawlerID,
        BRAWLER_NM: brawlerName,
        MATCH_CNT_RES: matchResultCounts,
        MATCH_CNT_TOT: Object.values(matchResultCounts).reduce(
          (sum: number, count: number) => sum + count,
          0,
        ),
      };
    });

    const userRecentBrawlers = brawlerCounts
      .sort(
        (
          a: {
            BRAWLER_NM: string;
            MATCH_CNT_TOT: number;
            MATCH_CNT_RES: number;
            BRAWLER_ID: string;
          },
          b: {
            BRAWLER_NM: string;
            MATCH_CNT_TOT: number;
            MATCH_CNT_RES: number;
            BRAWLER_ID: string;
          },
        ) => b.MATCH_CNT_TOT - a.MATCH_CNT_TOT,
      )
      .slice(0, 6);

    const userBattles = await this.userBattles
      .createQueryBuilder('ub')
      .select('ub.USER_ID', 'USER_ID')
      .addSelect(
        'JSON_OBJECT(' +
          '"USER_ID", ub.USER_ID,' +
          '"MATCH_DT", ub.MATCH_DT,' +
          '"MATCH_DUR", ub.MATCH_DUR,' +
          '"MATCH_TYP", ub.MATCH_TYP,' +
          '"MAP_MD_CD", ub.MAP_MD_CD,' +
          '"MATCH_GRD", ub.MATCH_GRD,' +
          '"MATCH_CHG", ub.MATCH_CHG)',
        'BATTLE_INFO',
      )
      .addSelect(
        'JSON_ARRAYAGG(' +
          'JSON_OBJECT(' +
          '"PLAYER_ID", ub.PLAYER_ID,' +
          '"PLAYER_NM", ub.PLAYER_NM,' +
          '"PLAYER_TM_NO", ub.PLAYER_TM_NO,' +
          '"BRAWLER_ID", ub.BRAWLER_ID,' +
          '"BRAWLER_PWR", ub.BRAWLER_PWR,' +
          '"BRAWLER_TRP", ub.BRAWLER_TRP,' +
          '"MATCH_RNK", ub.MATCH_RNK,' +
          '"MATCH_RES", ub.MATCH_RES,' +
          '"PLAYER_SP_BOOL", ub.PLAYER_SP_BOOL))',
        'BATTLE_PLAYERS',
      )
      .innerJoin(Maps, 'm', 'ub.MAP_ID = m.MAP_ID')
      .where('ub.USER_ID = :id', {
        id: `#${id}`,
      })
      .andWhere('ub.MATCH_DT BETWEEN :begin AND :end', {
        begin: season.SEASON_BGN_DT,
        end: season.SEASON_END_DT,
      })
      .andWhere('ub.MATCH_TYP IN (:type)', {
        type: query.MATCH_TYP,
      })
      .andWhere('m.MAP_MD IN (:mode)', {
        mode: query.MATCH_MD,
      })
      .groupBy('ub.USER_ID')
      .addGroupBy('ub.MATCH_DT')
      .addGroupBy('ub.MATCH_DUR')
      .addGroupBy('ub.MATCH_TYP')
      .addGroupBy('ub.MAP_MD_CD')
      .addGroupBy('ub.MATCH_GRD')
      .addGroupBy('ub.MATCH_CHG')
      .orderBy('ub.MATCH_DT', 'DESC')
      .take(30)
      .getRawMany()
      .then((result) => {
        return result.map((battle) => {
          return {
            BATTLE_INFO: Object.assign(
              battle.BATTLE_INFO,
              userRecentBattles.find(
                (item) =>
                  new Date(battle.BATTLE_INFO.MATCH_DT).toString() ===
                  new Date(item.MATCH_DT).toString(),
              ),
            ),
            BATTLE_PLAYERS: battle.BATTLE_PLAYERS,
          };
        });
      });

    return [userRecentBattles, userRecentBrawlers, userBattles];
  }
}
