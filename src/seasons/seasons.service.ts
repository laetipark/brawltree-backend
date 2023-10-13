import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seasons } from './entities/seasons.entity';

import { CreateSeasonsDto } from './dto/create-season.dto';

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
          beginDate: 'DESC',
        },
      })
      .then(async (result) => {
        if (result === null) {
          const seasonData: CreateSeasonsDto = {
            seasonNumber: 10,
            beginDate: new Date('2022-01-03T18:00:00'),
            endDate: new Date('2022-03-07T17:50:00'),
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

    if (Date.now() > new Date(recentSeason.endDate).getTime()) {
      const id = recentSeason.seasonNumber + 1;
      const beginDate = new Date(
        new Date(recentSeason.beginDate).setMonth(
          new Date(recentSeason.beginDate).getMonth() + 2,
        ),
      );
      const endDate = new Date(
        new Date(recentSeason.endDate).setMonth(
          new Date(recentSeason.endDate).getMonth() + 2,
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
        seasonNumber: id,
        beginDate: newDate.beginDate,
        endDate: newDate.endDate,
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
          seasonNumber: 'DESC',
        },
      })
      .then((result) => result[0]);
  }
}
