import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BrawlerItems,
  Brawlers,
  BrawlerSkills
} from './entities/brawlers.entity';
import { BattleStats } from './entities/battle-stats.entity';
import { GameMaps } from '~/maps/entities/maps.entity';
import { GameModes } from '~/maps/entities/modes.entity';

@Injectable()
export class BrawlersService{
  constructor(
    @InjectRepository(Brawlers)
    private brawlers:Repository<Brawlers>,
    @InjectRepository(BrawlerSkills)
    private brawlerSkills:Repository<BrawlerSkills>,
    @InjectRepository(BrawlerItems)
    private brawlerItems:Repository<BrawlerItems>,
    @InjectRepository(BattleStats)
    private brawlerStats:Repository<BattleStats>,
    @InjectRepository(GameModes)
    private gameModes:Repository<GameModes>
  ){}

  async getBrawler(id:string){
    return await this.brawlerSkills.findOne({
      where:{
        brawlerID:id
      }
    });
  }

  async getBrawlers():Promise<Brawlers[]>{
    return await this.brawlers.find({});
  }

  async selectBrawlerSummary(){
    return [
      await this.brawlerStats
        .createQueryBuilder('bs')
        .select('bs.brawlerID', 'brawlerID')
        .addSelect('b.name', 'brawlerName')
        .addSelect(
          'SUM(bs.matchCount) * 100 / SUM(SUM(bs.matchCount)) OVER()',
          'trophyPickRate'
        )
        .addSelect(
          'SUM(bs.victoriesCount) * 100 / (SUM(bs.victoriesCount) + SUM(bs.defeatsCount))',
          'trophyVictoryRate'
        )
        .innerJoin('bs.brawler', 'b')
        .where('bs.matchType = 0')
        .andWhere('bs.matchGrade > 5')
        .groupBy('bs.brawlerID')
        .orderBy('trophyPickRate', 'DESC')
        .addOrderBy('trophyVictoryRate', 'DESC')
        .limit(10)
        .getRawMany(),
      await this.brawlerStats
        .createQueryBuilder('bs')
        .select('bs.brawlerID', 'brawlerID')
        .addSelect('b.name', 'brawlerName')
        .addSelect(
          'SUM(bs.matchCount) * 100 / SUM(SUM(bs.matchCount)) OVER()',
          'rankedPickRate'
        )
        .addSelect(
          'SUM(bs.victoriesCount) * 100 / (SUM(bs.victoriesCount) + SUM(bs.defeatsCount))',
          'rankedVictoryRate'
        )
        .innerJoin('bs.brawler', 'b')
        .where('bs.matchType = 2')
        .andWhere('bs.matchGrade > 16')
        .groupBy('bs.brawlerID')
        .orderBy('rankedPickRate', 'DESC')
        .addOrderBy('rankedVictoryRate', 'DESC')
        .limit(10)
        .getRawMany()
    ];
  }

  async getBrawlerStats(){
    return await this.brawlerStats
      .createQueryBuilder('bs')
      .select('bs.brawlerID', 'brawlerID')
      .addSelect('bs.matchType', 'matchType')
      .addSelect(
        'SUM(bs.matchCount) * 100 / SUM(SUM(bs.matchCount)) OVER(PARTITION BY bs.matchType)',
        'pickRate'
      )
      .addSelect(
        'SUM(bs.victoriesCount) * 100 / (SUM(bs.victoriesCount) + SUM(bs.defeatsCount))',
        'victoryRate'
      )
      .groupBy('bs.brawlerID')
      .addGroupBy('bs.matchType')
      .getRawMany();
  }

  async getBrawlerItems(id:string){
    return await this.brawlerItems.find({
      where:{
        brawlerID:id
      }
    });
  }

  async getBrawlerMaps(){
    const modes = (
      await this.gameModes
        .createQueryBuilder('modes')
        .select('modes.modeName', 'modeName')
        .where('modes.modeType NOT IN (:type)', {
          type:[3, 2]
        })
        .getRawMany()
    ).map((m) => m.modeName);

    return await this.brawlerStats
      .createQueryBuilder('bs')
      .select('bs.mapID', 'mapID')
      .addSelect('bs.brawlerID', 'brawlerID')
      .addSelect(
        'ROUND(SUM(bs.matchCount) * 100 / SUM(SUM(bs.matchCount)) OVER(PARTITION BY bs.mapID), 2)',
        'pickRate'
      )
      .addSelect(
        'ROUND(SUM(bs.victoriesCount) * 100 / (SUM(bs.victoriesCount) + SUM(bs.defeatsCount)), 2)',
        'victoryRate'
      )
      .addSelect('b.name', 'brawlerName')
      .addSelect('m.mode', 'mode')
      .addSelect('m.name', 'mapName')
      .leftJoin('bs.brawler', 'b')
      .innerJoin(GameMaps, 'm', 'bs.mapID = m.id')
      .where('m.mode NOT IN (:modes)', {
        modes:modes
      })
      .groupBy('bs.brawlerID')
      .addGroupBy('bs.mapID')
      .addGroupBy('b.name')
      .addGroupBy('m.mode')
      .addGroupBy('m.name')
      .orderBy('pickRate', 'DESC')
      .addOrderBy('victoryRate', 'DESC')
      .getRawMany();
  }

  /** 랜덤 브롤러 반환
   * @param rarity 브롤러 희귀도
   * @param role 브롤러 역할
   * @param gender 브롤러 성별
   */
  async getRandomBrawler(
    rarity:string,
    role:string,
    gender:string
  ):Promise<Brawlers>{
    return await this.brawlers
      .createQueryBuilder('b')
      .select('b.id', 'id')
      .addSelect('b.name', 'name')
      .addSelect('b.rarity', 'rarity')
      .addSelect('b.role', 'role')
      .addSelect('b.gender', 'gender')
      .addSelect('b.icon', 'icon')
      .where('b.rarity LIKE :rarity', {
        rarity:rarity || '%%'
      })
      .andWhere('b.role LIKE :role', {
        role:role || '%%'
      })
      .andWhere('b.gender LIKE :gender', {
        gender:gender || '%%'
      })
      .orderBy('RAND()')
      .limit(1)
      .getRawOne();
  }
}
