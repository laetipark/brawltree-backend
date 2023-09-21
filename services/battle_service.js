import {sequelize, BrawlerStats, BattleTrio, Maps, UserBattles, UserBrawlerBattles} from "../models/index.js";
import {col, fn, literal, Op} from "sequelize";
import {seasonService} from "./season_service.js";
import fs from "fs";

export class battleService {
    static updateBattleTrio = async () => {
        const query = `(
            SELECT
                MAP_ID,
                MATCH_TYP,
                MATCH_GRD,
                MAP_MD,
                TRIO,
                SUM(MATCH_CNT) AS MATCH_CNT,
                SUM(MATCH_CNT_VIC) AS MATCH_CNT_VIC,
                SUM(MATCH_CNT_DEF) AS MATCH_CNT_DEF
            FROM
            (
                SELECT
                    UserBattles.MAP_ID AS MAP_ID,
                    MATCH_TYP,
                    MATCH_GRD,
                    Maps.MAP_MD AS MAP_MD,
                    GROUP_CONCAT(DISTINCT BRAWLER_ID ORDER BY BRAWLER_ID ASC) AS TRIO,
                    PLAYER_TM_NO,
                    COUNT(MATCH_RES) AS MATCH_CNT,
                    SUM(CASE WHEN MATCH_RES = -1 THEN 1 ELSE 0 END) AS MATCH_CNT_VIC,
                    SUM(CASE WHEN MATCH_RES = 1 THEN 1 ELSE 0 END) AS MATCH_CNT_DEF
                FROM
                    brawl_tree.USER_BATTLES AS UserBattles
                RIGHT OUTER JOIN brawl_tree.MAPS AS Maps ON
                    UserBattles.MAP_ID = Maps.MAP_ID
                WHERE
                    MAP_MD_CD = 3
                GROUP BY
                    MATCH_DT,
                    MAP_ID,
                    MAP_MD,
                    MATCH_TYP,
                    MATCH_GRD,
                    PLAYER_TM_NO
            ) AS SUB_QUERY
            WHERE 
                LENGTH(TRIO) - LENGTH(REPLACE(TRIO, ',', '')) + 1 = 3
            GROUP BY MAP_ID, MATCH_TYP, MATCH_GRD, TRIO, MAP_MD, PLAYER_TM_NO
        )`;

        const battleTrios = await sequelize.query(query).then(([result, metadata]) => {
            return result.map(item => {
                const trio = [...new Set(item.TRIO.split(","))];
                item.BRAWLER_1_ID = trio[0];
                item.BRAWLER_2_ID = trio[1];
                item.BRAWLER_3_ID = trio[2];

                return {
                    MAP_ID: item.MAP_ID,
                    BRAWLER_1_ID: item.BRAWLER_1_ID,
                    BRAWLER_2_ID: item.BRAWLER_2_ID,
                    BRAWLER_3_ID: item.BRAWLER_3_ID,
                    MATCH_TYP: item.MATCH_TYP,
                    MATCH_GRD: item.MATCH_GRD,
                    MAP_MD: item.MAP_MD,
                    MATCH_CNT: item.MATCH_CNT,
                    MATCH_CNT_VIC: item.MATCH_CNT_VIC,
                    MATCH_CNT_DEF: item.MATCH_CNT_DEF
                };
            });
        });

        await BattleTrio.bulkCreate(battleTrios, {
            ignoreDuplicates: true,
            updateOnDuplicate: ["MATCH_CNT", "MATCH_CNT_VIC", "MATCH_CNT_DEF"],
        });
    };

    static updateBrawlerStats = async () => {
        const brawlerStats = await UserBattles.findAll({
            include: [
                {
                    model: Maps,
                    required: true,
                    attributes: []
                },
            ],
            attributes: [
                "BRAWLER_ID",
                "MAP_ID",
                "MATCH_TYP",
                "MATCH_GRD",
                [fn("COUNT", col("MATCH_RES")), "MATCH_CNT"],
                [fn("COUNT", literal("CASE WHEN MATCH_RES = -1 THEN 1 ELSE NULL END")), "MATCH_CNT_VIC"],
                [fn("COUNT", literal("CASE WHEN MATCH_RES = 1 THEN 1 ELSE NULL END")), "MATCH_CNT_DEF"],
                [col("Map.MAP_MD"), "MAP_MD"],
            ],
            where: {
                MATCH_TYP: {
                    [Op.in]: [0, 2, 3]
                }
            },
            group: ["BRAWLER_ID", "MAP_ID", "MATCH_TYP", "MATCH_GRD", "MAP_MD"],
            raw: true,
        });

        await BrawlerStats.bulkCreate(brawlerStats, {
            ignoreDuplicates: true,
            updateOnDuplicate: ["MATCH_CNT", "MATCH_CNT_VIC", "MATCH_CNT_DEF"],
        });
    };

    static updateUserBattles = async (userID) => {
        const battles = await UserBattles.findAll({
            attributes: ["BRAWLER_ID", "MAP_ID", "MATCH_TYP", "MATCH_GRD",
                [fn("COUNT", literal("*")), "MATCH_CNT"],
                [fn("COUNT", literal("CASE WHEN MATCH_RES = -1 THEN 1 ELSE NULL END")), "MATCH_CNT_VIC"],
                [fn("COUNT", literal("CASE WHEN MATCH_RES = 1 THEN 1 ELSE NULL END")), "MATCH_CNT_DEF"],
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
        }).then(result => {
            return result.map(battle => {
                return {
                    USER_ID: `#${userID}`,
                    BRAWLER_ID: battle.BRAWLER_ID,
                    MAP_ID: battle.MAP_ID,
                    MATCH_TYP: battle.MATCH_TYP,
                    MATCH_GRD: battle.MATCH_GRD,
                    MATCH_CNT: battle.MATCH_CNT,
                    MATCH_CNT_VIC: battle.MATCH_CNT_VIC,
                    MATCH_CNT_DEF: battle.MATCH_CNT_DEF
                };
            });
        });

        await UserBrawlerBattles.bulkCreate(battles, {
            ignoreDuplicates: true,
            updateOnDuplicate: ["MATCH_CNT", "MATCH_CNT_VIC", "MATCH_CNT_DEF"],
        });
    };

    /** 이전 시즌 전투 기록 백업 */
    /*static backupBattles = async (season) => {
        await UserBattles.findAll({
            where: {
                MATCH_DT: {
                    [Op.lt]: season.SEASON_BGN_DT
                }
            },
            raw: true
        }).then(async (result) => {
            fs.writeFileSync(`./backup/battle-${Date.now()}.json`, JSON.stringify(result));
            await UserBattles.destroy({
                where: {
                    MATCH_DT: {
                        [Op.lt]: season.SEASON_BGN_DT
                    }
                }
            });
        });
    };*/
}