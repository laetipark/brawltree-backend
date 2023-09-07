import axios from "axios";

import config from "../config/config.js";

export class clubService {
    static getClubList = async () => {
        const clubs = await axios({
            url: `${config.url}/rankings/global/clubs?limit=200`,
            method: "GET",
            headers: config.headers,
        }).then(res => {
            return res.data;
        }).catch(err => console.error(err));

        return clubs.items.map(club => club.tag);
    };

    static getClubMembers = async (clubTag) => {
        return await axios({
            url: `${config.url}/clubs/${clubTag.replace("#", "%23")}/members`,
            method: "GET",
            headers: config.headers,
        }).then(async res => {
            const members = await res.data;
            return members.items.map(club => club.tag);
        }).catch(err => console.error(err));
    };
}