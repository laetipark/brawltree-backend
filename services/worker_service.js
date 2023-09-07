import {Users} from "../models/index.js";
import {authService} from "./auth_service.js";

import config from "../config/config.js";

export class workerService {
    static UserList = [];

    static fetchUsers = async () => {
        const REQUEST_INTERVAL_MS = 20000; // 20초에 한 번씩 요청

        const getUserLists = (users) => {
            const chunkSize = Math.ceil(users.length / 10);
            const userList = [];

            for (let i = 0; i < users.length; i += chunkSize) {
                userList.push(users.slice(i, i + chunkSize));
            }

            return userList;
        };

        const makeAPIRequest = async user => {
            try {
                await Users.update({
                    CYCLE_NO: config.scheduleNumber
                }, {
                    where: {
                        USER_ID: `#${user}`,
                    },
                });

                await authService.manageUsers(user, true);
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
            getUserLists(this.UserList).map(users => processRequests(users))
        ]);
    };
}