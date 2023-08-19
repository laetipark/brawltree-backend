import expressLoader from "./loaders/express.js";
import sequelizeLoader from "./loaders/sequelize.js";
import cron from "node-cron";
import {seasonService} from "./service/season_service.js";
import {rotationService} from "./service/rotation_service.js";
import {brawlerService} from "./service/brawler_service.js";
import config from "./config/config.js";
import schedulerLoader from "./loaders/scheduler.js";

// Express 서버를 하나의 워커 프로세스에서 실행
await sequelizeLoader();

if (config.scheduleNumber === 0) {
    await expressLoader();

    await cron.schedule('5 0-59/20 * * * *', async () => {
        await seasonService.insertSeason();
        await rotationService.insertRotation();
        await rotationService.updateRotation();
        await rotationService.deleteRotation();
    });

    await cron.schedule('5 0 0-23/1 * * *', async () => {
        await brawlerService.insertBrawler();
    });
} else {
    await schedulerLoader();
}