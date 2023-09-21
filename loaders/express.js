import redis from "redis"
import express from "express";

import morgan from "morgan";
import cors from "cors";

import cookieParser from "cookie-parser";
import session from "express-session";
import RedisStore from "connect-redis";

import index from "../routes/index.js";
import blossom from "../routes/blossom.js";
import user from "../routes/user.js";
import brawlers from "../routes/brawlers.js";
import events from "../routes/events.js";
import maps from "../routes/maps.js";
import modes from "../routes/modes.js";
import rank from "../routes/rank.js";

import config from "../config/config.js";

export default async () => {
    const app = express();
    const client = redis.createClient(config.redisPort);
    const redisStore = new RedisStore({client});

    app.use(cors({
        credentials: true,
        optionsSuccessStatus: 200,  // 응답 상태 200으로 설정
        origin: "*"
    }));

    if (config.project === "pro") {
        app.use(morgan("combined"));
    } else {
        app.use(morgan("dev"));
    }

    app.use(express.json({limit: "50mb"}));
    app.use(express.urlencoded({
        limit: "50mb",
        extended: false
    }));

    // routes
    app.use("/", index);
    app.use("/blossom", blossom);
    app.use("/brawlian", user);
    app.use("/brawlers", brawlers);
    app.use("/maps", maps);
    app.use("/modes", modes);
    app.use("/rotation", events);
    app.use("/rank", rank);

    app.use((req, res) => {
        res.status(404).send("Not Found");
    });

    app.use((err, req, res) => {
        console.error(err);
        res.status(500).send(err.message);
    });

    app.use(cookieParser(process.env.COOKIE_SECRET));
    app.use(session({
        store: redisStore,
        resave: false,
        saveUninitialized: false,
        secret: process.env.COOKIE_SECRET,
        cookie: {
            httpOnly: true,
            secure: false,
        },
        name: "session-cookie",
    }));

    app.listen(config.port, () => {
        console.log("🌸 | PORT NUM", config.port);
    });
}