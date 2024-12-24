import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeasonsService } from '~/seasons/seasons.service';
import { UserProfile } from '~/users/entities/user-profile.entity';
import { UserBattles } from '~/users/entities/user-battles.entity';
import { SelectUserProfileDto } from '~/users/dto/select-user-profile.dto';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfile: Repository<UserProfile>,
    @InjectRepository(UserBattles)
    private readonly userBattles: Repository<UserBattles>,
    private readonly seasonsService: SeasonsService,
  ) {}

  /** 사용자 프로필 정보 반환
   * @param id 사용자 ID */
  async selectUserProfile(id: string): Promise<SelectUserProfileDto> {
    const season = this.seasonsService.getRecentSeason();
    const trophyChange = await this.userBattles
      .createQueryBuilder('uBattle')
      .select('SUM(uBattle.trophyChange)', 'trophyChange')
      .where('uBattle.userID = :id AND uBattle.playerID = :id', {
        id: `#${id}`,
      })
      .andWhere('uBattle.battleTime >= :season', {
        season: season.beginDate,
      })
      .limit(1)
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
