import pm2 from "pm2";
import {workerService} from "../services/worker_service.js";

import config from "../config/config.js";

pm2.launchBus((err, pm2Bus) => {
    pm2Bus.on(`process:msg`, async ({data}) => {
        workerService.UserList = data.userList[config.scheduleNumber - 1];
        await workerService.fetchUsers();
    });
});