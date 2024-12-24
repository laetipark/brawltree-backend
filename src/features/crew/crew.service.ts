import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { UserFriends, UserRecords } from './entities/crew.entity';
import { BattleStats } from '~/brawlers/entities/battle-stats.entity';
import { Users } from '~/users/entities/users.entity';
import { UserProfile } from '~/users/entities/user-profile.entity';
import { SelectUserFriendDto } from '~/crew/dto/select-user-friend.dto';
import { SelectUserRecordDto } from '~/crew/dto/select-user-record.dto';

@Injectable()
export class CrewService {
  constructor(
    @InjectRepository(BattleStats)
    private readonly brawlerStats: Repository<BattleStats>,
    @InjectRepository(Users)
    private readonly users: Repository<Users>,
    @InjectRepository(UserFriends)
    private readonly userFriends: Repository<UserFriends>,
    @InjectRepository(UserRecords)
    private readonly userRecords: Repository<UserRecords>,
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
      .where('user.crew IN ("Blossom", "Team", "Lucy" )')
      .orderBy('uProfile.currentTrophies', 'DESC')
      .getRawMany();

    return members.reduce((result, current) => {
      result[current.crew] = result[current.crew] || [];
      result[current.crew].push(current);
      return result;
    }, {});
  }

  async selectMemberSeason(id: string) {
    return await this.userRecords
      .createQueryBuilder('uRecord')
      .select('uRecord.matchType', 'matchType')
      .addSelect('uRecord.matchGrade', 'matchGrade')
      .addSelect('uRecord.mode', 'mode')
      .addSelect('SUM(uRecord.matchCount)', 'matchCount')
      .addSelect('SUM(uRecord.victoriesCount)', 'victoriesCount')
      .addSelect('SUM(uRecord.defeatsCount)', 'defeatsCount')
      .addSelect(
        'ROUND(uRecord.victoriesCount * 100 / SUM(uRecord.victoriesCount + uRecord.defeatsCount), 2)',
        'victoryRate',
      )
      .where('uRecord.userID = :id', {
        id: `#${id}`,
      })
      .groupBy('uRecord.matchType')
      .addGroupBy('uRecord.matchGrade')
      .addGroupBy('uRecord.mode')
      .getRawMany()
      .then((result: SelectUserRecordDto[]) => {
        const data = plainToInstance(SelectUserRecordDto, result);
        const totalData = [];
        data.forEach((item: SelectUserRecordDto) => {
          const {
            matchType,
            matchCount,
            victoriesCount,
            defeatsCount,
          }: SelectUserRecordDto = item;
          if (!totalData[matchType]) {
            totalData[matchType] = {
              matchType,
              matchCount: 0,
              victoriesCount: 0,
              defeatsCount: 0,
            };
          }

          totalData[matchType].matchCount += matchCount;
          totalData[matchType].victoriesCount += victoriesCount;
          totalData[matchType].defeatsCount += defeatsCount;
        });

        const keyData = data.reduce((result, current) => {
          const matchType = current.matchType;
          const mode = current.mode;

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
              defeatsCount: 0,
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
            matchList: keyData[key],
          };
        });
      });
  }

  async selectMemberFriends(id: string) {
    return await this.userFriends
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
        'victoryRate',
      )
      .innerJoin(Users, 'user', 'uFriend.friendID = user.id')
      .innerJoin(UserProfile, 'uProfile', 'uFriend.friendID = uProfile.userID')
      .where('uFriend.userID = :id', {
        id: `#${id}`,
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
              // friendPoints: 0,
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
            matchList: keyData[key],
          };
        });
      });
  }
}
