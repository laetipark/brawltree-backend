import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { Users } from '~/users/entities/users.entity';
import { SelectUserDto, SelectUsersDto } from '~/users/dto/select-users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly users: Repository<Users>,
    private readonly httpService: HttpService,
  ) {}

  /** 이름에 입력값이 포함된 사용자 조회 결과 반환
   * @param keyword 입력값 */
  async selectUsers(keyword: string): Promise<SelectUsersDto[]> {
    return await this.users
      .createQueryBuilder('u')
      .select('u.id', 'userID')
      .addSelect('up.name', 'userName')
      .addSelect('up.profileIcon', 'profileIcon')
      .addSelect('up.clubName', 'clubName')
      .addSelect('up.currentTrophies', 'currentTrophies')
      .addSelect('up.currentSoloPL', 'currentSoloPL')
      .addSelect('up.currentTeamPL', 'currentTeamPL')
      .innerJoin('u.userProfile', 'up')
      .where('up.name LIKE :keyword', {
        keyword: `%${keyword}%`,
      })
      .getRawMany();
  }

  /** 사용자 ID를 통한 사용자 상세 조회 결과 반환
   * @param id 사용자 ID */
  async selectUser(id: string): Promise<SelectUserDto> {
    return await this.users
      .createQueryBuilder('u')
      .select('u.id', 'userID')
      .addSelect('u.lastBattledOn', 'lastBattledOn')
      .addSelect('u.crew', 'crew')
      .addSelect('u.crewName', 'crewName')
      .addSelect('u.updatedAt', 'updatedAt')
      .addSelect('up.name', 'userName')
      .addSelect('up.profileIcon', 'profileIcon')
      .innerJoin('u.userProfile', 'up')
      .where(`u.id = :id`, {
        id: `#${id}`,
      })
      .getRawOne();
  }

  /** 사용자 ID를 통한 사용자 정보 변경 및 결과 반환
   * @param user 사용자 정보
   * @param id 사용자 ID */
  async updateUserFromCrawler(user: any, id: string) {
    const isResponse = {
      insert: false,
      update: false,
    };

    try {
      // 사용자 정보 추가
      if (!user) {
        const res = await firstValueFrom(
          this.httpService.post(`brawlian/${id}`),
        );
        if (res.status === 201) {
          isResponse.insert = true;
        }
      }

      // 사용자 정보 갱신
      if (
        isResponse.insert ||
        (user &&
          (new Date(new Date(user.updatedAt).getTime() + 2 * 60 * 1000) <
            new Date() ||
            new Date(user.lastBattledOn).getTime() < 1001))
      ) {
        const res = await firstValueFrom(
          this.httpService.patch(`brawlian/${id}`),
        );
        if (res.status === 200) {
          isResponse.update = true;
        }
      }
    } catch (error) {
      Logger.error(error, 'selectUser');
    }

    return isResponse;
  }
}
