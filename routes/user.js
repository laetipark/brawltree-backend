import express from "express";
import {authService} from "../services/auth_service.js";
import {userService} from "../services/user_service.js";
import {rotationService} from "../services/rotation_service.js";
import {seasonService} from "../services/season_service.js";

const router = express.Router();

router.get('/:id', async (req, res) => {
    const id = req.params.id;

    const user = await userService.selectUser(id);
    console.log("hello", new Date());
    if (user === null || new Date(new Date(user.USER_LST_CK).getTime() + (5 * 60 * 1000)) < new Date()) {
        await authService.insertUsers(id);
    }

    res.send({
        user: user,
    });
});

router.get('/:id/profile', async (req, res) => {
    const id = req.params.id;
    const userProfile = await userService.selectUserProfile(id);

    res.send({
        userProfile: userProfile,
    });
});

router.get('/:id/battles/summary', async (req, res) => {
    const id = req.params.id;
    const {type} = req.query;
    const {mode} = req.query;

    const season = await seasonService.selectRecentSeason();
    const [userBattles, userBrawlers] = await userService.selectUserBattleRecords(id, type, mode, season);
    const rotationTL = await rotationService.selectRotationTL();
    const rotationPL = await rotationService.selectRotationPL();

    res.send({
        userBattles: userBattles,
        userBrawlers: userBrawlers,
        rotationTL: rotationTL,
        rotationPL: rotationPL,
        season: season
    });
});

router.get('/:id/battles/logs', async (req, res) => {
    const id = req.params.id;
    const {type} = req.query;
    const {mode} = req.query;

    const season = await seasonService.selectRecentSeason();
    const [userRecentBattles, userRecentBrawlers, userBattles] = await userService.selectUserBattles(id, type, mode, season);

    res.send({
        userRecentBattles: userRecentBattles,
        userRecentBrawlers: userRecentBrawlers,
        userBattles: userBattles
    });
});

router.get('/:id/brawlers', async (req, res) => {
    const id = req.params.id;
    const season = await seasonService.selectRecentSeason();
    const [userBrawlers, userBrawlerItems, userBrawlerGraphs] = await userService.selectUserBrawlers(id,season);

    res.send({
        userBrawlers: userBrawlers,
        userBrawlerItems: userBrawlerItems,
        userBrawlerGraphs: userBrawlerGraphs
    });
});


export default router;
