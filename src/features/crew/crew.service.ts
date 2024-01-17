import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventsService } from '~/maps/services/events.service';
import { SeasonsService } from '~/seasons/seasons.service';
import { AppConfigService } from '~/utils/services/app-config.service';

import { UserFriends, UserRecords } from './entities/crew.entity';
import { BattleStats } from '~/brawlers/entities/battle-stats.entity';
import { Maps } from '~/maps/entities/maps.entity';
import { Users } from '~/users/entities/users.entity';
import { UserBattles } from '~/users/entities/user-battles.entity';
import { SelectUserRecordDto } from '~/crew/dto/select-user-record.dto';
import { plainToInstance } from 'class-transformer';
import { SelectUserFriendDto } from '~/crew/dto/select-user-friend.dto';

@Injectable()
export class CrewService {
  constructor(
    @InjectRepository(BattleStats)
    private readonly brawlerStats: Repository<BattleStats>,
    @InjectRepository(Users)
    private readonly users: Repository<Users>,
    @InjectRepository(UserBattles)
    private readonly userBattles: Repository<UserBattles>,
    @InjectRepository(UserRecords)
    private readonly userRecords: Repository<UserRecords>,
    @InjectRepository(UserFriends)
    private readonly userFriends: Repository<UserFriends>,
    private readonly eventsService: EventsService,
    private readonly seasonService: SeasonsService,
    private readonly configService: AppConfigService,
  ) {}

  async selectMembersSummary() {
    return await this.users
      .createQueryBuilder('user')
      .select('COUNT(uProfile.userID)', 'memberCount')
      .addSelect('SUM(uProfile.currentTrophies)', 'currentTotalTrophies')
      .innerJoin('user.userProfile', 'uProfile')
      .where('user.crew IN ("Blossom", "Team")')
      .getRawOne();
  }

  async selectBattlesSummary() {
    const beginDate = new Date(
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
      ).getTime(),
    );
    const endDate = new Date(
      new Date(beginDate).getTime() + 1000 * 60 * 60 * 24,
    );

    return await this.userBattles
      .createQueryBuilder('ub')
      .select('COUNT(DISTINCT ub.battleTime)', 'matchCount')
      .innerJoin('ub.user', 'user')
      .where('ub.battleTime BETWEEN :begin AND :end', {
        begin: beginDate,
        end: endDate,
      })
      .andWhere('ub.userID = ub.playerID')
      .andWhere('user.crew IN ("Blossom", "Team")')
      .getRawOne();
  }

  async selectSeasonSummary() {
    return await this.userRecords
      .createQueryBuilder('uRecord')
      .select('SUM(uRecord.matchCount)', 'matchCount')
      .getRawOne();
  }

  async selectBrawlerSummary() {
    return [
      await this.brawlerStats
        .createQueryBuilder('bs')
        .select('bs.brawlerID', 'brawlerID')
        .addSelect(
          'SUM(bs.matchCount) * 100 / SUM(SUM(bs.matchCount)) OVER()',
          'trophyLeaguePickRate',
        )
        .addSelect(
          'SUM(bs.victoriesCount) * 100 / (SUM(bs.victoriesCount) + SUM(bs.defeatsCount))',
          'trophyLeagueVictoryRate',
        )
        .where('bs.matchType = 0')
        .groupBy('bs.brawlerID')
        .orderBy('trophyLeaguePickRate', 'DESC')
        .addOrderBy('trophyLeagueVictoryRate', 'DESC')
        .limit(10)
        .getRawMany(),
      await this.brawlerStats
        .createQueryBuilder('bs')
        .select('bs.brawlerID', 'brawlerID')
        .addSelect(
          'SUM(bs.matchCount) * 100 / SUM(SUM(bs.matchCount)) OVER()',
          'powerLeaguePickRate',
        )
        .addSelect(
          'SUM(bs.victoriesCount) * 100 / (SUM(bs.victoriesCount) + SUM(bs.defeatsCount))',
          'powerLeagueVictoryRate',
        )
        .where('bs.matchType IN (2, 3)')
        .groupBy('bs.brawlerID')
        .orderBy('powerLeaguePickRate', 'DESC')
        .addOrderBy('powerLeagueVictoryRate', 'DESC')
        .limit(10)
        .getRawMany(),
    ];
  }

  async selectMemberTable() {
    return await this.users
      .createQueryBuilder('user')
      .select('user.id', 'userID')
      .addSelect('user.crewName', 'name')
      .addSelect('uProfile.profileIcon', 'profile')
      .addSelect('uProfile.currentTrophies', 'currentTrophies')
      .addSelect('uProfile.currentTrophies', 'currentTrophies')
      .addSelect('uProfile.currentSoloPL', 'currentSoloPL')
      .addSelect('uProfile.currentTeamPL', 'currentTeamPL')
      .innerJoin('user.userProfile', 'uProfile')
      .where('user.crew IN ("Blossom", "Team")')
      .orderBy('uProfile.currentTrophies', 'DESC')
      .getRawMany();
  }

  async findBrawlerTable(brawler: string) {
    return await this.users
      .createQueryBuilder('user')
      .select('user.id', 'userID')
      .addSelect('user.crewName', 'name')
      .addSelect('uProfile.profileIcon', 'profile')
      .addSelect('ubr.brawlerID', 'brawlerID')
      .addSelect('ubr.currentTrophies', 'currentTrophies')
      .addSelect('ubr.highestTrophies', 'highestTrophies')
      .innerJoin('user.userProfile', 'uProfile')
      .innerJoin('user.userBrawlers', 'ubr')
      .where('user.crew IN ("Blossom", "Team")')
      .andWhere('ubr.brawlerID = :brawler', {
        brawler: brawler,
      })
      .orderBy('ubr.currentTrophies', 'DESC')
      .getRawMany();
  }

  async selectBattlesTable(
    beginDate: Date,
    endDate: Date,
    type: string,
    mode: string,
  ) {
    return await this.users
      .createQueryBuilder('user')
      .select('user.id', 'userID')
      .addSelect('user.crewName', 'name')
      .addSelect('uProfile.profileIcon', 'profile')
      .addSelect('COUNT(DISTINCT ub.battleTime)', 'matchCount')
      .addSelect('SUM(ub.trophyChange)', 'trophyChange')
      .innerJoin('user.userProfile', 'uProfile')
      .innerJoin('user.userBattles', 'ub')
      .innerJoin(Maps, 'm', 'ub.mapID = m.id')
      .where('user.crew IN ("Blossom", "Team")')
      .andWhere('m.mode IN (:modes)', {
        modes: mode !== 'all' ? mode : await this.configService.getModeList(),
      })
      .andWhere('ub.userID = ub.playerID')
      .andWhere('ub.battleTime BETWEEN :begin AND :end', {
        begin: beginDate,
        end: endDate,
      })
      .andWhere('ub.matchType IN (:types)', {
        types: type !== '7' ? type : await this.configService.getTypeList(),
      })
      .groupBy('uProfile.userID')
      .orderBy('matchCount', 'DESC')
      .getRawMany();
  }

  async selectMemberSeasonRecords(id: string) {
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
          result[current.matchType] = result[current.matchType] || [];
          result[current.matchType].push(current);
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
      .addSelect('uFriend.friendName', 'friendName')
      .addSelect('SUM(uFriend.matchCount)', 'matchCount')
      .addSelect('SUM(uFriend.victoriesCount)', 'victoriesCount')
      .addSelect('SUM(uFriend.defeatsCount)', 'defeatsCount')
      .addSelect(
        'ROUND(uFriend.victoriesCount * 100 / SUM(uFriend.victoriesCount + uFriend.defeatsCount), 2)',
        'victoryRate',
      )
      .addSelect('ROUND(uFriend.friendPoints, 2)', 'friendPoints')
      .where('uFriend.userID = :id', {
        id: `#${id}`,
      })
      .groupBy('uFriend.friendID')
      .addGroupBy('uFriend.matchType')
      .addGroupBy('uFriend.matchGrade')
      .addGroupBy('uFriend.mode')
      .addGroupBy('uFriend.friendName')
      .getRawMany()
      .then((result: SelectUserFriendDto[]) => {
        const data = plainToInstance(SelectUserFriendDto, result);
        const totalData = [];
        data.forEach((item) => {
          const {
            friendID,
            friendName,
            matchCount,
            victoriesCount,
            defeatsCount,
            friendPoints,
          } = item;
          if (!totalData[friendID]) {
            totalData[friendID] = {
              friendID,
              friendName,
              matchCount: 0,
              victoriesCount: 0,
              defeatsCount: 0,
              friendPoints: 0,
            };
          }
          totalData[friendID].matchCount += matchCount;
          totalData[friendID].victoriesCount += victoriesCount;
          totalData[friendID].defeatsCount += defeatsCount;
          totalData[friendID].friendPoints += friendPoints;
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

  getDailyRotation() {
    return this.eventsService.selectRotationTLDaily();
  }

  getModes() {
    return {
      rotationTL: this.eventsService.selectModeTL(),
      rotationPL: this.eventsService.selectModePL(),
    };
  }

  getSeason() {
    return this.seasonService.getRecentSeason();
  }
}
