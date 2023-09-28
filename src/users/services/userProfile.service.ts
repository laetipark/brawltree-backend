import { Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserBattles, UserProfile } from '../entities/users.entity';
import {
  UserBrawlerItems,
  UserBrawlers,
} from '../entities/userBrawlers.entity';
import { SeasonsEntity } from '../../seasons/seasons.entity';
import { CreateUserBrawlersDto } from '../dto/create-userBrawlers.dto';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private userProfile: Repository<UserProfile>,
    @InjectRepository(UserBattles)
    private userBattles: Repository<UserBattles>,
    @InjectRepository(UserBrawlers)
    private userBrawlers: Repository<UserBrawlers>,
    @InjectRepository(UserBrawlerItems)
    private userBrawlerItems: Repository<UserBrawlerItems>,
  ) {}

  async findUserProfile(@Param('id') id: string) {
    return await this.userProfile.findOne({
      where: {
        USER_ID: `#${id}`,
      },
    });
  }

  async updateUserProfile(user: any, season: SeasonsEntity) {
    const getRankPL = async (tag: string, typeNum: number, column: string) => {
      return await this.userBattles
        .createQueryBuilder('ub')
        .select(['ub.BRAWLER_TRP'])
        .where('ub.USER_ID = :tag AND ub.PLAYER_ID = :tag', {
          tag: tag,
        })
        .andWhere('ub.MATCH_TYP = :type', {
          type: typeNum,
        })
        .orderBy(column, 'DESC')
        .getOne()
        .then((result) => (result != null ? result.BRAWLER_TRP - 1 : 0));
    };

    const getTrophyBegin = async (
      tag: string,
      brawlerID: string,
      current: number,
    ) => {
      return await this.userBattles
        .createQueryBuilder('ub')
        .select(['ub.BRAWLER_TRP'])
        .where(
          'ub.USER_ID = :tag AND ' +
            'ub.PLAYER_ID = :tag AND ' +
            'ub.BRAWLER_ID = :brawler AND ' +
            'ub.MATCH_TYP = 0 AND ' +
            'ub.MATCH_DT >= :season',
          {
            tag: tag,
            brawler: brawlerID,
            season: season.SEASON_BGN_DT,
          },
        )
        .orderBy('ub.MATCH_DT', 'DESC')
        .getOne()
        .then((result) => (result != null ? result.BRAWLER_TRP : current));
    };

    if (user.tag !== undefined) {
      const [
        soloRankCurrent,
        teamRankCurrent,
        soloRankHighest,
        teamRankHighest,
      ] = await Promise.all([
        getRankPL(user.tag, 2, 'MATCH_DT'),
        getRankPL(user.tag, 3, 'MATCH_DT'),
        getRankPL(user.tag, 2, 'BRAWLER_TRP'),
        getRankPL(user.tag, 3, 'BRAWLER_TRP'),
      ]);

      const brawlers: CreateUserBrawlersDto[] = [];
      const brawlerItems: UserBrawlerItems[] = [];
      const brawlerItemIDs = [];
      user.brawlers.map(async (brawler) => {
        const brawlerID = brawler.id;
        const brawlerPower = brawler.power;
        const trophyBegin = await getTrophyBegin(
          user.tag,
          brawlerID,
          brawler.trophies,
        );

        brawlers.push({
          USER_ID: user.tag,
          BRAWLER_ID: brawlerID,
          BRAWLER_PWR: brawlerPower,
          TROPHY_BGN: trophyBegin,
          TROPHY_CUR: brawler.trophies,
          TROPHY_HGH: brawler.highestTrophies,
          TROPHY_RNK: brawler.rank,
        });

        const gears = brawler.gears;
        const starPowers = brawler.starPowers;
        const gadgets = brawler.gadgets;

        gears.map(async ({ id, name }) => {
          brawlerItems.push(<UserBrawlerItems>{
            USER_ID: user.tag,
            BRAWLER_ID: brawlerID,
            ITEM_ID: id,
            ITEM_K: 'gear',
            ITEM_NM: name,
          });
          brawlerItemIDs.push(id);
        });

        starPowers.map(async ({ id, name }) => {
          brawlerItems.push(<UserBrawlerItems>{
            USER_ID: user.tag,
            BRAWLER_ID: brawlerID,
            ITEM_ID: id,
            ITEM_K: 'starPower',
            ITEM_NM: name,
          });
          brawlerItemIDs.push(id);
        });

        gadgets.map(async ({ id, name }) => {
          brawlerItems.push(<UserBrawlerItems>{
            USER_ID: user.tag,
            BRAWLER_ID: brawlerID,
            ITEM_ID: id,
            ITEM_K: 'gadget',
            ITEM_NM: name,
          });
          brawlerItemIDs.push(id);
        });
      });

      await this.userProfile.save({
        USER_ID: user.tag,
        USER_NM: user.name,
        USER_PRFL: user.icon.id,
        CLUB_ID: user.club.tag,
        CLUB_NM: user.club.name,
        TROPHY_CUR: user.trophies,
        TROPHY_HGH: user.highestTrophies,
        VICTORY_TRP: user['3vs3Victories'],
        VICTORY_DUO: user.duoVictories,
        BRAWLER_RNK_25: user.brawlers.filter((brawler) => brawler.rank >= 25)
          .length,
        BRAWLER_RNK_30: user.brawlers.filter((brawler) => brawler.rank >= 30)
          .length,
        BRAWLER_RNK_35: user.brawlers.filter((brawler) => brawler.rank >= 35)
          .length,
        PL_SL_CUR: soloRankCurrent,
        PL_SL_HGH: soloRankHighest,
        PL_TM_CUR: teamRankCurrent,
        PL_TM_HGH: teamRankHighest,
      });
      await this.userBrawlers.upsert(brawlers, ['USER_ID', 'BRAWLER_ID']);
      await this.userBrawlerItems.upsert(brawlerItems, [
        'USER_ID',
        'BRAWLER_ID',
        'ITEM_ID',
      ]);
      await this.userBrawlerItems
        .createQueryBuilder('ubi')
        .delete()
        .where('USER_ID = :id', {
          id: user.tag,
        })
        .andWhere('ITEM_ID NOT IN (:items)', {
          items: brawlerItemIDs,
        })
        .execute();
    }
  }
}
