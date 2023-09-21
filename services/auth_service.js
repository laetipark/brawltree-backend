import axios from "axios";
import {Op} from "sequelize";
import {
    sequelize,
    Users,
    UserProfile,
    UserBattles,
    UserBrawlers,
    UserBrawlerItems,
} from "../models/index.js";

import {dateService} from "./date_service.js";
import {battleService} from "./battle_service.js";
import {seasonService} from "./season_service.js";

import config from "../config/config.js";

const typeNameArray = ["ranked", "friendly", "soloRanked", "teamRanked", "challenge", "championshipChallenge"];
const resultNameArray = ["victory", "draw", "defeat"];

export class authService {
    static userBattles = [];
    static pendingRequests = [];
    static maxRequests = 4;

    static fetchUserRequest = async (userID) => {
        return await axios({
            url: `${config.url}/players/%23${userID}`,
            method: "GET",
            headers: config.headers,
        }).then(res => {
            return res.data;
        }).catch(err => console.error(err));
    };

    /** 유저 정보 데이터베이스에 추가
     * @param userID 유저 태그
     */
    static insertUsers = async (userID) => {
        const user = this.fetchUserRequest(userID);

        if (user.tag !== undefined) {
            const user = await Users.findOrCreate({
                where: {
                    USER_ID: `#${userID}`,
                },
                defaults: {
                    USER_LST_CK: new Date(0),
                    USER_LST_BT: new Date(0),
                }
            });

            await this.updateUserProfile(user);
            await battleService.updateUserBattles(userID);
            if (new Date(new Date(user[0].USER_LST_CK).getTime() + (5 * 60 * 1000)) < new Date()) {
                await this.manageUsers(userID, false);
            }
        } else {

        }
    };

    /** 멤버 기록과 소유 브롤러 정보 데이터베이스에 추가
     * @param user 멤버 json
     */
    static updateUserProfile = async (user) => {
        const season = await seasonService.selectRecentSeason();
        const getRankPL = (typeNum, tag, column) => {
            return UserBattles.findOne({
                attributes: ["BRAWLER_TRP"],
                where: {
                    USER_ID: tag,
                    PLAYER_ID: tag,
                    MATCH_TYP: typeNum,
                },
                order: [[column, "DESC"]],
            }).then(result => {
                return result != null ? result.BRAWLER_TRP - 1 : 0;
            });
        };

        const getTrophyBegin = (tag, brawlerID, current) => {
            return UserBattles.findOne({
                attributes: ["BRAWLER_TRP"],
                where: {
                    USER_ID: tag,
                    PLAYER_ID: tag,
                    BRAWLER_ID: brawlerID,
                    MATCH_TYP: 0,
                    MATCH_DT: {
                        [Op.gt]: [season.SEASON_BGN_DT]
                    },
                },
                order: [["MATCH_DT", "ASC"]],
            }).then(result => {
                return result != null ? result.BRAWLER_TRP : current;
            });
        };

        if (user.tag !== undefined) {
            const [soloRankCurrent, teamRankCurrent, soloRankHighest, teamRankHighest] =
                await Promise.all([getRankPL(2, user.tag, "MATCH_DT"),
                    getRankPL(3, user.tag, "MATCH_DT"),
                    getRankPL(2, user.tag, "BRAWLER_TRP"),
                    getRankPL(3, user.tag, "BRAWLER_TRP")]);

            const brawlers = [];
            const brawlerItems = [];
            const brawlerItemIDs = [];
            user.brawlers.map(async brawler => {
                const brawlerID = brawler.id;
                const brawlerPower = brawler.power;
                const trophyBegin = await getTrophyBegin(user.tag, brawlerID, brawler.trophies);

                brawlers.push({
                    USER_ID: user.tag,
                    BRAWLER_ID: brawlerID,
                    BRAWLER_PWR: brawlerPower,
                    TROPHY_BGN: trophyBegin,
                    TROPHY_CUR: brawler.trophies,
                    TROPHY_HGH: brawler.highestTrophies,
                    TROPHY_RNK: brawler.rank,
                });

                const gears = brawler.gears;
                const starPowers = brawler.starPowers;
                const gadgets = brawler.gadgets;

                gears.map(async gear => {
                    brawlerItems.push({
                        USER_ID: user.tag,
                        BRAWLER_ID: brawlerID,
                        ITEM_ID: gear.id,
                        ITEM_K: "gear",
                        ITEM_NM: gear.name,
                    });
                    brawlerItemIDs.push(gear.id);
                });

                starPowers.map(async starPower => {
                    brawlerItems.push({
                        USER_ID: user.tag,
                        BRAWLER_ID: brawlerID,
                        ITEM_ID: starPower.id,
                        ITEM_K: "starPower",
                        ITEM_NM: starPower.name,
                    });
                    brawlerItemIDs.push(starPower.id);
                });

                gadgets.map(async gadget => {
                    brawlerItems.push({
                        USER_ID: user.tag,
                        BRAWLER_ID: brawlerID,
                        ITEM_ID: gadget.id,
                        ITEM_K: "gadget",
                        ITEM_NM: gadget.name,
                    });
                    brawlerItemIDs.push(gadget.id);
                });
            });

            await sequelize.transaction(async (t) => {
                await UserProfile.upsert({
                    USER_ID: user.tag,
                    USER_NM: user.name,
                    USER_PRFL: user.icon.id,
                    CLUB_ID: user.club.tag,
                    CLUB_NM: user.club.name,
                    TROPHY_CUR: user.trophies,
                    TROPHY_HGH: user.highestTrophies,
                    VICTORY_TRP: user["3vs3Victories"],
                    VICTORY_DUO: user.duoVictories,
                    BRAWLER_RNK_25: user.brawlers.filter((brawler) => brawler.rank >= 25).length,
                    BRAWLER_RNK_30: user.brawlers.filter((brawler) => brawler.rank >= 30).length,
                    BRAWLER_RNK_35: user.brawlers.filter((brawler) => brawler.rank >= 35).length,
                    PL_SL_CUR: soloRankCurrent,
                    PL_SL_HGH: soloRankHighest,
                    PL_TM_CUR: teamRankCurrent,
                    PL_TM_HGH: teamRankHighest,
                }, {
                    transaction: t
                });

                await UserBrawlers.bulkCreate(brawlers, {
                    ignoreDuplicates: true,
                    updateOnDuplicate: [
                        "BRAWLER_PWR", "TROPHY_BGN",
                        "TROPHY_CUR", "TROPHY_HGH", "TROPHY_RNK",
                    ],
                    transaction: t
                });
                await UserBrawlerItems.bulkCreate(brawlerItems, {
                    ignoreDuplicates: true,
                    transaction: t
                });

                await UserBrawlerItems.destroy({
                    where: {
                        USER_ID: user.tag,
                        ITEM_ID: {
                            [Op.notIn]: brawlerItemIDs
                        }
                    },
                    transaction: t
                });
            }); // transaction 종료
        }
    };

    static manageUsers = async (userID, cycle) => {
        // 요청 정보 생성
        const requestInfo = {userID, cycle};

        if (this.userBattles.length >= this.maxRequests) {
            // 최대 동시 실행 요청 수를 초과한 경우 대기열에 추가
            this.pendingRequests.push(requestInfo);
        } else {
            // 최대 동시 실행 요청 수 미만이면 바로 실행
            this.userBattles.push(requestInfo);
            await this.fetchBattleRequest(requestInfo);
        }
    };

    static fetchBattleRequest = async requestInfo => {
        const {userID, cycle} = requestInfo;

        try {
            await axios({
                url: `${config.url}/players/%23${userID}/battlelog`,
                method: "GET",
                headers: config.headers,
            }).then(async res => {

                const battleLogs = res.data;
                await this.insertUserBattles(battleLogs, userID);

                const newUserLastCheck = new Date();
                const newUserLastBattle = dateService.getDate(battleLogs?.items[0].battleTime);

                await Users.update({
                    USER_LST_CK: newUserLastCheck,
                    USER_LST_BT: newUserLastBattle
                }, {
                    where: {
                        USER_ID: `#${userID}`,
                    },
                });

                if (cycle) {
                    setTimeout(() => {
                        this.manageUsers(userID, cycle);
                    }, 20 * 60 * 1000);
                }
            });
        } catch (err) {
            console.error(err.response?.data);
            const errorTime = err.response?.status === 404 ? 20 : 0;

            setTimeout(() => {
                this.manageUsers(userID, cycle);
            }, (5 + errorTime) * 60 * 1000);
        } finally {
            // 요청이 완료되면 다음 요청을 확인하고 실행
            const index = this.userBattles.indexOf(requestInfo);
            if (index !== -1) {
                this.userBattles.splice(index, 1);
            }

            setTimeout(async () => {
                const nextRequest = this.pendingRequests.shift();
                if (nextRequest) {
                    const {userID, cycle} = nextRequest;
                    await this.manageUsers(userID, cycle);
                }
            }, (Math.floor(Math.random() * 10001) + 60000));
        }
    };

    /** 최신 25개 전투 정보 확인 및 데이터베이스에 추가
     * @param battleLogs
     * @param userID 유저 태그
     */
    static insertUserBattles = async (battleLogs, userID) => {
        const playersJSON = {teams: ""};

        // 게임 타입을 클럽 리그와 일반 게임 & 파워 리그 구분
        const getType = async (typeNumber, trophyChange, maxTrophies, currentPlayers, matchMode) => {
            if (typeNumber === 3 && [3, 5, 7, 9].includes(trophyChange)) {
                playersJSON.teams = currentPlayers;
                return 6;
            } else if (typeNumber === 0 && [1, 2, 3, 4].includes(trophyChange) && maxTrophies < 20 && matchMode === 3) {
                return 6;
            } else if (typeNumber === 3 && playersJSON.teams === currentPlayers && maxTrophies < 20) {
                return 6;
            } else {
                playersJSON.teams = "";
                return typeNumber;
            }
        };

        const getGrade = async (matchType, highestTrophies) => {
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
        const getResult = (teams, rank, result) => {
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

        await sequelize.transaction(async (t) => {
            const userLastUpdate = await Users.findOne({
                attributes: ["USER_LST_BT", "CYCLE_NO"],
                where: {
                    USER_ID: userTag
                },
                transaction: t,
            });

            const lastBattleDate = new Date(userLastUpdate.USER_LST_BT);
            const lastBattleDateResponse = dateService.getDate(battleLogs?.items[0].battleTime);
            const battles = [];

            if (lastBattleDate !== lastBattleDateResponse) {
                for (const item of battleLogs?.items) {
                    if (item.event.id !== 0 && item.battle.type !== undefined) {
                        const matchDate = dateService.getDate(item.battleTime);
                        const duration = item.battle.duration != null && item.battle.duration > 0 ? item.battle.duration : 0;
                        const mapID = item.event.id;
                        const typeIndex = typeNameArray.indexOf(item.battle.type);

                        const mapModeNumber = config.modeClass.tripleModes.includes(item.event.mode) ? 3 :
                            config.modeClass.duoModes.includes(item.event.mode) ? 2 : config.modeClass.soloModes.survive.includes(item.event.mode) ? 1 : 0;
                        const matchChange = item.battle.trophyChange !== undefined ? item.battle.trophyChange : 0;

                        const teams = item.battle.teams !== undefined ?
                            item.battle.teams : item.battle.players;
                        const currentPlayers = JSON.stringify(teams);
                        const highestTrophies = Math.max(...teams.map(team => {
                            if ([3, 2].includes(mapModeNumber)) {
                                return Math.max(...team.map(player => {
                                    return player.brawler.trophies;
                                }));
                            } else if (mapModeNumber === 0) {
                                return Math.max(...team.brawlers.map(brawler => {
                                    return brawler.trophies;
                                }));
                            } else {
                                return team.brawler.trophies;
                            }
                        }));

                        const matchType = await getType(typeIndex, matchChange, highestTrophies, currentPlayers, mapModeNumber);
                        const matchGrade = await getGrade(matchType, highestTrophies);

                        if (new Date(lastBattleDate) < matchDate) {
                            const match = {
                                result: resultNameArray.indexOf(item.battle.result) - 1,
                                brawler: 0
                            };

                            for (let teamNumber in teams) {
                                const players = [2, 3].includes(mapModeNumber) ? teams[teamNumber] : teams;
                                const teamResult = players.map(item => item.tag).includes(userTag) ?
                                    resultNameArray.indexOf(item.battle.result) - 1 : (resultNameArray.indexOf(item.battle.result) - 1) * -1;

                                for (const playerNumber in players) {
                                    const matchRank = mapModeNumber === 1 ? playerNumber : mapModeNumber === 2 ? teamNumber : -1;
                                    const matchResult = await getResult(teams.length, matchRank, teamResult);

                                    if (mapModeNumber === 0) {
                                        for (const brawler of players[playerNumber]?.brawlers) {

                                            battles.push({
                                                USER_ID: userTag,
                                                PLAYER_ID: players[playerNumber].tag,
                                                BRAWLER_ID: brawler.id,
                                                MATCH_DT: matchDate,
                                                MAP_ID: mapID,
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
                                                PLAYER_TM_NO: teamNumber,
                                                PLAYER_SP_BOOL: isStarPlayer,
                                                BRAWLER_PWR: brawler.power,
                                                BRAWLER_TRP: brawler.trophies,
                                            });
                                        }
                                    } else {
                                        const isStarPlayer = item.battle.starPlayer !== undefined && item.battle.starPlayer !== null ?
                                            players[playerNumber].tag === item.battle.starPlayer.tag : 0;

                                        if (players[playerNumber].tag === userTag) {
                                            match.result = matchResult;
                                            match.brawler = players[playerNumber].brawler.id;
                                        }

                                        battles.push({
                                            USER_ID: userTag,
                                            PLAYER_ID: players[playerNumber].tag,
                                            BRAWLER_ID: players[playerNumber].brawler.id,
                                            MATCH_DT: matchDate,
                                            MAP_ID: mapID,
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
                                            PLAYER_TM_NO: [1, 2].includes(mapModeNumber) ? matchRank : teamNumber,
                                            PLAYER_SP_BOOL: isStarPlayer,
                                            BRAWLER_PWR: players[playerNumber].brawler.power,
                                            BRAWLER_TRP: players[playerNumber].brawler.trophies,
                                        });
                                    }
                                }
                            }
                        }

                        if (matchType === 6) {
                            await UserBattles.update({
                                MATCH_TYP: matchType
                            }, {
                                where: {
                                    USER_ID: userTag,
                                    MATCH_DT: matchDate,
                                },
                                transaction: t,
                            });
                        }
                    }
                }
            } // battleLogs 탐색 종료

            await UserBattles.bulkCreate(battles, {
                ignoreDuplicates: true,
                transaction: t
            });
        }); // transaction 종료
    };
}