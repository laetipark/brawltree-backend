import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserBattles, Users } from '../users/entities/users.entity';
import { Repository } from 'typeorm';
import { UserFriends, UserRecords } from './blossom.entity';
import { BrawlerStats } from '../brawlers/entities/stats.entity';
import { GameConfigService } from '../config/gameConfig.service';
import {Maps} from "../maps/entities/maps.entity";

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
    private configService: GameConfigService,
  ) {}

  async findMemberSummary() {
    return await this.users
      .createQueryBuilder('u')
      .select('COUNT(up.USER_ID)', 'MEMBER_CNT')
      .addSelect('SUM(up.TROPHY_CUR)', 'TROPHY_CUR_TOT')
      .innerJoin('u.userProfile', 'up')
      .where('u.USER_CR IN ("Blossom", "Team")')
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
      .select('COUNT(DISTINCT ub.MATCH_DT)', 'MATCH_CNT_TOT')
      .innerJoin('ub.user', 'u')
      .where('ub.MATCH_DT BETWEEN :begin AND :end', {
        begin: beginDate,
        end: endDate,
      })
      .andWhere('ub.USER_ID = ub.PLAYER_ID')
      .andWhere('u.USER_CR IN ("Blossom", "Team")')
      .getRawOne();
  }

  async findSeasonSummary() {
    return await this.userRecords
      .createQueryBuilder('ur')
      .select('SUM(ur.MATCH_CNT)', 'MATCH_CNT')
      .getRawOne();
  }

  async findBrawlerSummary() {
    return [
      await this.brawlerStats
        .createQueryBuilder('bs')
        .select('bs.BRAWLER_ID', 'BRAWLER_ID')
        .addSelect(
          'SUM(bs.MATCH_CNT) * 100 / SUM(SUM(bs.MATCH_CNT)) OVER()',
          'MATCH_CNT_TL_RATE',
        )
        .addSelect(
          'SUM(bs.MATCH_CNT_VIC) * 100 / (SUM(bs.MATCH_CNT_VIC) + SUM(bs.MATCH_CNT_DEF))',
          'MATCH_CNT_VIC_TL_RATE',
        )
        .where('bs.MATCH_TYP = 0')
        .groupBy('bs.BRAWLER_ID')
        .orderBy('MATCH_CNT_TL_RATE', 'DESC')
        .addOrderBy('MATCH_CNT_VIC_TL_RATE', 'DESC')
        .take(10)
        .getRawMany(),
      await this.brawlerStats
        .createQueryBuilder('bs')
        .select('bs.BRAWLER_ID', 'BRAWLER_ID')
        .addSelect(
          'SUM(bs.MATCH_CNT) * 100 / SUM(SUM(bs.MATCH_CNT)) OVER()',
          'MATCH_CNT_PL_RATE',
        )
        .addSelect(
          'SUM(bs.MATCH_CNT_VIC) * 100 / (SUM(bs.MATCH_CNT_VIC) + SUM(bs.MATCH_CNT_DEF))',
          'MATCH_CNT_VIC_PL_RATE',
        )
        .where('bs.MATCH_TYP IN (2, 3)')
        .groupBy('bs.BRAWLER_ID')
        .orderBy('MATCH_CNT_PL_RATE', 'DESC')
        .addOrderBy('MATCH_CNT_VIC_PL_RATE', 'DESC')
        .take(10)
        .getRawMany(),
    ];
  }

  async findMemberTable() {
    return await this.users
      .createQueryBuilder('u')
      .select('up.USER_ID', 'USER_ID')
      .addSelect('up.USER_NM', 'USER_NM')
      .addSelect('up.USER_PRFL', 'USER_PRFL')
      .addSelect('up.TROPHY_CUR', 'TROPHY_CUR')
      .addSelect('up.TROPHY_CUR', 'TROPHY_CUR')
      .addSelect('up.PL_SL_CUR', 'PL_SL_CUR')
      .addSelect('up.PL_TM_CUR', 'PL_TM_CUR')
      .innerJoin('u.userProfile', 'up')
      .where('u.USER_CR IN ("Blossom", "Team")')
      .orderBy('up.TROPHY_CUR', 'DESC')
      .getRawMany();
  }

  async findBrawlerTable(brawler: string) {
    return await this.users
      .createQueryBuilder('u')
      .select('up.USER_ID', 'USER_ID')
      .addSelect('up.USER_NM', 'USER_NM')
      .addSelect('up.USER_PRFL', 'USER_PRFL')
      .addSelect('ubr.BRAWLER_ID', 'BRAWLER_ID')
      .addSelect('ubr.TROPHY_CUR', 'TROPHY_CUR')
      .addSelect('ubr.TROPHY_HGH', 'TROPHY_HGH')
      .innerJoin('u.userProfile', 'up')
      .innerJoin('u.userBrawlers', 'ubr')
      .where('u.USER_CR IN ("Blossom", "Team")')
      .andWhere('ubr.BRAWLER_ID = :brawler', {
        brawler: brawler,
      })
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
      .select('up.USER_ID', 'USER_ID')
      .addSelect('up.USER_NM', 'USER_NM')
      .addSelect('up.USER_PRFL', 'USER_PRFL')
      .addSelect('COUNT(DISTINCT ub.MATCH_DT)', 'MATCH_CNT')
      .addSelect('SUM(DISTINCT ub.MATCH_CHG)', 'MATCH_CHG')
      .innerJoin('u.userProfile', 'up')
      .innerJoin('u.userBattles', 'ub')
      .innerJoin(Maps, 'm', 'ub.MAP_ID = m.MAP_ID')
      .where('u.USER_CR IN ("Blossom", "Team")')
      .andWhere('m.MAP_MD IN (:modes)', {
        modes: mode !== 'all' ? mode : await this.configService.getModeList(),
      })
      .andWhere('ub.USER_ID = ub.PLAYER_ID')
      .andWhere('ub.MATCH_DT BETWEEN :begin AND :end', {
        begin: beginDate,
        end: endDate,
      })
      .andWhere('ub.MATCH_TYP IN (:types)', {
        types: type !== '7' ? type : await this.configService.getTypeList(),
      })
      .groupBy('up.USER_ID')
      .orderBy('MATCH_CNT', 'DESC')
      .getRawMany();
  }

  async findSeasonTable(type: string, mode: string) {
    return await this.users
      .createQueryBuilder('u')
      .select('up.USER_ID', 'USER_ID')
      .addSelect('up.USER_NM', 'USER_NM')
      .addSelect('up.USER_PRFL', 'USER_PRFL')
      .addSelect('SUM(ur.MATCH_CNT)', 'MATCH_CNT')
      .addSelect('SUM(ur.MATCH_CHG)', 'MATCH_CHG')
      .addSelect('SUM(uf.MATCH_CNT)', 'MATCH_CNT')
      .innerJoin('u.userProfile', 'up')
      .leftJoin('u.userRecords', 'ur')
      .leftJoin('u.userFriends', 'uf')
      .where('u.USER_CR IN ("Blossom", "Team")')
      .where('ur.MAP_MD IN (:modes)', {
        modes: mode !== 'all' ? [mode] : await this.configService.getModeList(),
      })
      .andWhere('ur.MATCH_TYP IN (:types)', {
        types: type !== '7' ? [type] : await this.configService.getTypeList(),
      })
      .groupBy('up.USER_ID')
      .orderBy('MATCH_CNT', 'DESC')
      .getRawMany();
  }

  async findMemberBattles(id: string, beginDate: Date, endDate: Date) {
    return await this.userBattles
      .createQueryBuilder('ub')
      .select('ub.BRAWLER_ID', 'BRAWLER_ID')
      .addSelect('ub.MATCH_DT', 'MATCH_DT')
      .addSelect('ub.MATCH_TYP', 'MATCH_TYP')
      .addSelect('ub.MATCH_RNK', 'MATCH_RNK')
      .addSelect('ub.MATCH_DT', 'MATCH_DT')
      .addSelect('m.MAP_MD', 'MAP_MD')
      .innerJoin(Maps, 'm', 'ub.MAP_ID = m.MAP_ID')
      .where('ub.USER_ID = :id AND PLAYER_ID = :id', {
        id: `#${id}`,
      })
      .andWhere('ub.MATCH_DT BETWEEN :begin AND :end', {
        begin: beginDate,
        end: endDate,
      })
      .orderBy('MATCH_DT', 'DESC')
      .getRawMany()
      .then((result) => {
        return result.reduce((acc, current) => {
          if (
            acc.findIndex(
              ({ MATCH_DT }) =>
                JSON.stringify(MATCH_DT) === JSON.stringify(current.MATCH_DT),
            ) === -1
          ) {
            acc.push(current);
          }
          return acc;
        }, []);
      });
  }

  async findMemberSeasonRecords(id: string) {
    return await this.userRecords
      .createQueryBuilder('ur')
      .select('ur.MATCH_TYP', 'MATCH_TYP')
      .addSelect('ur.MATCH_GRD', 'MATCH_GRD')
      .addSelect('ur.MAP_MD', 'MAP_MD')
      .addSelect('ur.MATCH_CNT', 'MATCH_CNT')
      .addSelect('ur.MATCH_CNT_VIC', 'MATCH_CNT_VIC')
      .addSelect('ur.MATCH_CNT_DEF', 'MATCH_CNT_DEF')
      .addSelect(
        'ROUND(ur.MATCH_CNT_VIC * 100 / SUM(ur.MATCH_CNT_VIC + ur.MATCH_CNT_DEF), 2)',
        'MATCH_VIC_R',
      )
      .where('ur.USER_ID = :id', {
        id: `#${id}`,
      })
      .groupBy('ur.MATCH_TYP')
      .addGroupBy('ur.MATCH_GRD')
      .addGroupBy('ur.MAP_MD')
      .getRawMany()
      .then((data: any[]) => {
        const totalData = [];
        data.forEach((item) => {
          const { MATCH_TYP, MATCH_CNT, MATCH_CNT_VIC, MATCH_CNT_DEF } = item;
          if (!totalData[MATCH_TYP]) {
            totalData[MATCH_TYP] = {
              MATCH_TYP,
              MATCH_CNT: 0,
              MATCH_CNT_VIC: 0,
              MATCH_CNT_DEF: 0,
            };
          }
          totalData[MATCH_TYP].MATCH_CNT += MATCH_CNT;
          totalData[MATCH_TYP].MATCH_CNT_VIC += MATCH_CNT_VIC;
          totalData[MATCH_TYP].MATCH_CNT_DEF += MATCH_CNT_DEF;
        });

        const keyData = data.reduce(function (result, current) {
          result[current.MATCH_TYP] = result[current.MATCH_TYP] || [];
          result[current.MATCH_TYP].push(current);
          return result;
        }, {});
        const keys = Object.keys(keyData);

        return keys.map((key) => {
          return {
            ...totalData[key],
            MATCH_VIC_R:
              (totalData[key].MATCH_CNT_VIC * 100) /
              (totalData[key].MATCH_CNT_VIC + totalData[key].MATCH_CNT_DEF),
            MATCH_L: keyData[key],
          };
        });
      });
  }

  async findMemberFriends(id: string) {
    return await this.userFriends
      .createQueryBuilder('uf')
      .select('uf.FRIEND_ID', 'FRIEND_ID')
      .addSelect('uf.MATCH_TYP', 'MATCH_TYP')
      .addSelect('uf.MATCH_GRD', 'MATCH_GRD')
      .addSelect('uf.MAP_MD', 'MAP_MD')
      .addSelect('uf.FRIEND_NM', 'FRIEND_NM')
      .addSelect('uf.MATCH_CNT', 'MATCH_CNT')
      .addSelect('uf.MATCH_CNT_VIC', 'MATCH_CNT_VIC')
      .addSelect('uf.MATCH_CNT_DEF', 'MATCH_CNT_DEF')
      .addSelect(
        'ROUND(uf.MATCH_CNT_VIC * 100 / SUM(uf.MATCH_CNT_VIC + uf.MATCH_CNT_DEF), 2)',
        'MATCH_VIC_R',
      )
      .addSelect('ROUND(uf.FRIEND_PT, 2)', 'FRIEND_PT')
      .where('uf.USER_ID = :id', {
        id: `#${id}`,
      })
      .groupBy('uf.FRIEND_ID')
      .addGroupBy('uf.MATCH_TYP')
      .addGroupBy('uf.MATCH_GRD')
      .addGroupBy('uf.MAP_MD')
      .addGroupBy('uf.FRIEND_NM')
      .getRawMany()
      .then((data: any[]) => {
        const totalData = [];
        data.forEach((item) => {
          const {
            FRIEND_ID,
            FRIEND_NM,
            MATCH_CNT,
            MATCH_CNT_VIC,
            MATCH_CNT_DEF,
            FRIEND_PT,
          } = item;
          if (!totalData[FRIEND_ID]) {
            totalData[FRIEND_ID] = {
              FRIEND_ID,
              FRIEND_NM,
              MATCH_CNT: 0,
              MATCH_CNT_VIC: 0,
              MATCH_CNT_DEF: 0,
              FRIEND_PT: 0,
            };
          }
          totalData[FRIEND_ID].MATCH_CNT += MATCH_CNT;
          totalData[FRIEND_ID].MATCH_CNT_VIC += MATCH_CNT_VIC;
          totalData[FRIEND_ID].MATCH_CNT_DEF += MATCH_CNT_DEF;
          totalData[FRIEND_ID].FRIEND_PT += FRIEND_PT;
        });

        const keyData = data.reduce(function (result, current) {
          result[current.FRIEND_ID] = result[current.FRIEND_ID] || [];
          result[current.FRIEND_ID].push(current);
          return result;
        }, {});
        const keys = Object.keys(keyData);

        return keys.map((key) => {
          return {
            ...totalData[key],
            MATCH_VIC_R:
              (totalData[key].MATCH_CNT_VIC * 100) /
              (totalData[key].MATCH_CNT_VIC + totalData[key].MATCH_CNT_DEF),
            MATCH_L: keyData[key],
          };
        });
      });
  }

  async findMemberBattleLogs(id: string, beginDate: Date, endDate: Date) {
    return await this.userBattles
      .createQueryBuilder('ub')
      .select('ub.USER_ID', 'USER_ID')
      .addSelect(
        'JSON_OBJECT(' +
          '"MATCH_DT", ub.MATCH_DT,' +
          '"MATCH_DUR", ub.MATCH_DUR,' +
          '"MAP_ID", ub.MAP_ID,' +
          '"MATCH_TYP_RAW", ub.MATCH_TYP_RAW,' +
          '"MATCH_TYP", ub.MATCH_TYP,' +
          '"MAP_MD_CD", ub.MAP_MD_CD,' +
          '"MATCH_GRD", ub.MATCH_GRD,' +
          '"MATCH_CHG", ub.MATCH_CHG,' +
          '"MAP_MD", m.MAP_MD,' +
          '"MAP_NM", m.MAP_NM)',
        'BATTLE_INFO',
      )
      .addSelect(
        'JSON_ARRAYAGG(' +
          'JSON_OBJECT(' +
          '"PLAYER_ID", ub.PLAYER_ID,' +
          '"PLAYER_NM", ub.PLAYER_NM,' +
          '"PLAYER_TM_NO", ub.PLAYER_TM_NO,' +
          '"BRAWLER_ID", ub.BRAWLER_ID,' +
          '"BRAWLER_PWR", ub.BRAWLER_PWR,' +
          '"BRAWLER_TRP", ub.BRAWLER_TRP,' +
          '"MATCH_RNK", ub.MATCH_RNK,' +
          '"MATCH_RES", ub.MATCH_RES,' +
          '"MATCH_CHG", ub.MATCH_CHG))',
        'BATTLE_PLAYERS',
      )
      .innerJoin(Maps, 'm', 'ub.MAP_ID = m.MAP_ID')
      .where('ub.USER_ID = :id', {
        id: `#${id}`,
      })
      .andWhere('ub.MATCH_DT BETWEEN :begin AND :end', {
        begin: beginDate,
        end: endDate,
      })
      .groupBy('ub.USER_ID')
      .addGroupBy('ub.MATCH_DT')
      .addGroupBy('ub.MATCH_DUR')
      .addGroupBy('ub.MAP_MD_CD')
      .addGroupBy('ub.MAP_ID')
      .addGroupBy('ub.MATCH_TYP')
      .addGroupBy('ub.MATCH_TYP_RAW')
      .addGroupBy('ub.MATCH_GRD')
      .addGroupBy('ub.MATCH_CHG')
      .addGroupBy('m.MAP_MD')
      .orderBy('ub.MATCH_DT', 'DESC')
      .getRawMany();
  }
}
