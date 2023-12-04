import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '~/users/entities/user-profile.entity';
import { UserBattles } from '~/users/entities/user-battles.entity';
import { Seasons } from '~/seasons/entities/seasons.entity';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private userProfile: Repository<UserProfile>,
    @InjectRepository(UserBattles)
    private userBattles: Repository<UserBattles>,
  ) {}

  async findUserProfile(id: string, season: Seasons) {
    const trophyChange = await this.userBattles
      .createQueryBuilder('ub')
      .select('SUM(ub.trophyChange)', 'trophyChange')
      .where('ub.userID = :id AND ub.playerID = :id', {
        id: `#${id}`,
      })
      .andWhere('ub.battleTime >= :season', {
        season: season.beginDate,
      })
      .getRawOne();

    return {
      ...(await this.userProfile.findOne({
        where: {
          userID: `#${id}`,
        },
      })),
      trophyChange: trophyChange.trophyChange,
    };
  }
}
