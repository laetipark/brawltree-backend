import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { UserFriends } from './entities/crew.entity';
import { Users } from '~/users/entities/users.entity';
import { UserProfile } from '~/users/entities/user-profile.entity';
import { UserBrawlerBattles } from '~/users/entities/user-brawlers.entity';
import { SelectUserFriendDto } from '~/crew/dto/select-user-friend.dto';
import { SelectUserSeasonDto } from '~/crew/dto/select-user-season.dto';

@Injectable()
export class CrewService {
  constructor(
    @InjectRepository(Users)
    private readonly users: Repository<Users>,
    @InjectRepository(UserFriends)
    private readonly userFriends: Repository<UserFriends>,
    @InjectRepository(UserBrawlerBattles)
    private readonly uBrawlerBattles: Repository<UserBrawlerBattles>
  ) {}

  async selectMemberTable() {
    const members = await this.users
      .createQueryBuilder('user')
      .select('user.id', 'userID')
      .addSelect('uProfile.name', 'userName')
      .addSelect('user.crew', 'crew')
      .addSelect('user.crewName', 'crewName')
      .addSelect('uProfile.profileIcon', 'profileIcon')
      .addSelect('uProfile.currentTrophies', 'currentTrophies')
      .addSelect('uProfile.currentSoloRanked', 'currentSoloRanked')
      .addSelect('uProfile.highestSoloRanked', 'highestSoloRanked')
      .innerJoin('user.userProfile', 'uProfile')
      .where('user.crew IN ("Blossom", "Team", "Lucy")')
      .orderBy('uProfile.currentTrophies', 'DESC')
      .getRawMany();

    return members.reduce((result, current) => {
      result[current.crew] = result[current.crew] || [];
      result[current.crew].push(current);
      return result;
    }, {});
  }

  async selectMemberSeasons(id: string): Promise<SelectUserSeasonDto[]> {
    return await this.uBrawlerBattles
      .createQueryBuilder('uBrawlerBattles')
      .select('uBrawlerBattles.matchType', 'matchType')
      .addSelect('uBrawlerBattles.matchGrade', 'matchGrade')
      .addSelect('uBrawlerBattles.mode', 'modeName')
      .addSelect('SUM(uBrawlerBattles.matchCount)', 'matchCount')
      .addSelect('SUM(uBrawlerBattles.victoriesCount)', 'victoriesCount')
      .addSelect('SUM(uBrawlerBattles.defeatsCount)', 'defeatsCount')
      .addSelect(
        'ROUND(SUM(uBrawlerBattles.victoriesCount) * 100 / SUM(uBrawlerBattles.victoriesCount + uBrawlerBattles.defeatsCount), 2)',
        'victoryRate'
      )
      .where('uBrawlerBattles.userID = :id', {
        id: `#${id}`
      })
      .groupBy('uBrawlerBattles.matchType')
      .addGroupBy('uBrawlerBattles.matchGrade')
      .addGroupBy('uBrawlerBattles.mode')
      .getRawMany()
      .then((result: SelectUserSeasonDto[]) => {
        const data = plainToInstance(SelectUserSeasonDto, result);
        const totalData = [];
        data.forEach((item: SelectUserSeasonDto) => {
          const {
            matchType,
            matchCount,
            victoriesCount,
            defeatsCount
          }: SelectUserSeasonDto = item;
          if (!totalData[matchType]) {
            totalData[matchType] = {
              matchType,
              matchCount: 0,
              victoriesCount: 0,
              defeatsCount: 0
            };
          }

          totalData[matchType].matchCount += matchCount;
          totalData[matchType].victoriesCount += victoriesCount;
          totalData[matchType].defeatsCount += defeatsCount;
        });

        const keyData = data.reduce((result, current) => {
          const matchType = current.matchType;
          const mode = current.modeName;

          // matchType에 따라 그룹화
          if (!result[matchType]) {
            result[matchType] = {};
          }

          // mode에 따라 그룹화
          if (!result[matchType][mode]) {
            result[matchType][mode] = {
              mode,
              items: [],
              matchCount: 0,
              victoriesCount: 0,
              defeatsCount: 0
            };
          }
          result[matchType][mode].matchCount += current.matchCount;
          result[matchType][mode].victoriesCount += current.victoriesCount;
          result[matchType][mode].defeatsCount += current.defeatsCount;

          result[matchType][mode].items.push(current);

          return result;
        }, {});
        const keys = Object.keys(keyData);

        return keys.map((key) => {
          return {
            ...totalData[key],
            victoryRate:
              (totalData[key].victoriesCount * 100) /
              (totalData[key].victoriesCount + totalData[key].defeatsCount),
            matchList: keyData[key]
          };
        });
      });
  }

  async selectMemberFriends(id: string) {
    const friends = await this.userFriends
      .createQueryBuilder('uFriend')
      .select('uFriend.friendID', 'friendID')
      .addSelect('uFriend.matchType', 'matchType')
      .addSelect('uFriend.matchGrade', 'matchGrade')
      .addSelect('uFriend.mode', 'mode')
      .addSelect('user.crewName', 'friendName')
      .addSelect('uProfile.profileIcon', 'profileIcon')
      .addSelect('SUM(uFriend.matchCount)', 'matchCount')
      .addSelect('SUM(uFriend.victoriesCount)', 'victoriesCount')
      .addSelect('SUM(uFriend.defeatsCount)', 'defeatsCount')
      .addSelect(
        'ROUND(uFriend.victoriesCount * 100 / SUM(uFriend.victoriesCount + uFriend.defeatsCount), 2)',
        'victoryRate'
      )
      .addSelect('MIN(uFriend.createdAt)', 'createdAt')
      .innerJoin(Users, 'user', 'uFriend.friendID = user.id')
      .innerJoin(UserProfile, 'uProfile', 'uFriend.friendID = uProfile.userID')
      .where('uFriend.userID = :id', {
        id: `#${id}`
      })
      .groupBy('uFriend.friendID')
      .addGroupBy('uFriend.matchType')
      .addGroupBy('uFriend.matchGrade')
      .addGroupBy('uFriend.mode')
      .addGroupBy('user.crewName')
      .addGroupBy('uProfile.profileIcon')
      .getRawMany()
      .then((result: SelectUserFriendDto[]) => {
        const data = plainToInstance(SelectUserFriendDto, result);
        const totalData = [];
        data.forEach((item) => {
          const {
            friendID,
            profileIcon,
            friendName,
            matchCount,
            victoriesCount,
            defeatsCount,
            createdAt
            // friendPoints,
          } = item;
          if (!totalData[friendID]) {
            totalData[friendID] = {
              friendID,
              friendName,
              profileIcon,
              matchCount: 0,
              victoriesCount: 0,
              defeatsCount: 0,
              createdAt
            };
          }
          totalData[friendID].matchCount += matchCount;
          totalData[friendID].victoriesCount += victoriesCount;
          totalData[friendID].defeatsCount += defeatsCount;
          // totalData[friendID].friendPoints += friendPoints;
        });

        const keyData = data.reduce((result, current) => {
          result[current.friendID] = result[current.friendID] || [];
          result[current.friendID].push(current);
          return result;
        }, {});
        const keys = Object.keys(keyData);

        return keys.map((key) => {
          return {
            ...totalData[key],
            victoryRate:
              (totalData[key].victoriesCount * 100) /
              (totalData[key].victoriesCount + totalData[key].defeatsCount),
            matchList: keyData[key]
          };
        });
      });

    const { friendsUpdatedAt } = await this.userFriends
      .createQueryBuilder('uFriend')
      .select('MAX(uFriend.updatedAt)', 'friendsUpdatedAt')
      .where('uFriend.userID = :id', {
        id: `#${id}`
      })
      .groupBy('uFriend.userID')
      .getRawOne();

    return {
      friendList: { friends, friendsUpdatedAt }
    };
  }
}
