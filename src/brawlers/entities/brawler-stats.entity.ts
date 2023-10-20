import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { BaseEntity } from '~/database/entities/base.entity';
import { Brawlers } from '~/brawlers/entities/brawlers.entity';

abstract class Common extends BaseEntity {
  @PrimaryColumn({
    name: 'AGGREGATION_DT',
    type: 'varchar',
    length: 12,
  })
  aggregationDate: Date;

  @PrimaryColumn({
    name: 'MAP_ID',
    length: 8,
  })
  mapID: string;
}

@Entity({ name: 'BATTLE_TRIO' })
export class BattleTrio extends Common {
  @PrimaryColumn({
    name: 'BRAWLER_1_ID',
    length: 8,
  })
  brawlerID1: string;

  @PrimaryColumn({
    name: 'BRAWLER_2_ID',
    length: 8,
  })
  brawlerID2: string;

  @PrimaryColumn({
    name: 'BRAWLER_3_ID',
    length: 8,
  })
  brawlerID3: string;

  @PrimaryColumn({
    name: 'MATCH_TYP',
    type: 'tinyint',
  })
  matchType: number;

  @PrimaryColumn({
    name: 'MATCH_GRD',
    type: 'tinyint',
  })
  matchGrade: number;

  @Column({
    name: 'MAP_MD',
    type: 'varchar',
    length: 12,
  })
  mode: string;

  @Column({
    name: 'MATCH_CNT',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  matchCount: number;

  @Column({
    name: 'MATCH_CNT_VIC',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  victoryCount: number;

  @Column({
    name: 'MATCH_CNT_DEF',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  defeatCount: number;
}

@Entity({ name: 'BRAWLER_STATS' })
export class BrawlerStats extends Common {
  @PrimaryColumn({
    name: 'BRAWLER_ID',
    length: 8,
  })
  brawlerID: string;

  @PrimaryColumn({
    name: 'MATCH_TYP',
    type: 'tinyint',
  })
  matchType: number;

  @PrimaryColumn({
    name: 'MATCH_GRD',
    type: 'tinyint',
  })
  matchGrade: number;

  @Column({
    name: 'MAP_MD',
    type: 'varchar',
    length: 12,
  })
  mode: string;

  @Column({
    name: 'MATCH_CNT',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  matchCount: number;

  @Column({
    name: 'MATCH_CNT_VIC',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  victoryCount: number;

  @Column({
    name: 'MATCH_CNT_DEF',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  defeatCount: number;

  @ManyToOne(() => Brawlers, (brawler) => brawler.brawlerStats)
  @JoinColumn({ name: 'BRAWLER_ID', referencedColumnName: 'brawlerID' })
  brawler: Relation<Brawlers>;
}
