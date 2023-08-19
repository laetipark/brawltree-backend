import {Users} from "../models/index.js";
import {col, fn} from "sequelize";

import {authService} from "../service/auth_service.js";
import config from "../config/config.js";

export default async () => {
    const getUserLists = (users) => {
        const chunkSize = Math.ceil(users.length / 10);
        const userList = [];

        for (let i = 0; i < users.length; i += chunkSize) {
            userList.push(users.slice(i, i + chunkSize));
        }

        return userList;
    }

    const fetchUsers = async (userLists) => {

        const REQUEST_INTERVAL_MS = 1000; // 1초에 한 번씩 요청

        const makeAPIRequest = async user => {
            try {
                await Users.update({
                    CYCLE_NO: config.scheduleNumber
                }, {
                    where: {
                        USER_ID: `#${user.USER_ID}`,
                    },
                });

                await authService.insertUserBattles(user.USER_ID, true);
            } catch (error) {
                return null;
            }
        };

        const processRequests = async users => {
            for (const user of users) {
                await makeAPIRequest(user);
                await new Promise(resolve => setTimeout(resolve, REQUEST_INTERVAL_MS));
            }
        };

        await Promise.all([
            userLists.map(users => processRequests(users))
        ])
    };

    const users = await Users.findAll({
        attributes: [[fn("REPLACE", col("USER_ID"), "#", ""), "USER_ID"]],
        order: [["USER_LST_CK", "ASC"]]
    });
    const userNumber = users.length;
    const chunkSize = userNumber / 2;

    const userLists = getUserLists(
        users.slice(
            chunkSize * config.scheduleNumber,
            chunkSize * (config.scheduleNumber + 1))
    );
    await fetchUsers(userLists);
};