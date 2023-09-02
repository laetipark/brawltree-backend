import {
    Brawlers, Maps,
    UserBattles,
    UserBrawlerBattles,
    UserBrawlerItems,
    UserBrawlers,
    UserProfile,
    Users
} from "../models/index.js";
import {col, fn, literal, Op, where} from "sequelize";

import config from "../config/config.js";

const getQuery = (type, mode) => {
    const match = {};

    if (type === "7") {
        match.MATCH_TYP = {
            [Op.in]: config.typeList
        };
    } else {
        match.MATCH_TYP = type;
    }

    if (mode === "all") {
        match.MATCH_MD = {
            [Op.in]: config.modeList
        };
    } else {
        match.MATCH_MD = mode;
    }

    return match;
};

export class userService {
    static selectUser = async id =>
        await Users.findOne({
            include: [
                {
                    model: UserProfile,
                    required: true,
                    attributes: []
                },
            ],
            attributes: ["USER_ID", "USER_LST_CK", "USER_LST_BT", "USER_CR", "USER_CR_NM",
                [col("UserProfile.USER_NM"), "USER_NM"],
                [col("UserProfile.USER_PRFL"), "USER_PRFL"]],
            where: {
                USER_ID: `#${id}`
            }
        });

    static selectUserProfile = async id =>
        await UserProfile.findOne({
            attributes: ["CLUB_ID", "CLUB_NM",
                "TROPHY_CUR", "TROPHY_HGH",
                "VICTORY_TRP", "VICTORY_DUO",
                "BRAWLER_RNK_25", "BRAWLER_RNK_30", "BRAWLER_RNK_35",
                "PL_SL_CUR", "PL_SL_HGH", "PL_TM_CUR", "PL_TM_HGH"],
            where: {
                USER_ID: `#${id}`
            }
        });

    static selectUserBattleRecords = async (id, type, mode, season) => {
        const query = getQuery(type, mode);

        const userBattles = [await UserBattles.findAll({
            include: [
                {
                    model: Maps,
                    required: true,
                    attributes: []
                },
            ],
            attributes: [
                [fn("DATE_FORMAT", col("MATCH_DT"), "%Y-%m-%d"), "day"],
                [fn("COUNT", "MATCH_DT"), "value"],
            ],
            where: {
                USER_ID: `#${id}`,
                PLAYER_ID: `#${id}`,
                MATCH_DT: {
                    [Op.between]: [season.SEASON_BGN_DT, season.SEASON_END_DT]
                },
                MATCH_TYP: query.MATCH_TYP,
                $where1: where(col("Map.MAP_MD"), query.MATCH_MD)
            },
            group: [fn("DATE_FORMAT", col("MATCH_DT"), "%Y-%m-%d")],
        }), await UserBattles.findAll({
            include: [
                {
                    model: Maps,
                    required: true,
                    attributes: []
                },
            ],
            attributes: [
                [fn("DATE_FORMAT", col("MATCH_DT"), "%Y-%m-%d"), "day"],
                [fn("SUM", literal("CASE WHEN MATCH_TYP NOT IN (4, 5) THEN MATCH_CHG ELSE 0 END")), "value"],
            ],
            where: {
                USER_ID: `#${id}`,
                PLAYER_ID: `#${id}`,
                MATCH_DT: {
                    [Op.between]: [season.SEASON_BGN_DT, season.SEASON_END_DT]
                },
                MATCH_TYP: query.MATCH_TYP,
                $where1: where(col("Map.MAP_MD"), query.MATCH_MD)
            },
            group: [fn("DATE_FORMAT", col("MATCH_DT"), "%Y-%m-%d")],
        })];

        const userBrawlers = await UserBrawlerBattles.findAll({
            include: [
                {
                    model: Brawlers,
                    required: true,
                    attributes: []
                },
                {
                    model: Maps,
                    required: true,
                    attributes: []
                },
            ],
            attributes: [
                "BRAWLER_ID",
                [fn("SUM", col("MATCH_CNT")), "MATCH_CNT"],
                [fn("ROUND",
                    literal("SUM(`MATCH_CNT`) * 100 / SUM(SUM(`MATCH_CNT`)) OVER()")
                    , 2
                ), "MATCH_PCK_R"],
                [fn("ROUND",
                    literal("SUM(`MATCH_VIC_CNT`) * 100 / SUM(`MATCH_VIC_CNT` + `MATCH_DEF_CNT`)")
                    , 2
                ), "MATCH_VIC_R"],
                [col("Brawler.BRAWLER_NM"), "BRAWLER_NM"],
            ],
            where: {
                USER_ID: `#${id}`,
                MATCH_TYP: query.MATCH_TYP,
                $where1: where(col("Map.MAP_MD"), query.MATCH_MD)
            },
            order: [["MATCH_CNT", "DESC"]],
            group: ["BRAWLER_ID", "BRAWLER_NM"],
            limit: 5,
            raw: true
        });

        return [userBattles, userBrawlers];
    };

    static selectUserBattles = async (id, type, mode, season) => {
        const query = getQuery(type, mode);

        const userRecentBattles = await UserBattles.findAll({
            include: [
                {
                    model: Brawlers,
                    required: true,
                    attributes: []
                },
                {
                    model: Maps,
                    required: true,
                    attributes: []
                },
            ],
            attributes: ["MATCH_DT", "MATCH_DUR", "BRAWLER_ID", "MATCH_RES", "MAP_ID", "PLAYER_SP_BOOL",
                [col("Map.MAP_MD"), "MAP_MD"], [col("Map.MAP_NM"), "MAP_NM"],
                [col("Brawler.BRAWLER_NM"), "BRAWLER_NM"],
                [col("Brawler.BRAWLER_CL"), "BRAWLER_CL"]],
            where: {
                USER_ID: `#${id}`,
                PLAYER_ID: `#${id}`,
                MATCH_DT: {
                    [Op.between]: [season.SEASON_BGN_DT, season.SEASON_END_DT]
                },
                MATCH_TYP: query.MATCH_TYP,
                $where1: where(col("Map.MAP_MD"), query.MATCH_MD)
            },
            order: [["MATCH_DT", "DESC"]],
            limit: 30,
            raw: true
        });

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

        const brawlerCounts = Object.keys(counter).map(brawlerID => {
            const matchResultCounts = counter[brawlerID];
            const brawlerName = userRecentBattles.find(brawler => brawler.BRAWLER_ID === brawlerID).BRAWLER_NM;

            return {
                BRAWLER_ID: brawlerID,
                BRAWLER_NM: brawlerName,
                MATCH_CNT_RES: matchResultCounts,
                MATCH_CNT_TOT: Object.values(matchResultCounts).reduce((sum, count) => sum + count, 0)
            };
        });

        const userRecentBrawlers = brawlerCounts.sort((a, b) => b.MATCH_CNT_TOT - a.MATCH_CNT_TOT).slice(0, 6);

        const userBattles = await UserBattles.findAll({
            include: [
                {
                    model: Maps,
                    required: true,
                    attributes: []
                },
            ],
            attributes:
                ["USER_ID",
                    [fn(
                        "JSON_OBJECT",
                        "USER_ID", col("USER_ID"),
                        "MATCH_DT", col("MATCH_DT"),
                        "MATCH_DUR", col("MATCH_DUR"),
                        "MATCH_TYP", col("MATCH_TYP"),
                        "MAP_MD_CD", col("MAP_MD_CD"),
                        "MATCH_GRD", col("MATCH_GRD"),
                        "MATCH_CHG", col("MATCH_CHG")
                    ), "BATTLE_INFO"
                    ],
                    [fn(
                        "JSON_ARRAYAGG",
                        fn(
                            "JSON_OBJECT",
                            "PLAYER_ID", col("PLAYER_ID"),
                            "PLAYER_NM", col("PLAYER_NM"),
                            "PLAYER_TM_NO", col("PLAYER_TM_NO"),
                            "BRAWLER_ID", col("BRAWLER_ID"),
                            "BRAWLER_PWR", col("BRAWLER_PWR"),
                            "BRAWLER_TRP", col("BRAWLER_TRP"),
                            "MATCH_RNK", col("MATCH_RNK"),
                            "MATCH_RES", col("MATCH_RES"),
                            "PLAYER_SP_BOOL", col("PLAYER_SP_BOOL")
                        )
                    ), "    BATTLE_PLAYERS"
                    ]
                ],
            group: ["USER_ID", "MATCH_DT",
                "MATCH_DUR", "MATCH_TYP",
                "MAP_MD_CD", "MATCH_GRD", "MATCH_CHG"],
            where: {
                USER_ID: `#${id}`,
                MATCH_DT: {
                    [Op.between]: [season.SEASON_BGN_DT, season.SEASON_END_DT]
                },
                MATCH_TYP: query.MATCH_TYP,
                $where1: where(col("Map.MAP_MD"), query.MATCH_MD)
            },
            order: [["MATCH_DT", "DESC"]],
            limit: 30,
            raw: true
        }).then(result => {
            return result.map(battle => {
                return {
                    BATTLE_INFO: Object.assign(battle.BATTLE_INFO, userRecentBattles.find(item => (battle.BATTLE_INFO.MATCH_DT).slice(0, 19) === item.MATCH_DT)),
                    BATTLE_PLAYERS: battle.BATTLE_PLAYERS
                }
            });
        });

        return [userRecentBattles, userRecentBrawlers, userBattles];
    };

    static selectUserBrawlers = async (userID, season) => {
        const brawlers = await Brawlers.findAll({
            include: [
                {
                    model: UserBrawlers,
                    required: true,
                    attributes: []
                },
                {
                    model: UserBrawlerBattles,
                    required: false,
                    attributes: []
                },
            ],
            attributes: [
                "BRAWLER_ID", "BRAWLER_NM", "BRAWLER_RRT",
                [col("UserBrawlers.USER_ID"), "USER_ID"],
                [col("UserBrawlers.BRAWLER_PWR"), "BRAWLER_PWR"],
                [col("UserBrawlers.TROPHY_BGN"), "TROPHY_BGN"],
                [col("UserBrawlers.TROPHY_CUR"), "TROPHY_CUR"],
                [col("UserBrawlers.TROPHY_HGH"), "TROPHY_HGH"],
                [col("UserBrawlers.TROPHY_RNK"), "TROPHY_RNK"],
                [fn("ROUND",
                    fn("IFNULL",
                        literal("SUM(CASE WHEN `UserBrawlerBattles`.`MATCH_TYP` = 0 THEN `UserBrawlerBattles`.`MATCH_CNT` ELSE 0 END) * 100 / " +
                            "SUM(SUM(CASE WHEN `UserBrawlerBattles`.`MATCH_TYP` = 0 THEN `UserBrawlerBattles`.`MATCH_CNT` ELSE 0 END)) OVER()")
                        , 0)
                    , 2
                ), "MATCH_PCK_R_TL"],
                [fn("ROUND",
                    fn("IFNULL",
                        literal("SUM(CASE WHEN `UserBrawlerBattles`.`MATCH_TYP` = 0 THEN `UserBrawlerBattles`.`MATCH_VIC_CNT` ELSE 0 END) * 100 / " +
                            "SUM(CASE WHEN `UserBrawlerBattles`.`MATCH_TYP` = 0 THEN `UserBrawlerBattles`.`MATCH_VIC_CNT` + `UserBrawlerBattles`.`MATCH_DEF_CNT` ELSE 0 END)")
                        , 0)
                    , 2
                ), "MATCH_VIC_R_TL"],
                [fn("ROUND",
                    fn("IFNULL",
                        literal("SUM(CASE WHEN `UserBrawlerBattles`.`MATCH_TYP` in (2, 3) THEN `UserBrawlerBattles`.`MATCH_CNT` ELSE 0 END) * 100 / " +
                            "SUM(SUM(CASE WHEN `UserBrawlerBattles`.`MATCH_TYP` = 0 THEN `UserBrawlerBattles`.`MATCH_CNT` ELSE 0 END)) OVER()")
                        , 0)
                    , 2
                ), "MATCH_PCK_R_PL"],
                [fn("ROUND",
                    fn("IFNULL",
                        literal("SUM(CASE WHEN `UserBrawlerBattles`.`MATCH_TYP` in (2, 3) THEN `UserBrawlerBattles`.`MATCH_VIC_CNT` ELSE 0 END) * 100 / " +
                            "SUM(CASE WHEN `UserBrawlerBattles`.`MATCH_TYP` = 0 THEN `UserBrawlerBattles`.`MATCH_VIC_CNT` + `UserBrawlerBattles`.`MATCH_DEF_CNT` ELSE 0 END)")
                        , 0)
                    , 2
                ), "MATCH_VIC_R_PL"],
            ],
            where: {
                $where1: where(col("UserBrawlers.USER_ID"), `#${userID}`)
            },
            group: ["BRAWLER_ID", "BRAWLER_NM"],
            order: [[col("UserBrawlers.TROPHY_CUR"), "DESC"]],
            raw: true
        });

        const items = await UserBrawlerItems.findAll({
            where: {
                USER_ID: `#${userID}`,
            },
        });

        const graph = await UserBattles.findAll({
            attributes: [
                [fn("DISTINCT", col("BRAWLER_ID")), "BRAWLER_ID"],
                [fn("DATE_FORMAT", col("MATCH_DT"), "%m-%d"), "x"],
                [literal("SUM(`MATCH_CHG`) OVER(PARTITION BY `BRAWLER_ID` ORDER BY DATE(MATCH_DT))"), "y"]],
            where: {
                USER_ID: `#${userID}`,
                PLAYER_ID: `#${userID}`,
                MATCH_DT: {
                    [Op.between]: [season.SEASON_BGN_DT, season.SEASON_END_DT]
                },
                MATCH_TYP: 0,
            },
            raw: true
        }).then(result => {
            const graphJSON = result.map(item => {
                return {
                    BRAWLER_ID: item.BRAWLER_ID,
                    x: item.x,
                    y: parseInt(item.y) + brawlers.find(brawler => brawler.BRAWLER_ID === item.BRAWLER_ID).TROPHY_BGN
                };
            });

            brawlers.map(item => {
                graphJSON.push({
                    BRAWLER_ID: item.BRAWLER_ID,
                    x: season.SEASON_BGN_DT.slice(5, 8) + (parseInt(season.SEASON_BGN_DT.slice(8, 10)) - 1).toString().padStart(2, '0'),
                    y: brawlers.find(brawler => brawler.BRAWLER_ID === item.BRAWLER_ID).TROPHY_BGN
                })
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
    };
}