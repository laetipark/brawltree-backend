import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '~/database/entities/base.entity';
import { Users } from './users.entity';
import { BrawlerItems, Brawlers } from '~/brawlers/entities/brawlers.entity';
import { Maps } from '~/maps/entities/maps.entity';

abstract class Common extends BaseEntity {
  @PrimaryColumn({
    name: 'user_id',
    type: 'varchar',
    length: 20,
  })
  userID: string;

  @PrimaryColumn({
    name: 'brawler_id',
    length: 8,
  })
  brawlerID: string;
}

@Entity({ name: 'user_brawlers' })
export class UserBrawlers extends Common {
  @Column({
    name: 'brawler_power',
    type: 'tinyint',
  })
  brawlerPower: number;

  @Column({
    name: 'begin_trophies',
    type: 'smallint',
  })
  beginTrophies: number;

  @Column({
    name: 'current_trophies',
    type: 'smallint',
  })
  currentTrophies: number;

  @Column({
    name: 'highest_trophies',
    type: 'smallint',
  })
  highestTrophies: number;

  @Column({
    name: 'brawler_rank',
    type: 'varchar',
    length: 2,
  })
  brawlerRank: string;

  @ManyToOne(() => Users, (user) => user.userBrawlers)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Users;

  @ManyToOne(() => Brawlers, (brawler) => brawler.userBrawlers)
  @JoinColumn({ name: 'brawler_id', referencedColumnName: 'id' })
  brawler: Brawlers;
}

@Entity({ name: 'user_brawler_battles' })
export class UserBrawlerBattles extends Common {
  @PrimaryColumn({
    name: 'map_id',
    length: 8,
  })
  mapID: string;

  @PrimaryColumn({
    name: 'match_type',
    type: 'tinyint',
  })
  matchType: number;

  @PrimaryColumn({
    name: 'match_grade',
    type: 'tinyint',
  })
  matchGrade: number;

  @Column({
    name: 'match_count',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  matchCount: number;

  @Column({
    name: 'victories_count',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  victoriesCount: number;

  @Column({
    name: 'defeats_count',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  defeatsCount: number;

  @ManyToOne(() => Brawlers, (brawler) => brawler.userBrawlerBattles)
  @JoinColumn({ name: 'brawler_id', referencedColumnName: 'id' })
  brawler: Brawlers;

  @ManyToOne(() => Maps, (map) => map.userBrawlerBattles)
  @JoinColumn({ name: 'map_id', referencedColumnName: 'id' })
  map: Maps;
}

@Entity({ name: 'user_brawler_items' })
export class UserBrawlerItems extends Common {
  @PrimaryColumn({
    name: 'item_id',
    length: 8,
  })
  itemID: string;

  @ManyToOne(() => Brawlers, (brawler) => brawler.userBrawlerItems)
  @JoinColumn({ name: 'brawler_id', referencedColumnName: 'id' })
  brawler: Brawlers;

  @ManyToOne(() => BrawlerItems, (brawler) => brawler.userBrawlerItems)
  @JoinColumn([
    {
      name: 'brawler_id',
      referencedColumnName: 'brawlerID',
    },
    {
      name: 'item_id',
      referencedColumnName: 'id',
    },
  ])
  brawlerItem: BrawlerItems;
}
