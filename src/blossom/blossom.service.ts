import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maps } from '~/maps/entities/maps.entity';
import { BrawlerStats } from '~/brawlers/entities/brawler-stats.entity';
import { UserBattles, Users } from '~/users/entities/users.entity';
import { UserFriends, UserRecords } from './entities/blossom.entity';

import { AppConfigService } from '~/configs/app-config.service';

@Injectable()
export class BlossomService {
  constructor(
    @InjectRepository(BrawlerStats)
    private brawlerStats: Repository<BrawlerStats>,
    @InjectRepository(Users)
    private users: Repository<Users>,
    @InjectRepository(UserBattles)
    private userBattles: Repository<UserBattles>,
    @InjectRepository(UserRecords)
    private userRecords: Repository<UserRecords>,
    @InjectRepository(UserFriends)
    private userFriends: Repository<UserFriends>,
    private configService: AppConfigService,
  ) {}

  async findMembersSummary() {
    return await this.users
      .createQueryBuilder('u')
      .select('COUNT(up.userID)', 'MEMBER_CNT')
      .addSelect('SUM(up.currentTrophies)', 'currentTrophies_TOT')
      .innerJoin('u.userProfile', 'up')
      .where('u.crew IN ("Blossom", "Team")')
      .getRawOne();
  }

  async findBattlesSummary() {
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
      .select('COUNT(DISTINCT ub.matchDate)', 'matchCount')
      .innerJoin('ub.user', 'u')
      .where('ub.matchDate BETWEEN :begin AND :end', {
        begin: beginDate,
        end: endDate,
      })
      .andWhere('ub.userID = ub.playerID')
      .andWhere('u.crew IN ("Blossom", "Team")')
      .getRawOne();
  }

  async findSeasonSummary() {
    return await this.userRecords
      .createQueryBuilder('ur')
      .select('SUM(ur.matchCount)', 'matchCount')
      .getRawOne();
  }

  async findBrawlerSummary() {
    return [
      await this.brawlerStats
        .createQueryBuilder('bs')
        .select('bs.brawlerID', 'brawlerID')
        .addSelect(
          'SUM(bs.matchCount) * 100 / SUM(SUM(bs.matchCount)) OVER()',
          'trophyLeaguePickRate',
        )
        .addSelect(
          'SUM(bs.victoryCount) * 100 / (SUM(bs.victoryCount) + SUM(bs.defeatCount))',
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
          'SUM(bs.victoryCount) * 100 / (SUM(bs.victoryCount) + SUM(bs.defeatCount))',
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

  async findMemberTable() {
    return await this.users
      .createQueryBuilder('u')
      .select('u.userID', 'userID')
      .addSelect('u.crewName', 'name')
      .addSelect('up.profile', 'profile')
      .addSelect('up.currentTrophies', 'currentTrophies')
      .addSelect('up.currentTrophies', 'currentTrophies')
      .addSelect('up.currentSoloPL', 'currentSoloPL')
      .addSelect('up.currentTeamPL', 'currentTeamPL')
      .innerJoin('u.userProfile', 'up')
      .where('u.crew IN ("Blossom", "Team")')
      .orderBy('up.currentTrophies', 'DESC')
      .getRawMany();
  }

  async findBrawlerTable(brawler: string) {
    return await this.users
      .createQueryBuilder('u')
      .select('u.userID', 'userID')
      .addSelect('u.crewName', 'name')
      .addSelect('up.profile', 'profile')
      .addSelect('ubr.brawlerID', 'brawlerID')
      .addSelect('ubr.currentTrophies', 'currentTrophies')
      .addSelect('ubr.highestTrophies', 'highestTrophies')
      .innerJoin('u.userProfile', 'up')
      .innerJoin('u.userBrawlers', 'ubr')
      .where('u.crew IN ("Blossom", "Team")')
      .andWhere('ubr.brawlerID = :brawler', {
        brawler: brawler,
      })
      .orderBy('ubr.currentTrophies', 'DESC')
      .getRawMany();
  }

  async findBattlesTable(
    beginDate: Date,
    endDate: Date,
    type: string,
    mode: string,
  ) {
    return await this.users
      .createQueryBuilder('u')
      .select('u.userID', 'userID')
      .addSelect('u.crewName', 'name')
      .addSelect('up.profile', 'profile')
      .addSelect('COUNT(DISTINCT ub.matchDate)', 'matchCount')
      .addSelect('SUM(ub.matchChange)', 'matchChange')
      .innerJoin('u.userProfile', 'up')
      .innerJoin('u.userBattles', 'ub')
      .innerJoin(Maps, 'm', 'ub.mapID = m.mapID')
      .where('u.crew IN ("Blossom", "Team")')
      .andWhere('m.mode IN (:modes)', {
        modes: mode !== 'all' ? mode : await this.configService.getModeList(),
      })
      .andWhere('ub.userID = ub.playerID')
      .andWhere('ub.matchDate BETWEEN :begin AND :end', {
        begin: beginDate,
        end: endDate,
      })
      .andWhere('ub.matchType IN (:types)', {
        types: type !== '7' ? type : await this.configService.getTypeList(),
      })
      .groupBy('up.userID')
      .orderBy('matchCount', 'DESC')
      .getRawMany();
  }

  async findSeasonTable(type: string, mode: string) {
    return await this.users
      .createQueryBuilder('u')
      .select('u.userID', 'userID')
      .addSelect('u.crewName', 'name')
      .addSelect('up.profile', 'profile')
      .addSelect('SUM(ur.matchCount)', 'matchCount')
      .addSelect('SUM(ur.matchChange)', 'matchChange')
      .addSelect('SUM(uf.friendPoints)', 'friendPoints')
      .innerJoin('u.userProfile', 'up')
      .leftJoin('u.userRecords', 'ur')
      .leftJoin('u.userFriends', 'uf')
      .where('u.crew IN ("Blossom", "Team")')
      .where('ur.mode IN (:modes)', {
        modes: mode !== 'all' ? [mode] : await this.configService.getModeList(),
      })
      .andWhere('ur.matchType IN (:types)', {
        types: type !== '7' ? [type] : await this.configService.getTypeList(),
      })
      .groupBy('up.userID')
      .orderBy('matchCount', 'DESC')
      .getRawMany();
  }

  async findMemberSeasonRecords(id: string) {
    return await this.userRecords
      .createQueryBuilder('ur')
      .select('ur.matchType', 'matchType')
      .addSelect('ur.matchGrade', 'matchGrade')
      .addSelect('ur.mode', 'mode')
      .addSelect('SUM(ur.matchCount)', 'matchCount')
      .addSelect('SUM(ur.victoryCount)', 'victoryCount')
      .addSelect('SUM(ur.defeatCount)', 'defeatCount')
      .addSelect(
        'ROUND(ur.victoryCount * 100 / SUM(ur.victoryCount + ur.defeatCount), 2)',
        'victoryRate',
      )
      .where('ur.userID = :id', {
        id: `#${id}`,
      })
      .groupBy('ur.matchType')
      .addGroupBy('ur.matchGrade')
      .addGroupBy('ur.mode')
      .getRawMany()
      .then((data: any[]) => {
        const totalData = [];
        data.forEach((item) => {
          const { matchType, matchCount, victoryCount, defeatCount } = item;
          if (!totalData[matchType]) {
            totalData[matchType] = {
              matchType,
              matchCount: 0,
              victoryCount: 0,
              defeatCount: 0,
            };
          }
          totalData[matchType].matchCount += matchCount;
          totalData[matchType].victoryCount += victoryCount;
          totalData[matchType].defeatCount += defeatCount;
        });

        const keyData = data.reduce(function (result, current) {
          result[current.matchType] = result[current.matchType] || [];
          result[current.matchType].push(current);
          return result;
        }, {});
        const keys = Object.keys(keyData);

        return keys.map((key) => {
          return {
            ...totalData[key],
            victoryRate:
              (totalData[key].victoryCount * 100) /
              (totalData[key].victoryCount + totalData[key].defeatCount),
            matchList: keyData[key],
          };
        });
      });
  }

  async findMemberFriends(id: string) {
    return await this.userFriends
      .createQueryBuilder('uf')
      .select('uf.friendID', 'friendID')
      .addSelect('uf.matchType', 'matchType')
      .addSelect('uf.matchGrade', 'matchGrade')
      .addSelect('uf.mode', 'mode')
      .addSelect('uf.name', 'name')
      .addSelect('SUM(uf.matchCount)', 'matchCount')
      .addSelect('SUM(uf.victoryCount)', 'victoryCount')
      .addSelect('SUM(uf.defeatCount)', 'defeatCount')
      .addSelect(
        'ROUND(uf.victoryCount * 100 / SUM(uf.victoryCount + uf.defeatCount), 2)',
        'victoryRate',
      )
      .addSelect('ROUND(uf.friendPoints, 2)', 'friendPoints')
      .where('uf.userID = :id', {
        id: `#${id}`,
      })
      .groupBy('uf.friendID')
      .addGroupBy('uf.matchType')
      .addGroupBy('uf.matchGrade')
      .addGroupBy('uf.mode')
      .addGroupBy('uf.name')
      .getRawMany()
      .then((data: any[]) => {
        const totalData = [];
        data.forEach((item) => {
          const {
            friendID,
            name,
            matchCount,
            victoryCount,
            defeatCount,
            friendPoints,
          } = item;
          if (!totalData[friendID]) {
            totalData[friendID] = {
              friendID,
              name,
              matchCount: 0,
              victoryCount: 0,
              defeatCount: 0,
              friendPoints: 0,
            };
          }
          totalData[friendID].matchCount += matchCount;
          totalData[friendID].victoryCount += victoryCount;
          totalData[friendID].defeatCount += defeatCount;
          totalData[friendID].friendPoints += friendPoints;
        });

        const keyData = data.reduce(function (result, current) {
          result[current.friendID] = result[current.friendID] || [];
          result[current.friendID].push(current);
          return result;
        }, {});
        const keys = Object.keys(keyData);

        return keys.map((key) => {
          return {
            ...totalData[key],
            victoryRate:
              (totalData[key].victoryCount * 100) /
              (totalData[key].victoryCount + totalData[key].defeatCount),
            matchList: keyData[key],
          };
        });
      });
  }
}
