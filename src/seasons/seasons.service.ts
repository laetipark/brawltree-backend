import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seasons } from './seasons.entity';

import { CreateSeasonsDto } from './create-season.dto';

@Injectable()
export class SeasonsService {
  constructor(
    @InjectRepository(Seasons)
    private seasonsRepository: Repository<Seasons>,
  ) {}

  async checkSeason(): Promise<Seasons> {
    return this.seasonsRepository
      .findOne({
        order: {
          SEASON_BGN_DT: 'DESC',
        },
      })
      .then(async (result) => {
        if (result === null) {
          const seasonData: CreateSeasonsDto = {
            SEASON_NO: 10,
            SEASON_BGN_DT: new Date('2022-01-03T18:00:00'),
            SEASON_END_DT: new Date('2022-03-07T17:50:00'),
          };

          const season = this.seasonsRepository.create(seasonData);
          return await this.seasonsRepository.save(season);
        } else {
          return result;
        }
      });
  }

  async updateSeason() {
    const recentSeason = await this.checkSeason();

    if (Date.now() > new Date(recentSeason.SEASON_END_DT).getTime()) {
      const id = recentSeason.SEASON_NO + 1;
      const beginDate = new Date(
        new Date(recentSeason.SEASON_BGN_DT).setMonth(
          new Date(recentSeason.SEASON_BGN_DT).getMonth() + 2,
        ),
      );
      const endDate = new Date(
        new Date(recentSeason.SEASON_END_DT).setMonth(
          new Date(recentSeason.SEASON_END_DT).getMonth() + 2,
        ),
      );
      const newDate = {
        beginDate: beginDate,
        endDate: endDate,
      };

      if (
        beginDate.getMonth() % 2 === 0 &&
        beginDate.getDate() + beginDate.getDay() < 12
      ) {
        newDate.beginDate = new Date(
          beginDate.setDate(
            beginDate.getDate() + ((8 % (beginDate.getDay() + 1)) + 1),
          ),
        );
      } else {
        newDate.beginDate = new Date(
          beginDate.setDate(
            beginDate.getDate() + (-5 - (8 % (beginDate.getDay() + 1)) + 1),
          ),
        );
      }

      if (
        endDate.getMonth() % 2 === 0 &&
        endDate.getDate() + endDate.getDay() < 12
      ) {
        newDate.endDate = new Date(
          endDate.setDate(
            endDate.getDate() + ((8 % (endDate.getDay() + 1)) + 1),
          ),
        );
      } else {
        newDate.endDate = new Date(
          endDate.setDate(
            endDate.getDate() + (-5 - (8 % (endDate.getDay() + 1)) + 1),
          ),
        );
      }

      const seasonData: CreateSeasonsDto = {
        SEASON_NO: id,
        SEASON_BGN_DT: newDate.beginDate,
        SEASON_END_DT: newDate.endDate,
      };

      const season = this.seasonsRepository.create(seasonData);
      await this.seasonsRepository.save(season);

      if (Date.now() > newDate.endDate.getTime()) {
        await this.updateSeason();
      }
    }
  }

  async findSeason(): Promise<Seasons> {
    return await this.seasonsRepository
      .find({
        take: 1,
        order: {
          SEASON_NO: 'DESC',
        },
      })
      .then((result) => result[0]);
  }
}
