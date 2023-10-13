import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBattles, UserProfile } from '~/users/entities/users.entity';
import {
  UserBrawlerItems,
  UserBrawlers,
} from '~/users/entities/user-brawlers.entity';
import { Seasons } from '~/seasons/entities/seasons.entity';

import { CreateUserBrawlersDto } from '~/users/dto/create-userBrawlers.dto';

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

  async findUserProfile(id: string, season: Seasons) {
    const trophyChange = await this.userBattles
      .createQueryBuilder('ub')
      .select('SUM(ub.matchChange)', 'trophyChange')
      .where('ub.userID = :id AND ub.playerID = :id', {
        id: `#${id}`,
      })
      .andWhere('ub.matchDate >= :season', {
        season: season.beginDate,
      })
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

  async updateUserProfile(user: any, season: Seasons) {
    const getRankPL = async (tag: string, typeNum: number, column: string) => {
      return await this.userBattles
        .createQueryBuilder('ub')
        .select(['ub.brawlerTrophies'])
        .where('ub.userID = :tag AND ub.playerID = :tag', {
          tag: tag,
        })
        .andWhere('ub.matchType = :type', {
          type: typeNum,
        })
        .orderBy(column, 'DESC')
        .getOne()
        .then((result) => (result != null ? result.brawlerTrophies - 1 : 0));
    };

    const getBeginTrophies = async (
      tag: string,
      brawlerID: string,
      current: number,
    ) => {
      return await this.userBattles
        .createQueryBuilder('ub')
        .select(['ub.brawlerTrophies'])
        .where(
          'ub.userID = :tag AND ' +
            'ub.playerID = :tag AND ' +
            'ub.brawlerID = :brawler AND ' +
            'ub.matchType = 0 AND ' +
            'ub.matchDate >= :season',
          {
            tag: tag,
            brawler: brawlerID,
            season: season.beginDate,
          },
        )
        .orderBy('ub.matchDate', 'DESC')
        .getOne()
        .then((result) => (result != null ? result.brawlerTrophies : current));
    };

    if (user.tag !== undefined) {
      const [
        soloRankCurrent,
        teamRankCurrent,
        soloRankHighest,
        teamRankHighest,
      ] = await Promise.all([
        getRankPL(user.tag, 2, 'ub.matchDate'),
        getRankPL(user.tag, 3, 'ub.matchDate'),
        getRankPL(user.tag, 2, 'ub.brawlerTrophies'),
        getRankPL(user.tag, 3, 'ub.brawlerTrophies'),
      ]);

      const brawlers: CreateUserBrawlersDto[] = [];
      const brawlerItems: UserBrawlerItems[] = [];
      const brawlerItemIDs = [];
      user.brawlers.map(async (brawler) => {
        const brawlerID = brawler.id;
        const brawlerPower = brawler.power;
        const trophyBegin = await getBeginTrophies(
          user.tag,
          brawlerID,
          brawler.trophies,
        );

        brawlers.push({
          userID: user.tag,
          brawlerID: brawlerID,
          brawlerPower: brawlerPower,
          beginTrophies: trophyBegin,
          currentTrophies: brawler.trophies,
          highestTrophies: brawler.highestTrophies,
          brawlerRank: brawler.rank,
        });

        const gears = brawler.gears;
        const starPowers = brawler.starPowers;
        const gadgets = brawler.gadgets;

        gears.map(async ({ id, name }) => {
          brawlerItems.push(<UserBrawlerItems>{
            userID: user.tag,
            brawlerID: brawlerID,
            itemID: id,
            itemKind: 'gear',
            itemName: name,
          });
          brawlerItemIDs.push(id);
        });

        starPowers.map(async ({ id, name }) => {
          brawlerItems.push(<UserBrawlerItems>{
            userID: user.tag,
            brawlerID: brawlerID,
            itemID: id,
            itemKind: 'starPower',
            itemName: name,
          });
          brawlerItemIDs.push(id);
        });

        gadgets.map(async ({ id, name }) => {
          brawlerItems.push(<UserBrawlerItems>{
            userID: user.tag,
            brawlerID: brawlerID,
            itemID: id,
            itemKind: 'gadget',
            itemName: name,
          });
          brawlerItemIDs.push(id);
        });
      });

      await this.userProfile.upsert(
        {
          userID: user.tag,
          name: user.name,
          profile: user.icon.id,
          clubID: user.club.tag || null,
          clubName: user.club.name || null,
          currentTrophies: user.trophies,
          highestTrophies: user.highestTrophies,
          tripleVictories: user['3vs3Victories'],
          duoVictories: user.duoVictories,
          rank25Brawlers: user.brawlers.filter((brawler) => brawler.rank >= 25)
            .length,
          rank30Brawlers: user.brawlers.filter((brawler) => brawler.rank >= 30)
            .length,
          rank35Brawlers: user.brawlers.filter((brawler) => brawler.rank >= 35)
            .length,
          currentSoloPL: soloRankCurrent,
          highestSoloPL: soloRankHighest,
          currentTeamPL: teamRankCurrent,
          highestTeamPL: teamRankHighest,
        },
        ['userID'],
      );
      await this.userBrawlers.upsert(brawlers, ['userID', 'brawlerID']);
      await this.userBrawlerItems.upsert(brawlerItems, [
        'userID',
        'brawlerID',
        'itemID',
      ]);
      await this.userBrawlerItems
        .createQueryBuilder('ubi')
        .delete()
        .where('userID = :id', {
          id: user.tag,
        })
        .andWhere('itemID NOT IN (:items)', {
          items: brawlerItemIDs,
        })
        .execute();
    }
  }
}
