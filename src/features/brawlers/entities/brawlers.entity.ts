import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { BaseEntity } from '~/database/entities/base.entity';
import { BattleStats } from '~/brawlers/entities/battle-stats.entity';
import { UserBattles } from '~/users/entities/user-battles.entity';
import {
  UserBrawlerBattles,
  UserBrawlerItems,
  UserBrawlers,
} from '~/users/entities/user-brawlers.entity';

@Entity({ name: 'brawlers' })
export class Brawlers extends BaseEntity {
  @PrimaryColumn({
    length: 8,
  })
  id: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 20,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  rarity: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  role: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  gender: string;

  @Column({
    name: 'discord_pin',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  icon: string;

  @OneToMany(() => BrawlerItems, (brawler) => brawler.brawler)
  brawlerItems: BrawlerItems[];

  @OneToMany(() => BattleStats, (brawler) => brawler.brawler)
  battleStats: BattleStats[];

  @OneToMany(() => UserBattles, (battle) => battle.brawler)
  userBattles: UserBattles[];

  @OneToMany(() => UserBrawlers, (brawler) => brawler.brawler)
  userBrawlers: UserBrawlers[];

  @OneToMany(() => UserBrawlerBattles, (brawler) => brawler.brawler)
  userBrawlerBattles: UserBrawlerBattles[];

  @OneToMany(() => UserBrawlerItems, (brawler) => brawler.brawler)
  userBrawlerItems: UserBrawlerItems[];
}

@Entity({ name: 'brawler_items' })
export class BrawlerItems {
  @PrimaryColumn({ type: 'char', length: 8 })
  id: string;

  @Column({ name: 'brawler_id', type: 'char', length: 8 })
  brawlerID: string;

  @Column({ type: 'varchar', length: 20 })
  kind: string;

  @Column({ type: 'varchar', length: 30 })
  name: string;

  @OneToMany(() => UserBrawlerItems, (brawler) => brawler.brawlerItems)
  userBrawlerItems: UserBrawlerItems[];

  @ManyToOne(() => Brawlers, (brawler) => brawler.brawlerItems)
  @JoinColumn({ name: 'brawler_id', referencedColumnName: 'id' })
  brawler: Brawlers;
}
