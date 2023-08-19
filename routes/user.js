import express from "express";
import {authService} from "../service/auth_service.js";
import {userService} from "../service/user_service.js";
import {seasonService} from "../service/season_service.js";

const router = express.Router();

router.get('/', async (req, res) => {

});

router.get('/:id', async (req, res) => {
    const id = req.params.id;

    const user = await userService.selectUser(id);
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

router.get('/:id/battles/:type/summary', async (req, res) => {
    const id = req.params.id;
    const type = req.params.type;

    const season = await seasonService.selectRecentSeason();
    const [userBattles, userBrawlers, userDailyBattles] = await userService.selectUserBattleRecordSummary(id, type, season);

    console.log(userDailyBattles)

    res.send({
        userBattles: userBattles,
        userBrawlers: userBrawlers,
        userDailyBattles: userDailyBattles,
        season: season
    });
});

router.get('/:id/brawlers', async (req, res) => {
    const id = req.params.id;
    const [userBrawlers, userBrawlerItems, userBrawlerGraphs] = await userService.selectUserBrawlers(id);

    res.send({
        userBrawlers: userBrawlers,
        userBrawlerItems: userBrawlerItems,
        userBrawlerGraphs: userBrawlerGraphs
    });
});


export default router;
