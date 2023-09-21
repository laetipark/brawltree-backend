import {
    Maps,
    sequelize,
    UserBattles,
    Users,
    UserProfile,
    UserFriends,
    UserRecords,
    BrawlerStats, UserBrawlers
} from "../models/index.js";
import {col, fn, literal, Op, where} from "sequelize";

import config from "../config/config.js";

export class blossomService {
    static updateMembers = async (members) => {
        const memberIDs = members.map(member => member.USER_ID);

        await sequelize.transaction(async (t) => {
            await Users.bulkCreate(members, {
                ignoreDuplicates: true,
                updateOnDuplicate: ["USER_CR", "USER_CR_NM"],
                transaction: t
            });

            await Users.update({
                USER_CR: null,
                USER_CR_NM: null
            }, {
                where: {
                    USER_ID: {
                        [Op.notIn]: memberIDs
                    },
                },
                transaction: t
            });
        }); // transaction 종료
    };

    static selectMemberSummary = async () => {
        return await Users.findOne({
            include: [
                {
                    model: UserProfile,
                    required: true,
                    attributes: []
                },
            ],
            attributes: [
                [fn("COUNT", col("UserProfile.USER_ID")), "MEMBER_CNT"],
                [fn("SUM", col("UserProfile.TROPHY_CUR")), "TROPHY_CUR_TOT"]
            ],
            where: {
                USER_CR: {
                    [Op.in]: ["Blossom", "Team"]
                }
            },
            raw: true
        });
    };

    static selectBattleSummary = async () => {
        const beginDate = new Date(new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate()
        ).getTime());
        const endDate = new Date(new Date(beginDate).getTime() + 1000 * 60 * 60 * 24);
        return await UserBattles.findOne({
            include: [
                {
                    model: Users,
                    required: true,
                    attributes: []
                },
            ],
            attributes: [
                [fn("COUNT", "DISTINCT MATCH_DT"), "MATCH_CNT_TOT"],
            ],
            where: {
                $where: where(col("User.USER_CR"), {
                    [Op.in]: ["Blossom", "Team"]
                }),
                MATCH_DT: {
                    [Op.between]: [beginDate, endDate]
                },
                USER_ID: [col("PLAYER_ID")]
            },
            raw: true
        });
    };

    static selectSeasonSummary = async () => {
        return await UserRecords.findOne({
            attributes: [
                [fn("SUM", col("MATCH_CNT")), "MATCH_CNT"]
            ],
            order: [["MATCH_CNT", "DESC"]],
        });
    };

    static selectBrawlerSummary = async () => {
        return [
            await BrawlerStats.findAll({
                attributes: ["BRAWLER_ID",
                    [literal("SUM(`MATCH_CNT`) * 100 / SUM(SUM(`MATCH_CNT`)) OVER()"), "MATCH_CNT_TL_RATE"],
                    [literal("SUM(`MATCH_CNT_VIC`) * 100 / (SUM(`MATCH_CNT_VIC`) + SUM(`MATCH_CNT_DEF`))"), "MATCH_CNT_VIC_TL_RATE"]],
                where: {
                    MATCH_TYP: 0
                },
                group: ["BRAWLER_ID"],
                order: [["MATCH_CNT_TL_RATE", "DESC"], ["MATCH_CNT_VIC_TL_RATE", "DESC"]],
                limit: 10
            }),
            await BrawlerStats.findAll({
                attributes: ["BRAWLER_ID",
                    [literal("SUM(`MATCH_CNT`) * 100 / SUM(SUM(`MATCH_CNT`)) OVER()"), "MATCH_CNT_PL_RATE"],
                    [literal("SUM(`MATCH_CNT_VIC`) * 100 / (SUM(`MATCH_CNT_VIC`) + SUM(`MATCH_CNT_DEF`))"), "MATCH_CNT_VIC_PL_RATE"]],
                where: {
                    MATCH_TYP: {
                        [Op.in]: [2, 3]
                    }
                },
                group: ["BRAWLER_ID"],
                order: [["MATCH_CNT_PL_RATE", "DESC"], ["MATCH_CNT_VIC_PL_RATE", "DESC"]],
                limit: 10
            })
        ];
    };

    static selectMemberTable = async () => {
        return await Users.findAll({
            include: [
                {
                    model: UserProfile,
                    required: true,
                    attributes: []
                },
            ],
            attributes: [
                [col("UserProfile.USER_ID"), "USER_ID"],
                [col("UserProfile.USER_NM"), "USER_NM"],
                [col("UserProfile.USER_PRFL"), "USER_PRFL"],
                [col("UserProfile.TROPHY_CUR"), "TROPHY_CUR"],
                [col("UserProfile.PL_SL_CUR"), "PL_SL_CUR"],
                [col("UserProfile.PL_TM_CUR"), "PL_TM_CUR"]
            ],
            where: {
                USER_CR: {
                    [Op.in]: ["Blossom", "Team"]
                }
            },
            order: [["TROPHY_CUR", "DESC"]]
        });
    };

    static selectBrawlerTable = async brawler => {
        return await Users.findAll({
            include: [
                {
                    model: UserProfile,
                    required: true,
                    attributes: []
                },
                {
                    model: UserBrawlers,
                    required: true,
                    attributes: []
                }
            ],
            attributes: [
                [col("UserProfile.USER_ID"), "USER_ID"],
                [col("UserProfile.USER_NM"), "USER_NM"],
                [col("UserProfile.USER_PRFL"), "USER_PRFL"],
                [col("UserBrawlers.BRAWLER_ID"), "BRAWLER_ID"],
                [col("UserBrawlers.TROPHY_CUR"), "TROPHY_CUR"],
                [col("UserBrawlers.TROPHY_HGH"), "TROPHY_HGH"]
            ],
            where: {
                USER_CR: {
                    [Op.in]: ["Blossom", "Team"]
                },
                $where: where(col("UserBrawlers.BRAWLER_ID"), brawler),
            },
            order: [["TROPHY_CUR", "DESC"]],
            raw: true,
            logging: true
        });
    };

    /** 하루 멤버들의 전투 정보 요약 반환
     * @param beginDate 하루 시작
     * @param endDate 하루 끝
     * @param type 게임 타입
     * @param mode 게임 모드
     */
    static selectBattlesTable = async (beginDate, endDate, type, mode) => {
        return await Users.findAll({
            include: [
                {
                    model: UserProfile,
                    required: true,
                    attributes: []
                },
                {
                    model: UserBattles,
                    required: true,
                    include: [
                        {
                            model: Maps,
                            required: true,
                            where: {
                                MAP_MD: {
                                    [Op.in]: mode !== "all" ? [mode] : config.modeList
                                }
                            },
                            attributes: []
                        }
                    ],
                    attributes: []
                }
            ],
            attributes: [
                [col("UserProfile.USER_ID"), "USER_ID"],
                [col("UserProfile.USER_NM"), "USER_NM"],
                [col("UserProfile.USER_PRFL"), "USER_PRFL"],
                [fn("COUNT", fn("DISTINCT", col("UserBattles.MATCH_DT"))), "MATCH_CNT"],
                [fn("SUM", col("UserBattles.MATCH_CHG")), "MATCH_CHG"]
            ],
            group: [col("UserProfile.USER_ID")],
            where: {
                USER_CR: {
                    [Op.in]: ["Blossom", "Team"]
                },
                $where1: where(col("UserBattles.USER_ID"), col("UserBattles.PLAYER_ID")),
                $where2: where(col("UserBattles.MATCH_DT"), {
                    [Op.between]: [beginDate, endDate]
                }),
                $where3: where(col("UserBattles.MATCH_TYP"), {
                    [Op.in]: type !== "7" ? [type] : config.typeList
                }),
            },
            order: [
                ["MATCH_CNT", "DESC"]
            ],
            raw: true
        });
    };

    static selectSeasonTable = async (type, mode) => {
        return await Users.findAll({
            include: [
                {
                    model: UserProfile,
                    required: true,
                    attributes: []
                },
                {
                    model: UserRecords,
                    required: false,
                    attributes: []
                },
                {
                    model: UserFriends,
                    required: false,
                    attributes: []
                }
            ],
            attributes: [
                [col("UserProfile.USER_ID"), "USER_ID"],
                [col("UserProfile.USER_NM"), "USER_NM"],
                [col("UserProfile.USER_PRFL"), "USER_PRFL"],
                [fn("SUM", col("UserRecords.MATCH_CNT")), "MATCH_CNT"],
                [fn("SUM", col("UserRecords.MATCH_CHG")), "MATCH_CHG"],
                [fn("SUM", col("UserFriends.MATCH_CNT")), "FRIEND_PT"]
            ],
            group: [col("UserProfile.USER_ID")],
            where: {
                USER_CR: {
                    [Op.in]: ["Blossom", "Team"]
                },
                $where1: where(col("UserRecords.MATCH_TYP"), {
                    [Op.in]: type !== "7" ? [type] : config.typeList
                }),
                $where2: where(col("UserRecords.MAP_MD"), {
                    [Op.in]: mode !== "all" ? [mode] : config.modeList
                }),
            },
            order: [
                ["MATCH_CNT", "DESC"]
            ],
            raw: true
        });
    };

    /** 멤버에 대한 친구 정보 추가
     * @param members 멤버 목록
     * @param season 최신 시즌
     */
    static updateFriends = async (members, season) => {
        const friends = [];

        await sequelize.transaction(async (t) => {
            await Promise.all(
                members.map(async member => {
                    await UserBattles.findAll({
                        include: [
                            {
                                model: Maps,
                                required: true,
                                attributes: []
                            },
                        ],
                        attributes: ["USER_ID", [col("PLAYER_ID"), "FRIEND_ID"], "MATCH_TYP", "MATCH_GRD", [col("PLAYER_NM"), "FRIEND_NM"],
                            [fn("COUNT", literal("*")), "MATCH_CNT"],
                            [fn("COUNT", literal("CASE WHEN MATCH_RES = -1 THEN 1 END")), "MATCH_CNT_VIC"],
                            [fn("COUNT", literal("CASE WHEN MATCH_RES = 1 THEN 1 END")), "MATCH_CNT_DEF"],
                            [fn("ROUND", fn("SUM",
                                literal("CASE WHEN MATCH_RES = -1 THEN 0.005 * CAST(MATCH_GRD AS UNSIGNED) WHEN MATCH_RES = 0 THEN 0.0025 * CAST(MATCH_GRD AS UNSIGNED)  ELSE 0.001 * CAST(MATCH_GRD AS UNSIGNED) END")), 2), "FRIEND_PT"],
                            [col("Map.MAP_MD"), "MAP_MD"],
                        ],
                        where: {
                            USER_ID: member,
                            PLAYER_ID: {
                                [Op.and]: {
                                    [Op.not]: member,
                                    [Op.in]: members
                                }
                            },
                            MATCH_DT: {
                                [Op.gt]: season.SEASON_BGN_DT
                            },
                            [Op.or]: {
                                MATCH_TYP: 0,
                                [Op.and]: {
                                    MATCH_TYP: 3,
                                    MATCH_TYP_RAW: 3,
                                }
                            }
                        },
                        group: ["USER_ID", "FRIEND_ID", "MATCH_TYP", "MATCH_GRD", "PLAYER_NM", "MAP_MD"],
                        raw: true,
                        transaction: t
                    }).then(result => {
                        result.length > 0 && friends.push(...result);
                    });
                })
            );

            await UserFriends.bulkCreate(friends, {
                ignoreDuplicates: true,
                updateOnDuplicate: ["MATCH_CNT", "MATCH_CNT_VIC", "MATCH_CNT_DEF", "FRIEND_PT"],
                transaction: t
            });
        });
    };

    /** 멤버에 대한 기록 정보 추가
     * @param members 멤버 목록
     * @param season 최신 시즌
     */
    static updateSeasonRecords = async (members, season) => {
        const records = [];

        await sequelize.transaction(async (t) => {
            await Promise.all(members.map(async member => {
                await UserBattles.findAll({
                    include: [
                        {
                            model: Maps,
                            required: true,
                            attributes: []
                        },
                    ],
                    attributes: ["USER_ID", "MATCH_TYP", "MATCH_GRD",
                        [fn("SUM", literal("CASE WHEN MATCH_TYP = 0 THEN MATCH_CHG + MATCH_CHG_RAW ELSE 0 END")), "MATCH_CHG"],
                        [fn("COUNT", literal("*")), "MATCH_CNT"],
                        [fn("COUNT", literal("CASE WHEN MATCH_RES = -1 THEN 1 END")), "MATCH_CNT_VIC"],
                        [fn("COUNT", literal("CASE WHEN MATCH_RES = 1 THEN 1 END")), "MATCH_CNT_DEF"],
                        [col("Map.MAP_MD"), "MAP_MD"],
                    ],
                    where: {
                        [Op.or]: [
                            {
                                USER_ID: member,
                                PLAYER_ID: member,
                                MATCH_DT: {
                                    [Op.gt]: season.SEASON_BGN_DT
                                },
                            },
                            {
                                USER_ID: member,
                                PLAYER_ID: member,
                                MATCH_DT: {
                                    [Op.gt]: season.SEASON_BGN_DT
                                },
                                MATCH_TYP: 3,
                                MATCH_TYP_RAW: 3,
                            }
                        ]
                    },
                    group: ["USER_ID", "MATCH_TYP", "MATCH_GRD", "MAP_MD"],
                    raw: true,
                    transaction: t
                }).then(result => {
                    result.length > 0 && records.push(...result);
                });
            }));

            await UserRecords.bulkCreate(records, {
                ignoreDuplicates: true,
                updateOnDuplicate: ["MATCH_CHG", "MATCH_CNT", "MATCH_CNT_VIC", "MATCH_CNT_DEF"],
                transaction: t
            });
        });
    };

    static selectBattles = async (id, beginDate, endDate) => {
        return await UserBattles.findAll({
            include: [
                {
                    model: Maps,
                    required: true,
                    attributes: []
                },
            ],
            attributes: ["MATCH_DT", "BRAWLER_ID", "MATCH_TYP",
                "MATCH_RNK", "MATCH_RES", "Map.MAP_MD"],
            where: {
                USER_ID: `#${id}`,
                PLAYER_ID: `#${id}`,
                MATCH_DT: {
                    [Op.between]: [beginDate, endDate]
                },
            },
            order: [["MATCH_DT", "DESC"]],
            raw: true
        }).then((result) => {
            return result.reduce((acc, current) => {
                if (acc.findIndex(({MATCH_DT}) =>
                    JSON.stringify(MATCH_DT) === JSON.stringify(current.MATCH_DT)) === -1) {
                    acc.push(current);
                }
                return acc;
            }, []);
        });
    };

    static selectSeasonRecords = async (id, modes) => {
        return await UserRecords.findAll({
            attributes: [
                "MATCH_TYP",
                "MATCH_GRD",
                "MAP_MD",
                "MATCH_CNT",
                "MATCH_CNT_VIC",
                "MATCH_CNT_DEF",
                [fn("ROUND",
                    literal("MATCH_CNT_VIC * 100 / SUM(`MATCH_CNT_VIC` + `MATCH_CNT_DEF`)")
                    , 2
                ), "MATCH_VIC_R"],
            ],
            where: {
                USER_ID: `#${id}`
            },
            group: [
                "MATCH_TYP",
                "MATCH_GRD",
                "MAP_MD"
            ],
            raw: true
        }).then(data => {
            const totalData = [];
            data.forEach(item => {
                const {MATCH_TYP, MATCH_CNT, MATCH_CNT_VIC, MATCH_CNT_DEF, FRIEND_PT} = item;
                if (!totalData[MATCH_TYP]) {
                    totalData[MATCH_TYP] = {
                        MATCH_TYP,
                        MATCH_CNT: 0,
                        MATCH_CNT_VIC: 0,
                        MATCH_CNT_DEF: 0
                    };
                }
                totalData[MATCH_TYP].MATCH_CNT += MATCH_CNT;
                totalData[MATCH_TYP].MATCH_CNT_VIC += MATCH_CNT_VIC;
                totalData[MATCH_TYP].MATCH_CNT_DEF += MATCH_CNT_DEF;
            });

            const keyData = data.reduce(function (result, current) {
                result[current.MATCH_TYP] = result[current.MATCH_TYP] || [];
                result[current.MATCH_TYP].push(current);
                return result;
            }, {});
            const keys = Object.keys(keyData);

            return keys.map(key => {
                return {
                    ...totalData[key],
                    MATCH_VIC_R: totalData[key].MATCH_CNT_VIC * 100 / (totalData[key].MATCH_CNT_VIC + totalData[key].MATCH_CNT_DEF),
                    MATCH_L: keyData[key]
                };
            });
        });
    };

    static selectFriends = async (id) => {
        return await UserFriends.findAll({
            attributes: [
                "FRIEND_ID",
                "MATCH_TYP",
                "MATCH_GRD",
                "MAP_MD",
                "FRIEND_NM",
                "MATCH_CNT",
                "MATCH_CNT_VIC",
                "MATCH_CNT_DEF",
                [fn("ROUND",
                    literal("MATCH_CNT_VIC * 100 / SUM(`MATCH_CNT_VIC` + `MATCH_CNT_DEF`)")
                    , 2
                ), "MATCH_VIC_R"],
                [fn("ROUND", col("FRIEND_PT"), 2), "FRIEND_PT"]
            ],
            where: {
                USER_ID: `#${id}`
            },
            group: [
                "FRIEND_ID",
                "MATCH_TYP",
                "MATCH_GRD",
                "MAP_MD",
                "FRIEND_NM"
            ],
            raw: true
        }).then(data => {
            const totalData = [];
            data.forEach(item => {
                const {FRIEND_ID, FRIEND_NM, MATCH_CNT, MATCH_CNT_VIC, MATCH_CNT_DEF, FRIEND_PT} = item;
                if (!totalData[FRIEND_ID]) {
                    totalData[FRIEND_ID] = {
                        FRIEND_ID,
                        FRIEND_NM,
                        MATCH_CNT: 0,
                        MATCH_CNT_VIC: 0,
                        MATCH_CNT_DEF: 0,
                        FRIEND_PT: 0
                    };
                }
                totalData[FRIEND_ID].MATCH_CNT += MATCH_CNT;
                totalData[FRIEND_ID].MATCH_CNT_VIC += MATCH_CNT_VIC;
                totalData[FRIEND_ID].MATCH_CNT_DEF += MATCH_CNT_DEF;
                totalData[FRIEND_ID].FRIEND_PT += FRIEND_PT;
            });

            const keyData = data.reduce(function (result, current) {
                result[current.FRIEND_ID] = result[current.FRIEND_ID] || [];
                result[current.FRIEND_ID].push(current);
                return result;
            }, {});
            const keys = Object.keys(keyData);

            return keys.map(key => {
                return {
                    ...totalData[key],
                    MATCH_VIC_R: totalData[key].MATCH_CNT_VIC * 100 / (totalData[key].MATCH_CNT_VIC + totalData[key].MATCH_CNT_DEF),
                    MATCH_L: keyData[key]
                };
            });
        });
    };

    static selectMemberBattles = async (id, beginDate, endDate) => {
        return await UserBattles.findAll({
            include: [
                {
                    model: Maps,
                    required: true,
                    attributes: []
                },
            ],
            attributes:
                [
                    "USER_ID",
                    [fn("JSON_OBJECT",
                        "MATCH_DT", col("MATCH_DT"),
                        "MATCH_DUR", col("MATCH_DUR"),
                        "MAP_ID", col("UserBattles.MAP_ID"),
                        "MAP_MD", col("Map.MAP_MD"),
                        "MAP_NM", col("Map.MAP_NM"),
                        "MATCH_TYP_RAW", col("MATCH_TYP_RAW"),
                        "MATCH_TYP", col("MATCH_TYP"),
                        "MAP_MD_CD", col("MAP_MD_CD"),
                        "MATCH_GRD", col("MATCH_GRD"),
                        "MATCH_CHG", col("MATCH_CHG")),
                        "BATTLE_INFO"
                    ],
                    [fn("JSON_ARRAYAGG",
                        fn("JSON_OBJECT",
                            "PLAYER_ID", col("PLAYER_ID"),
                            "PLAYER_NM", col("PLAYER_NM"),
                            "PLAYER_TM_NO", col("PLAYER_TM_NO"),
                            "BRAWLER_ID", col("BRAWLER_ID"),
                            "BRAWLER_PWR", col("BRAWLER_PWR"),
                            "BRAWLER_TRP", col("BRAWLER_TRP"),
                            "MATCH_RNK", col("MATCH_RNK"),
                            "MATCH_RES", col("MATCH_RES"),
                            "MATCH_CHG", col("MATCH_CHG"))),
                        "BATTLE_PLAYERS"]
                ],
            group: [
                "USER_ID", "MATCH_DT",
                "MATCH_DUR", "MAP_MD_CD",
                "UserBattles.MAP_ID", "Map.MAP_MD",
                "MATCH_TYP", "MATCH_TYP_RAW",
                "MATCH_GRD", "MATCH_CHG"
            ],
            where: {
                MATCH_DT: {
                    [Op.between]: [beginDate, endDate]
                },
                USER_ID: `#${id}`
            },
            order: [["MATCH_DT", "DESC"]]
        });
    };
}