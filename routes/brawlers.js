import express from "express";
import {brawlerService} from "../services/brawler_service.js";

const router = express.Router();

router.get('/', async (req, res) => {
    const brawlers = await brawlerService.selectBrawlers();

    res.send({
        brawlers: brawlers
    });
});

router.get('/stats', async (req, res) => {
    const {brawler} = req.query;
    const brawlerStats = await brawlerService.selectTotalBrawlerStats(brawler);

    res.send({
        brawlerStats: brawlerStats
    });
});

export default router;
