import pm2 from "pm2";
import {isMainThread, parentPort, Worker} from "worker_threads";
import {fileURLToPath} from 'url';
import {workerService} from "../services/worker_service.js";

import config from "../config/config.js";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 메인 스레드 코드
if (isMainThread) {
    let threadNumber = 0;
    console.log(threadNumber);

    pm2.launchBus(async (err, pm2Bus) => {
        pm2Bus.on(`child:start`, async ({data}) => {
            const users = data.userList[config.scheduleNumber - 1];

            const workerPromises = [];
            const chunkSize = Math.ceil(users.length / 20);

            for (let i = 0; i < 19; i++) {
                threadNumber++;
                const workerPromise = new Promise((resolve) => {
                    const worker = new Worker(path.join(__dirname, '../app'));
                    const chunk = users.slice(chunkSize * i, chunkSize * (i + 1));

                    worker.on('message', async (message) => {
                        console.log(`Message from worker: ${message}`);
                        resolve(message);
                    });

                    worker.postMessage({
                        chunkNumber: i + 1,
                        userList: chunk,
                        message: `Hello Worker${i + 1}!`,
                    });
                });

                workerPromises.push(workerPromise);
            }

            const results = await Promise.all(workerPromises);
            console.log('All workers completed:', results);

            console.log("main : ", users.slice(chunkSize), chunkSize);
            workerService.UserList = users.slice(chunkSize * 19);
            threadNumber++;
            console.log(threadNumber);

            await workerService.fetchUsers();
        });
    });
} else { // 워커 스레드 코드
    parentPort.on("message", async (message) => {
        console.log(`Message from main thread:`, message.message);

        const result = await performWork(message.userList);
        parentPort.postMessage(result);
    });

    const performWork = async users => {
        console.log(`worker : `, users);
        workerService.UserList = users;

        await workerService.fetchUsers();
        return "Work completed";
    };
}