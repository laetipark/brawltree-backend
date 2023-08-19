import {Maps, MapRotation, Seasons} from "../models/index.js";

export class seasonService {
    static checkSeason = async () => {
        return await Seasons.findOne({
            order: [["SEASON_BGN_DT", "DESC"]],
            raw: true,
        }).then(async result => {
            if (result === null) {
                await Seasons.create({
                    id: "10",
                    SEASON_BGN_DT: "2022-01-03T18:00:00",
                    SEASON_END_DT: "2022-03-07T17:50:00",
                });

                return this.checkSeason();
            } else {
                return result;
            }
        });
    }

    static insertSeason = async () => {
        const recentSeason = await this.checkSeason();

        if (Date.now() > new Date(recentSeason.SEASON_END_DT).getTime()) {
            const id = `${parseInt(recentSeason.SEASON_NO) + 1}`;
            const beginDate = new Date(
                new Date(recentSeason.SEASON_BGN_DT).setMonth(new Date(recentSeason.SEASON_BGN_DT).getMonth() + 2)
            );
            const endDate = new Date(
                new Date(recentSeason.SEASON_END_DT).setMonth(new Date(recentSeason.SEASON_END_DT).getMonth() + 2)
            );
            const newDate = {
                beginDate: beginDate,
                endDate: endDate
            };

            if (beginDate.getMonth() % 2 === 0 && beginDate.getDate() + beginDate.getDay() < 12) {
                newDate.beginDate = beginDate.setDate(beginDate.getDate() + (8 % (beginDate.getDay() + 1) + 1));
            } else {
                newDate.beginDate = beginDate.setDate(beginDate.getDate() + (-5 - 8 % (beginDate.getDay() + 1) + 1));
            }

            if (endDate.getMonth() % 2 === 0 && endDate.getDate() + endDate.getDay() < 12) {
                newDate.endDate = endDate.setDate(endDate.getDate() + (8 % (endDate.getDay() + 1) + 1));
            } else {
                newDate.endDate = endDate.setDate(endDate.getDate() + (-5 - 8 % (endDate.getDay() + 1) + 1));
            }

            await Seasons.create({
                SEASON_NO: id,
                SEASON_BGN_DT: newDate.beginDate,
                SEASON_END_DT: newDate.endDate,
            });

            /*await MapRotation.destroy({
                ROTATION_TRP_BOOL: false
            }, {
                where: {
                    ROTATION_TRP_BOOL: true
                }
            })*/

            if (Date.now() > newDate.endDate) {
                await this.insertSeason();
            }
        }
    }

    /** 최근 시즌 불러오기 */
    static selectRecentSeason = async () => {
        return await Seasons.findOne({
            order: [['SEASON_BGN_DT', 'DESC']]
        });
    };

    /** 두 번째로 최근 시즌 불러오기 */
    static selectSecondRecentSeason = async () => {
        return await Seasons.findAll({
            limit: 2,
            order: [["SEASON_BGN_DT", "DESC"]],
        }).then(result => {
            return result[1];
        });
    };
}