import express from "express";

import {blossomService} from "../services/blossom_service.js";
import {authService} from "../services/auth_service.js";
import {seasonService} from "../services/season_service.js";
import {rotationService} from "../services/rotation_service.js";

const router = express.Router();

router.get("/main/members", async (req, res) => {
    const members = await blossomService.selectMemberSummary();

    res.send({
        members: members
    });
});

router.get("/main/battles", async (req, res) => {
    const battles = await blossomService.selectBattleSummary();

    res.send({
        battles: battles
    });
});

router.get("/main/season", async (req, res) => {
    const season = await blossomService.selectSeasonSummary();

    res.send({
        season: season
    });
});

router.get("/main/rotation", async (req, res) => {
    const rotation = await rotationService.selectRotationTL();

    res.send({
        rotation: rotation
    });
});

router.get("/main/brawlers", async (req, res) => {
    const brawlers = await blossomService.selectBrawlerSummary();

    res.send({
        brawlers: brawlers
    });
});

router.get("/member/table", async (req, res) => {
    const members = await blossomService.selectMemberTable();

    res.send({
        members: members
    });
});

router.get("/brawler/table", async (req, res) => {
    const {brawler} = req.query;
    const members = await blossomService.selectBrawlerTable(brawler);

    res.send({
        members: members
    });
});

router.get("/battle/table", async (req, res) => {
    const {date} = req.query;
    const nextDate = new Date(new Date(date).getTime() + 1000 * 60 * 60 * 24);
    const {type} = req.query;
    const {mode} = req.query;

    const gameModesTL = await rotationService.selectModeTL();
    const gameModesPL = await rotationService.selectModePL();
    const season = await seasonService.selectRecentSeason();
    const battles = await blossomService.selectBattlesTable(date, nextDate, type, mode);

    res.send({
        gameModesTL: gameModesTL,
        gameModesPL: gameModesPL,
        battles: battles,
        season: season
    });
});

router.get("/season/table", async (req, res) => {
    const {type} = req.query;
    const {mode} = req.query;
    const gameModesTL = await rotationService.selectModeTL();
    const gameModesPL = await rotationService.selectModePL();
    const season = await seasonService.selectRecentSeason();
    const members = await blossomService.selectSeasonTable(type, mode);

    res.send({
        gameModesTL: gameModesTL,
        gameModesPL: gameModesPL,
        members: members,
        season: season
    });
});

router.get("/member/:id/battles", async (req, res) => {
    const id = req.params.id;
    const {date} = req.query;
    const nextDate = new Date(new Date(date).getTime() + 1000 * 60 * 60 * 24);

    const season = await seasonService.selectRecentSeason();
    const battles = await blossomService.selectBattles(id, date, nextDate);

    res.send({
        battles,
        season
    });
});

router.get("/member/:id/friends", async (req, res) => {
    const id = req.params.id;
    const friends = await blossomService.selectFriends(id);

    res.send({
        friends
    });
});

router.get("/member/:id/season", async (req, res) => {
    const id = req.params.id;
    const modes = await rotationService.selectModeTL();
    const season = await blossomService.selectSeasonRecords(id, modes);

    res.send({
        season
    });
});

router.get("/battle/:id", async (req, res) => {
    const id = req.params.id;
    const {date} = req.query;
    const nextDate = new Date(new Date(date).getTime() + 1000 * 60 * 60 * 24);

    const season = await seasonService.selectRecentSeason();
    const battles = await blossomService.selectMemberBattles(id, date, nextDate);

    res.send({
        battles: battles,
        season: season
    });
});

router.put("/members", async (req, res) => {
    const {members: memberParam} = req.query;
    const members = JSON.parse(memberParam);

    await blossomService.updateMembers(members);
    res.send({
        message: "Blossom Members Updated!",
        members: members
    });
});

router.put("/members/profile", async (req, res) => {
    const {members: memberParam} = req.query;
    const members = JSON.parse(memberParam);

    await Promise.all(members.map(async member => {
        const user = await authService.fetchUserRequest(member.replace("#", ""));

        if (user !== undefined) {
            await authService.updateUserProfile(user);
        }
    }));
    res.send({
        message: "User Profile Updated!",
        user: members
    });
});

router.put("/friends", async (req, res) => {
    const {members: memberParam} = req.query;
    const members = JSON.parse(memberParam);

    const season = await seasonService.selectRecentSeason();
    await blossomService.updateFriends(members, season);

    res.send({
        message: "Blossom Friends Updated!",
        members: members
    });
});

router.put("/records", async (req, res) => {
    const {members: memberParam} = req.query;
    const members = JSON.parse(memberParam);

    const season = await seasonService.selectRecentSeason();
    await blossomService.updateSeasonRecords(members, season);

    res.send({
        message: "Blossom Records Updated!",
        members: members
    });
});

export default router;