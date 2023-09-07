import pm2 from "pm2";

import expressLoader from "./loaders/express.js";
import sequelizeLoader from "./loaders/sequelize.js";
import cron from "node-cron";

import {Users} from "./models/index.js";
import {col, fn} from "sequelize";

// import {clubService} from "./services/club_service.js";
import {brawlerService} from "./services/brawler_service.js";
import {rotationService} from "./services/rotation_service.js";
import {seasonService} from "./services/season_service.js";

import "./middlewares/pm2_bus.js";

import config from "./config/config.js";
import {battleService} from "./services/battle_service.js";

// Express 서버를 하나의 워커 프로세스에서 실행
await sequelizeLoader();

if (config.scheduleNumber === 0) {
    /*
    const clubs = await clubService.getClubList();
    for (const club of clubs) {
        const clubMembers = await clubService.getClubMembers(club);

        for (const user of clubMembers) {
            await Users.findOrCreate({
                where: {
                    USER_ID: user
                },
                defaults: {
                    USER_LST_CK: new Date(0),
                    USER_LST_BT: new Date(0),
                }
            });
        }
    }
    */

    await expressLoader();

    await cron.schedule("5 0-59/20 * * * *", async () => {
        await seasonService.insertSeason();
        await rotationService.insertRotation();
        await rotationService.updateRotation();
        await rotationService.deleteRotation();
    });

    await cron.schedule("5 0 0-23/1 * * *", async () => {
        await brawlerService.insertBrawler();
        await battleService.updateBattleTrio();
        await battleService.updateBattlePicks();
    });

    const users = await Users.findAll({
        attributes: [[fn("REPLACE", col("USER_ID"), "#", ""), "USER_ID"]],
        order: [["USER_LST_CK", "ASC"]]
    }).then(result => {
        return result.map(user => user.USER_ID);
    });
    const userNumber = users.length;
    const chunkSize = userNumber / 2;

    pm2.connect((err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        pm2.list((err, processList) => {
            if (err) {
                console.error(err);
                pm2.disconnect();
                return;
            }

            if (processList.length > 0) {
                process.send({
                    type: `child:start`,
                    data: {
                        userList: [users.slice(0, chunkSize), users.slice(chunkSize)]
                    }
                });
            } else {
                console.log("No processes found.");
            }
            pm2.disconnect();
        });
    });
}