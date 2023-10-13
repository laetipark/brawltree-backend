import { Entity, PrimaryColumn, Column, OneToMany, Relation } from 'typeorm';
import { BaseEntity } from '~/database/entities/base.entity';
import { BrawlerStats } from './brawler-stats.entity';
import { UserBattles } from '~/users/entities/users.entity';
import {
  UserBrawlers,
  UserBrawlerBattles,
  UserBrawlerItems,
} from '~/users/entities/user-brawlers.entity';

@Entity({ name: 'BRAWLERS' })
export class Brawlers extends BaseEntity {
  @PrimaryColumn({
    name: 'BRAWLER_ID',
    length: 8,
  })
  brawlerID: string;

  @Column({
    name: 'BRAWLER_NM',
    type: 'varchar',
    length: 20,
  })
  name: string;

  @Column({
    name: 'BRAWLER_RRT',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  rarity: string;

  @Column({
    name: 'BRAWLER_RL',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  role: string;

  @Column({
    name: 'BRAWLER_GNDR',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  gender: string;

  @Column({
    name: 'BRAWLER_ICN',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  icon: string;

  @Column({
    name: 'BRAWLER_SP1_ID',
    length: 8,
  })
  starPowerID1: string;

  @Column({
    name: 'BRAWLER_SP1_NM',
    type: 'varchar',
    length: 30,
  })
  starPowerName1: string;

  @Column({
    name: 'BRAWLER_SP2_ID',
    length: 8,
  })
  starPowerID2: string;

  @Column({
    name: 'BRAWLER_SP2_NM',
    type: 'varchar',
    length: 30,
  })
  starPowerName2: string;

  @Column({
    name: 'BRAWLER_GDG1_ID',
    length: 8,
  })
  gadgetID1: string;

  @Column({
    name: 'BRAWLER_GDG1_NM',
    type: 'varchar',
    length: 30,
  })
  gadgetName1: string;

  @Column({
    name: 'BRAWLER_GDG2_ID',
    length: 8,
  })
  gadgetID2: string;

  @Column({
    name: 'BRAWLER_GDG2_NM',
    type: 'varchar',
    length: 30,
  })
  gadgetName2: string;

  @OneToMany(() => BrawlerStats, (brawler) => brawler.brawler)
  brawlerStats: Relation<BrawlerStats[]>;

  @OneToMany(() => UserBattles, (battle) => battle.brawler)
  userBattles: Relation<UserBattles[]>;

  @OneToMany(() => UserBrawlers, (brawler) => brawler.brawler)
  userBrawlers: Relation<UserBrawlers[]>;

  @OneToMany(() => UserBrawlerBattles, (brawler) => brawler.brawler)
  userBrawlerBattles: Relation<UserBrawlerBattles[]>;

  @OneToMany(() => UserBrawlerItems, (brawler) => brawler.brawler)
  userBrawlerItems: Relation<UserBrawlerItems[]>;
}
