import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';
import { BaseEntity } from '~/database/entities/base.entity';
import { Users } from './users.entity';
import { Brawlers } from '~/brawlers/entities/brawlers.entity';
import { Maps } from '~/maps/entities/maps.entity';

abstract class Common extends BaseEntity {
  @PrimaryColumn({
    name: 'USER_ID',
    type: 'varchar',
    length: 12,
  })
  userID: string;

  @PrimaryColumn({
    name: 'BRAWLER_ID',
    length: 8,
  })
  brawlerID: string;
}

@Entity({ name: 'USER_BRAWLERS' })
export class UserBrawlers extends Common {
  @Column({
    name: 'BRAWLER_PWR',
    type: 'tinyint',
  })
  brawlerPower: number;

  @Column({
    name: 'TROPHY_BGN',
    type: 'smallint',
  })
  beginTrophies: number;

  @Column({
    name: 'TROPHY_CUR',
    type: 'smallint',
  })
  currentTrophies: number;

  @Column({
    name: 'TROPHY_HGH',
    type: 'smallint',
  })
  highestTrophies: number;

  @Column({
    name: 'TROPHY_RNK',
    type: 'varchar',
    length: 2,
  })
  brawlerRank: string;

  @ManyToOne(() => Users, (user) => user.userBrawlers)
  @JoinColumn({ name: 'USER_ID', referencedColumnName: 'userID' })
  user: Relation<Users>;

  @ManyToOne(() => Brawlers, (brawler) => brawler.userBrawlers)
  @JoinColumn({ name: 'BRAWLER_ID', referencedColumnName: 'brawlerID' })
  brawler: Relation<Brawlers>;
}

@Entity({ name: 'USER_BRAWLER_BATTLES' })
export class UserBrawlerBattles extends Common {
  @PrimaryColumn({
    name: 'MAP_ID',
    length: 8,
  })
  mapID: string;

  @PrimaryColumn({
    name: 'MATCH_TYP',
    type: 'tinyint',
  })
  matchType: number;

  @PrimaryColumn({
    name: 'MATCH_TYP_RAW',
    type: 'tinyint',
  })
  matchGrade: number;

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

  @ManyToOne(() => Brawlers, (brawler) => brawler.userBrawlerBattles)
  @JoinColumn({ name: 'BRAWLER_ID', referencedColumnName: 'brawlerID' })
  brawler: Relation<Brawlers>;

  @ManyToOne(() => Maps, (map) => map.userBrawlerBattles)
  @JoinColumn({ name: 'MAP_ID', referencedColumnName: 'mapID' })
  map: Relation<Maps>;
}

@Entity({ name: 'USER_BRAWLER_ITEMS' })
export class UserBrawlerItems extends Common {
  @PrimaryColumn({
    name: 'ITEM_ID',
    length: 8,
  })
  itemID: string;

  @Column({
    name: 'ITEM_K',
    type: 'varchar',
    length: 12,
  })
  itemKind: string;

  @Column({
    name: 'ITEM_NM',
    type: 'varchar',
    length: 30,
  })
  itemName: string;

  @ManyToOne(() => Brawlers, (brawler) => brawler.userBrawlerItems)
  @JoinColumn({ name: 'BRAWLER_ID', referencedColumnName: 'brawlerID' })
  brawler: Relation<Brawlers>;
}
