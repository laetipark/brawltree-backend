import { Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '~/users/entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private users: Repository<Users>,
  ) {}

  async findUsers(keyword: string) {
    return await this.users
      .createQueryBuilder('u')
      .select('u.userID', 'userID')
      .addSelect('up.name', 'name')
      .addSelect('up.profile', 'profile')
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

  async findUser(@Param('id') id: string) {
    return await this.users
      .createQueryBuilder('u')
      .select('u.userID', 'userID')
      .addSelect('u.lastBattleAt', 'lastBattleAt')
      .addSelect('u.crew', 'crew')
      .addSelect('u.crewName', 'crewName')
      .addSelect('u.updatedAt', 'updatedAt')
      .addSelect('up.name', 'name')
      .addSelect('up.profile', 'profile')
      .innerJoin('u.userProfile', 'up')
      .where(`u.userID = :id`, {
        id: `#${id}`,
      })
      .getRawOne();
  }
}
