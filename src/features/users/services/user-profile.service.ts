import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '~/users/entities/user-profile.entity';
import { UserBattles } from '~/users/entities/user-battles.entity';
import { SeasonsService } from '~/seasons/seasons.service';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfile: Repository<UserProfile>,
    @InjectRepository(UserBattles)
    private readonly userBattles: Repository<UserBattles>,
    private readonly seasonsService: SeasonsService,
  ) {}

  async selectUserProfile(id: string) {
    const season = await this.seasonsService.findSeason();
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
