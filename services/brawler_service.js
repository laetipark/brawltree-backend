import axios from "axios";
import {BrawlerStats, Brawlers} from "../models/index.js";

import brawlerJSON from "../public/json/brawlers.json" assert {type: "json"};
import config from "../config/config.js";
import {literal} from "sequelize";

export class brawlerService {
    static insertBrawler = async () => {

        const brawlers = await axios({
            url: `${config.url}/brawlers`,
            method: "GET",
            headers: config.headers,
        }).then(res => {
            return res.data.items.map(brawler => {
                return {
                    BRAWLER_ID: brawler.id,
                    BRAWLER_NM: brawler.name,
                    BRAWLER_RRT: brawlerJSON.items.find(item => item?.id === brawler.id)?.rarity || null,
                    BRAWLER_CL: brawlerJSON.items.find(item => item?.id === brawler.id)?.class || null,
                    BRAWLER_GNDR: brawlerJSON.items.find(item => item?.id === brawler.id)?.gender || null,
                    BRAWLER_ICN: brawlerJSON.items.find(item => item?.id === brawler.id)?.icon || null,
                    BRAWLER_SP1_ID: brawler.starPowers[0].id,
                    BRAWLER_SP1_NM: brawler.starPowers[0].name,
                    BRAWLER_SP2_ID: brawler.starPowers[1].id,
                    BRAWLER_SP2_NM: brawler.starPowers[1].name,
                    BRAWLER_GDG1_ID: brawler.gadgets[0].id,
                    BRAWLER_GDG1_NM: brawler.gadgets[0].name,
                    BRAWLER_GDG2_ID: brawler.gadgets[1].id,
                    BRAWLER_GDG2_NM: brawler.gadgets[1].name,
                };
            });
        }).catch(err => console.error(err));

        await Brawlers.bulkCreate(brawlers, {
            ignoreDuplicates: true,
            updateOnDuplicate: [
                "BRAWLER_RRT", "BRAWLER_CL", "BRAWLER_GNDR", "BRAWLER_ICN",
                "BRAWLER_SP1_ID", "BRAWLER_SP1_NM",
                "BRAWLER_SP2_ID", "BRAWLER_SP2_NM",
                "BRAWLER_GDG1_ID", "BRAWLER_GDG1_NM",
                "BRAWLER_GDG2_ID", "BRAWLER_GDG2_NM",
            ],
        });
    };

    /** 브롤러 목록 가져오기 */
    static selectBrawlers = async () => {
        return await Brawlers.findAll();
    };

    /** 브롤러에 대한 승률 정보 반환 */
    static selectTotalBrawlerStats = async () => {
        return await BrawlerStats.findAll({
            attributes: ["BRAWLER_ID", "MATCH_TYP",
                [literal("SUM(`MATCH_CNT`) * 100 / SUM(SUM(`MATCH_CNT`)) OVER(PARTITION BY MATCH_TYP)"), "MATCH_CNT_RATE"],
                [literal("SUM(`MATCH_CNT_VIC`) * 100 / (SUM(`MATCH_CNT_VIC`) + SUM(`MATCH_CNT_DEF`))"), "MATCH_CNT_VIC_RATE"]],
            group: ["BRAWLER_ID", "MATCH_TYP"]
        });
    };
}