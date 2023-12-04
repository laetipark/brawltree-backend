import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seasons } from './entities/seasons.entity';

@Injectable()
export class SeasonsService {
  constructor(
    @InjectRepository(Seasons)
    private seasons: Repository<Seasons>,
  ) {}

  async findSeason(): Promise<Seasons> {
    return await this.seasons
      .find({
        take: 1,
        order: {
          id: 'DESC',
        },
      })
      .then((result) => result[0]);
  }
}
