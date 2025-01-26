import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn
} from 'typeorm';
import { BaseEntity, SoftDeleteEntity } from '~/database/entities/base.entity';
import { BattleStats } from './battle-stats.entity';
import { UserBattles } from '~/users/entities/user-battles.entity';
import {
  UserBrawlerBattles,
  UserBrawlerItems,
  UserBrawlers
} from '~/users/entities/user-brawlers.entity';

@Entity({ name: 'brawlers' })
export class Brawlers extends BaseEntity {
  @PrimaryColumn({
    length: 8
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 20
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true
  })
  rarity: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true
  })
  role: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true
  })
  gender: string;

  @Column({
    name: 'discord_pin',
    type: 'varchar',
    length: 40,
    nullable: true
  })
  icon: string;

  @OneToMany(() => BrawlerItems, (brawler) => brawler.brawler)
  brawlerItems: BrawlerItems[];

  @OneToMany(() => BrawlerSkills, (brawler) => brawler.brawler)
  brawlerSkills: BrawlerSkills[];

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
export class BrawlerItems extends SoftDeleteEntity {
  @PrimaryColumn({ type: 'char', length: 8 })
  id: string;

  @PrimaryColumn({ name: 'brawler_id', type: 'char', length: 8 })
  brawlerID: string;

  @Column({ type: 'varchar', length: 20 })
  kind: string;

  @Column({ type: 'varchar', length: 30 })
  name: string;

  @Column({ type: 'json' })
  values: object;

  @OneToMany(() => UserBrawlerItems, (brawler) => brawler.brawlerItem)
  userBrawlerItems: UserBrawlerItems[];

  @ManyToOne(() => Brawlers, (brawler) => brawler.brawlerItems)
  @JoinColumn({ name: 'brawler_id', referencedColumnName: 'id' })
  brawler: Brawlers;
}

@Entity({ name: 'brawler_skills' })
export class BrawlerSkills extends SoftDeleteEntity {
  @PrimaryColumn({ name: 'brawler_id', type: 'char', length: 8 })
  brawlerID: string;

  @Column({ type: 'json' })
  values: object;

  @ManyToOne(() => Brawlers, (brawler) => brawler.brawlerItems)
  @JoinColumn({ name: 'brawler_id', referencedColumnName: 'id' })
  brawler: Brawlers;
}
