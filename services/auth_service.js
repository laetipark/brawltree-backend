import fetch from "node-fetch";
import {fn, literal, Op} from "sequelize";
import {
    sequelize,
    Users,
    UserProfile,
    UserBattles,
    UserBrawlers,
    BattlePicks,
    BattleTrio,
    UserBrawlerItems, UserBrawlerBattles
} from "../models/index.js";
import {dateService} from "./date_service.js";
import {seasonService} from "./season_service.js";

import config from "../config/config.js";

const typeNameArray = ["ranked", "friendly", "soloRanked", "teamRanked", "challenge", "championshipChallenge"];
const resultNameArray = ["victory", "draw", "defeat"];

export class authService {

    /** 유저 정보 데이터베이스에 추가
     * @param userID 유저 태그
     */
    static insertUsers = async (userID) => {
        const member = await fetch(`${config.url}/players/%23${userID}`, {
            method: "GET",
            headers: config.headers,
        })
            .then(res => res.json())
            .catch(err => console.error(err));

        if (member.tag !== undefined) {
            const user = await Users.findOrCreate({
                where: {
                    USER_ID: `#${userID}`,
                },
                defaults: {
                    USER_LST_CK: new Date(0),
                    USER_LST_BT: new Date(0),
                }
            });

            await this.insertUserProfile(userID);
            await this.UpdateUserBattles(userID);
            if (new Date(new Date(user[0].USER_LST_CK).getTime() + (5 * 60 * 1000)) < new Date()) {
                await this.insertUserBattles(userID, false);
            }
        } else {

        }
    };

    /** 멤버 기록과 소유 브롤러 정보 데이터베이스에 추가
     * @param userID 멤버 태그
     */
    static insertUserProfile = async (userID) => {
        const season = await seasonService.selectRecentSeason();
        const setLeagueRank = (typeNum, tag, column) => {
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

        const setTrophyBegin = (tag, brawlerID, current) => {
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

        const responseMember = await fetch(`${config.url}/players/%23${userID}`, {
            method: "GET",
            headers: config.headers,
        })
            .then(res => res.json())
            .catch(err => console.error(err));

        if (responseMember.tag !== undefined) {
            const [soloRankCurrent, teamRankCurrent, soloRankHighest, teamRankHighest] =
                await Promise.all([setLeagueRank(2, responseMember.tag, "MATCH_DT"),
                    setLeagueRank(3, responseMember.tag, "MATCH_DT"),
                    setLeagueRank(2, responseMember.tag, "BRAWLER_TRP"),
                    setLeagueRank(3, responseMember.tag, "BRAWLER_TRP")]);

            await UserProfile.upsert({
                USER_ID: responseMember.tag,
                USER_NM: responseMember.name,
                USER_PRFL: responseMember.icon.id,
                CLUB_ID: responseMember.club.tag,
                CLUB_NM: responseMember.club.name,
                TROPHY_CUR: responseMember.trophies,
                TROPHY_HGH: responseMember.highestTrophies,
                VICTORY_TRP: responseMember["3vs3Victories"],
                VICTORY_DUO: responseMember.duoVictories,
                BRAWLER_RNK_25: responseMember.brawlers.filter((brawler) => brawler.rank >= 25).length,
                BRAWLER_RNK_30: responseMember.brawlers.filter((brawler) => brawler.rank >= 30).length,
                BRAWLER_RNK_35: responseMember.brawlers.filter((brawler) => brawler.rank >= 35).length,
                PL_SL_CUR: soloRankCurrent,
                PL_SL_HGH: soloRankHighest,
                PL_TM_CUR: teamRankCurrent,
                PL_TM_HGH: teamRankHighest,
            });

            const brawlerList = responseMember.brawlers;
            for (const brawler of brawlerList) {
                const brawlerID = brawler.id;
                const brawlerPower = brawler.power;
                const trophyBegin = await setTrophyBegin(responseMember.tag, brawlerID, brawler.trophies);

                const userBrawlers = await UserBrawlers.findOrCreate({
                    where: {
                        USER_ID: responseMember.tag,
                        BRAWLER_ID: brawlerID,
                    },
                    defaults: {
                        BRAWLER_PWR: brawlerPower,
                        TROPHY_BGN: trophyBegin,
                        TROPHY_CUR: brawler.trophies,
                        TROPHY_HGH: brawler.highestTrophies,
                        TROPHY_RNK: brawler.rank,
                    },
                });

                if (userBrawlers[1] === false) {
                    await UserBrawlers.upsert({
                        USER_ID: responseMember.tag,
                        BRAWLER_ID: brawlerID,
                        BRAWLER_PWR: brawlerPower,
                        TROPHY_BGN: trophyBegin,
                        TROPHY_CUR: brawler.trophies,
                        TROPHY_HGH: brawler.highestTrophies,
                        TROPHY_RNK: brawler.rank
                    });
                }

                const gears = brawler.gears;
                const starPowers = brawler.starPowers;
                const gadgets = brawler.gadgets;

                await UserBrawlerItems.destroy({
                    where: {
                        USER_ID: responseMember.tag,
                        BRAWLER_ID: brawlerID,
                        [Op.or]: [
                            {
                                ITEM_K: "gear",
                                ITEM_ID: {
                                    [Op.notIn]: gears.map(gear => gear.id)
                                }
                            },
                            {
                                ITEM_K: "starPower",
                                ITEM_ID: {
                                    [Op.notIn]: starPowers.map(starPower => starPower.id)
                                }
                            },
                            {
                                ITEM_K: "gadget",
                                ITEM_ID: {
                                    [Op.notIn]: gadgets.map(gadget => gadget.id)
                                }
                            }
                        ]
                    }
                });

                gears.map(async gear => {
                    await UserBrawlerItems.upsert({
                        USER_ID: responseMember.tag,
                        BRAWLER_ID: brawlerID,
                        ITEM_ID: gear.id,
                        ITEM_K: "gear",
                        ITEM_NM: gear.name,
                    });
                });

                starPowers.map(async starPower => {
                    await UserBrawlerItems.upsert({
                        USER_ID: responseMember.tag,
                        BRAWLER_ID: brawlerID,
                        ITEM_ID: starPower.id,
                        ITEM_K: "starPower",
                        ITEM_NM: starPower.name,
                    });
                });

                gadgets.map(async gadget => {
                    await UserBrawlerItems.upsert({
                        USER_ID: responseMember.tag,
                        BRAWLER_ID: brawlerID,
                        ITEM_ID: gadget.id,
                        ITEM_K: "gadget",
                        ITEM_NM: gadget.name,
                    });
                });
            }
        }
    };

    static UpdateUserBattles = async (userID) => {
        const battles = await UserBattles.findAll({
            attributes: ["BRAWLER_ID", "MAP_ID", "MATCH_TYP", "MATCH_GRD",
                [fn("COUNT", literal("*")), "MATCH_CNT"],
                [fn("COUNT", literal("CASE WHEN MATCH_RES = -1 THEN 1 ELSE NULL END")), "MATCH_VIC_CNT"],
                [fn("COUNT", literal("CASE WHEN MATCH_RES = 1 THEN 1 ELSE NULL END")), "MATCH_DEF_CNT"],
            ],
            where: {
                USER_ID: `#${userID}`,
                PLAYER_ID: `#${userID}`,
                MATCH_TYP: {
                    [Op.in]: [0, 2, 3]
                }
            },
            group: ["BRAWLER_ID", "MAP_ID", "MATCH_TYP", "MATCH_GRD"],
            raw: true
        });

        battles.map(async battle => {
            await UserBrawlerBattles.upsert({
                USER_ID: `#${userID}`,
                BRAWLER_ID: battle.BRAWLER_ID,
                MAP_ID: battle.MAP_ID,
                MATCH_TYP: battle.MATCH_TYP,
                MATCH_GRD: battle.MATCH_GRD,
                MATCH_CNT: battle.MATCH_CNT,
                MATCH_VIC_CNT: battle.MATCH_VIC_CNT,
                MATCH_DEF_CNT: battle.MATCH_DEF_CNT
            });
        });
    };

    /** 최신 25개 전투 정보 확인 및 데이터베이스에 추가
     * @param userID 유저 태그
     * @param cycle
     */
    static insertUserBattles = async (userID, cycle) => {
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

        const response =
            await fetch(`${config.url}/players/%23${userID}/battlelog`, {
                method: "GET",
                headers: config.headers,
            });
        const battleLogs = await response.json();

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
            const battlePicksInsert = [];
            const battlePicksUpdate = [];
            const battleTrioInsert = [];
            const battleTrioUpdate = [];

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

                                if (typeIndex !== 1 && mapModeNumber === 3) {
                                    const trio = [players[0].brawler.id, players[1].brawler.id, players[2].brawler.id].sort();

                                    battleTrioInsert.push({
                                        MAP_ID: mapID,
                                        BRAWLER_1_ID: trio[0],
                                        BRAWLER_2_ID: trio[1],
                                        BRAWLER_3_ID: trio[2],
                                        MATCH_TYP: matchType,
                                        MATCH_GRD: matchGrade,
                                        MAP_MD: item.event.mode,
                                        MATCH_CNT: 0,
                                        MATCH_CNT_VIC: 0,
                                        MATCH_CNT_DEF: 0,
                                    });

                                    const trioBrawlers = {
                                        MAP_ID: mapID,
                                        BRAWLER_1_ID: trio[0],
                                        BRAWLER_2_ID: trio[1],
                                        BRAWLER_3_ID: trio[2],
                                        MATCH_TYP: matchType,
                                        MATCH_GRD: matchGrade,
                                    };

                                    const existingIndex = battleTrioUpdate.findIndex(item => {
                                        return (
                                            item.MAP_ID === trioBrawlers.MAP_ID &&
                                            item.BRAWLER_1_ID === trioBrawlers.BRAWLER_1_ID &&
                                            item.BRAWLER_2_ID === trioBrawlers.BRAWLER_2_ID &&
                                            item.BRAWLER_3_ID === trioBrawlers.BRAWLER_3_ID &&
                                            item.MATCH_TYP === trioBrawlers.MATCH_TYP &&
                                            item.MATCH_GRD === trioBrawlers.MATCH_GRD
                                        );
                                    });

                                    if (existingIndex !== -1) {
                                        battleTrioUpdate[existingIndex].MATCH_CNT++;
                                        teamResult === -1 && battleTrioUpdate[existingIndex].MATCH_CNT_VIC++;
                                        teamResult === 1 && battleTrioUpdate[existingIndex].MATCH_CNT_DEF++;
                                    } else {
                                        trioBrawlers.MATCH_CNT = 1;
                                        trioBrawlers.MATCH_CNT_VIC = teamResult === -1 ? 1 : 0;
                                        trioBrawlers.MATCH_CNT_DEF = teamResult === 1 ? 1 : 0;
                                        battleTrioUpdate.push(trioBrawlers); // Add a new entry to the JSON array
                                    }
                                }

                                for (const playerNumber in players) {
                                    const matchRank = mapModeNumber === 1 ? playerNumber : mapModeNumber === 2 ? teamNumber : -1;
                                    const matchResult = await getResult(teams.length, matchRank, teamResult);

                                    if (mapModeNumber === 0) {
                                        for (const brawler of players[playerNumber]?.brawlers) {

                                            if (players[playerNumber].tag === userTag) {
                                                match.result = matchResult;
                                                match.brawler = brawler.id;

                                                await UserBrawlers.update({
                                                    MATCH_CNT_TL_DL: literal("MATCH_CNT_TL_DL + 1"),
                                                    MATCH_CNT_VIC_TL_DL: literal(`CASE WHEN ${match.result} = -1 THEN MATCH_CNT_VIC_TL_DL + 1 ELSE MATCH_CNT_VIC_TL_DL END`),
                                                    MATCH_CNT_DEF_TL_DL: literal(`CASE WHEN ${match.result} = 1 THEN MATCH_CNT_DEF_TL_DL + 1 ELSE MATCH_CNT_DEF_TL_DL END`),
                                                }, {
                                                    where: {
                                                        USER_ID: userTag,
                                                        BRAWLER_ID: match.brawler
                                                    },
                                                    transaction: t,
                                                });
                                            }

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

                                            await BattlePicks.findOrCreate({
                                                where: {
                                                    MAP_ID: mapID,
                                                    BRAWLER_ID: brawler.id,
                                                    MATCH_TYP: matchType,
                                                    MATCH_GRD: matchGrade,
                                                },
                                                defaults: {
                                                    MAP_MD: item.event.mode,
                                                    MATCH_CNT: 0,
                                                    MATCH_CNT_VIC: 0,
                                                    MATCH_CNT_DEF: 0,
                                                },
                                                transaction: t,
                                            });

                                            await BattlePicks.update({
                                                MATCH_CNT: literal("MATCH_CNT + 1"),
                                                MATCH_CNT_VIC: literal(`CASE WHEN ${matchResult} = -1 THEN MATCH_CNT_VIC + 1 ELSE MATCH_CNT_VIC END`),
                                                MATCH_CNT_DEF: literal(`CASE WHEN ${matchResult} = 1 THEN MATCH_CNT_DEF + 1 ELSE MATCH_CNT_DEF END`),
                                            }, {
                                                where: {
                                                    MAP_ID: mapID,
                                                    BRAWLER_ID: brawler.id,
                                                    MATCH_TYP: matchType,
                                                    MATCH_GRD: matchGrade,
                                                },
                                                transaction: t,
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

                                        battlePicksInsert.push({
                                            MAP_ID: mapID,
                                            BRAWLER_ID: players[playerNumber].brawler.id,
                                            MATCH_TYP: matchType,
                                            MATCH_GRD: matchGrade,
                                            MAP_MD: item.event.mode,
                                            MATCH_CNT: 0,
                                            MATCH_CNT_VIC: 0,
                                            MATCH_CNT_DEF: 0,
                                        });

                                        const picks = {
                                            MAP_ID: mapID,
                                            BRAWLER_ID: players[playerNumber].brawler.id,
                                            MATCH_TYP: matchType,
                                            MATCH_GRD: matchGrade,
                                        };

                                        const existingIndex = battlePicksUpdate.findIndex(item => {
                                            return (
                                                item.MAP_ID === picks.MAP_ID &&
                                                item.BRAWLER_ID === picks.BRAWLER_ID &&
                                                item.MATCH_TYP === picks.MATCH_TYP &&
                                                item.MATCH_GRD === picks.MATCH_GRD
                                            );
                                        });

                                        if (existingIndex !== -1) {
                                            battlePicksUpdate[existingIndex].MATCH_CNT++;
                                            matchResult === -1 && battlePicksUpdate[existingIndex].MATCH_CNT_VIC++;
                                            matchResult === 1 && battlePicksUpdate[existingIndex].MATCH_CNT_DEF++;
                                        } else {
                                            picks.MATCH_CNT = 1;
                                            picks.MATCH_CNT_VIC = matchResult === -1 ? 1 : 0;
                                            picks.MATCH_CNT_DEF = matchResult === 1 ? 1 : 0;
                                            battlePicksUpdate.push(picks); // Add a new entry to the JSON array
                                        }
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
                transaction: t,
            });

            await BattlePicks.bulkCreate(battlePicksInsert, {
                ignoreDuplicates: true,
                transaction: t,
            });

            await BattleTrio.bulkCreate(battleTrioInsert, {
                ignoreDuplicates: true,
                transaction: t,
            });

            await Promise.all(battlePicksUpdate.map(pick => {
                BattlePicks.update({
                    MATCH_CNT: literal(`MATCH_CNT + ${pick.MATCH_CNT}`),
                    MATCH_CNT_VIC: literal(`MATCH_CNT_VIC + ${pick.MATCH_CNT_VIC}`),
                    MATCH_CNT_DEF: literal(`MATCH_CNT_DEF + ${pick.MATCH_CNT_DEF}`),
                }, {
                    where: {
                        MAP_ID: pick.MAP_ID,
                        BRAWLER_ID: pick.BRAWLER_ID,
                        MATCH_TYP: pick.MATCH_TYP,
                        MATCH_GRD: pick.MATCH_GRD,
                    },
                    transaction: t,
                });
            }));

            await Promise.all(battleTrioUpdate.map(trio => {
                BattlePicks.update({
                    MATCH_CNT: literal(`MATCH_CNT + ${trio.MATCH_CNT}`),
                    MATCH_CNT_VIC: literal(`MATCH_CNT_VIC + ${trio.MATCH_CNT_VIC}`),
                    MATCH_CNT_DEF: literal(`MATCH_CNT_DEF + ${trio.MATCH_CNT_DEF}`),
                }, {
                    where: {
                        MAP_ID: trio.MAP_ID,
                        BRAWLER_1_ID: trio.BRAWLER_1_ID,
                        BRAWLER_2_ID: trio.BRAWLER_2_ID,
                        BRAWLER_3_ID: trio.BRAWLER_3_ID,
                        MATCH_TYP: trio.MATCH_TYP,
                        MATCH_GRD: trio.MATCH_GRD,
                    },
                    transaction: t,
                });
            }));

            if (cycle) {
                const newUserLastCheck = new Date();
                const newUserLastBattle = dateService.getDate(battleLogs?.items[0].battleTime);

                await Users.update({
                    USER_LST_CK: newUserLastCheck,
                    USER_LST_BT: newUserLastBattle
                }, {
                    where: {
                        USER_ID: userTag,
                    },
                    transaction: t,
                });

                setTimeout(async () => {
                    await this.insertUserBattles(userID, true);
                }, 20 * 60 * 1000);
            } else {
                const newUserLastCheck = new Date();
                const newUserLastBattle = dateService.getDate(battleLogs?.items[0].battleTime);

                await Users.update({
                    USER_LST_CK: newUserLastCheck,
                    USER_LST_BT: newUserLastBattle
                }, {
                    where: {
                        USER_ID: userTag,
                    },
                    transaction: t,
                });
            }

        }); // transaction 종료
    };
}