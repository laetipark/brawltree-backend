import { Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '~/users/entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly users: Repository<Users>,
  ) {}

  async selectUsers(keyword: string) {
    return await this.users
      .createQueryBuilder('u')
      .select('u.id', 'userID')
      .addSelect('up.name', 'name')
      .addSelect('up.profileIcon', 'profile')
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

  async selectUser(@Param('id') id: string) {
    return await this.users
      .createQueryBuilder('u')
      .select('u.id', 'userID')
      .addSelect('u.lastBattledOn', 'lastBattledOn')
      .addSelect('u.crew', 'crew')
      .addSelect('u.crewName', 'crewName')
      .addSelect('u.updatedAt', 'updatedAt')
      .addSelect('up.name', 'name')
      .addSelect('up.profileIcon', 'profile')
      .innerJoin('u.userProfile', 'up')
      .where(`u.id = :id`, {
        id: `#${id}`,
      })
      .getRawOne();
  }
}
