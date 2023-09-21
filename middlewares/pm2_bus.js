import pm2 from "pm2";
import path from "path";
import {isMainThread, parentPort, Worker} from "worker_threads";
import {fileURLToPath} from "url";
import {workerService} from "../services/worker_service.js";

import config from "../config/config.js";
import {Users} from "../models/index.js";
import {authService} from "../services/auth_service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 메인 스레드 코드
if (isMainThread) {
    console.log("hello main");
    const workers = [];

    pm2.launchBus(async (err, pm2Bus) => {
        pm2Bus.on(`child:start`, async ({data}) => {
            const users = data.userList[config.scheduleNumber - 1];

            const workerPromises = [];
            const chunkSize = Math.ceil(users.length / 20);

            for (let i = 0; i < 19; i++) {
                const workerPromise = new Promise((resolve) => {
                    const worker = new Worker(path.join(__dirname, "../app"));
                    workers.push(worker);
                    const chunk = users.slice(chunkSize * i, chunkSize * (i + 1));

                    worker.on("message", async (message) => {
                        console.log(`worker:create from worker: ${message}`);
                        resolve(message);
                    });

                    worker.postMessage({
                        eventName: "worker:create",
                        chunkNumber: i + 1,
                        userList: chunk
                    });
                });

                workerPromises.push(workerPromise);
            }

            const results = await Promise.all(workerPromises);
            console.log("All worker:create completed:", results);

            workerService.UserList = users.slice(chunkSize * 19);
            await workerService.fetchUsers();
        });

        pm2Bus.on(`child:update`, async ({data}) => {
            const workerPromises = [];

            if (config.scheduleNumber === data.scheduleNumber) {
                console.log("update message: ", data.scheduleNumber);

                for (const i in workers) {
                    const workerPromise = new Promise((resolve) => {
                        workers[i].on("message", async (message) => {
                            console.log(`worker:getUserNumber from worker: ${message}`);
                            resolve(message);
                        });

                        workers[i].postMessage({
                            eventName: "worker:getUserNumber",
                        });
                    });

                    workerPromises.push(workerPromise);
                }

                const results = await Promise.all(workerPromises);
                const userLengthList = results.map(item => parseInt(item));
                const minLengthIndex = userLengthList.indexOf(Math.min(...userLengthList));

                workers[minLengthIndex].postMessage({
                    eventName: "worker:insertUsers",
                    userList: data.userList
                });

                console.log("worker:getUserNumber completed:", userLengthList, `min index at worker${minLengthIndex + 1}`);
                console.log("worker:insertUsers completed:", `inserted worker${minLengthIndex + 1}`, data.userList);
            }
        });
    });
} else { // 워커 스레드 코드
    parentPort.on("message", async (message) => {
        if (message.eventName === "worker:create") {
            workerService.UserList = message.userList;

            await workerService.fetchUsers();
            parentPort.postMessage(`worker${message.chunkNumber} created!`);
        } else if (message.eventName === "worker:getUserNumber") {
            parentPort.postMessage(workerService.UserList.length);
        } else if (message.eventName === "worker:insertUsers") {
            await Promise.all(message.userList.map(async user => {
                await Users.update({
                    CYCLE_NO: config.scheduleNumber
                }, {
                    where: {
                        USER_ID: `#${user}`,
                    },
                });

                await authService.manageUsers(user, true);
            }));
        }
    });
}