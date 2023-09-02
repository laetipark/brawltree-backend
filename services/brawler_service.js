import brawlerJSON from "../public/json/brawlers.json" assert {type: "json"};
import {Brawlers} from "../models/index.js";
import fetch from "node-fetch";
import config from "../config/config.js";

export class brawlerService {
    static insertBrawler = async () => {
        const brawlers = await fetch(`${config.url}/brawlers`, {
            method: "GET",
            headers: config.headers,
        }).then(res => {
            return res.json();
        });

        for (const i in brawlers.items) {
            await Brawlers.upsert({
                BRAWLER_ID: brawlers.items[i].id,
                BRAWLER_NM: brawlers.items[i].name,
                BRAWLER_RRT: brawlerJSON.items[i].rarity,
                BRAWLER_CL: brawlerJSON.items[i].class,
                BRAWLER_GNDR: brawlerJSON.items[i].gender,
                BRAWLER_ICN: brawlerJSON.items[i].icon,
                BRAWLER_SP1_ID: brawlers.items[i].starPowers[0].id,
                BRAWLER_SP1_NM: brawlers.items[i].starPowers[0].name,
                BRAWLER_SP2_ID: brawlers.items[i].starPowers[1].id,
                BRAWLER_SP2_NM: brawlers.items[i].starPowers[1].name,
                BRAWLER_GDG1_ID: brawlers.items[i].gadgets[0].id,
                BRAWLER_GDG1_NM: brawlers.items[i].gadgets[0].name,
                BRAWLER_GDG2_ID: brawlers.items[i].gadgets[1].id,
                BRAWLER_GDG2_NM: brawlers.items[i].gadgets[1].name,
            });
        }
    };
}