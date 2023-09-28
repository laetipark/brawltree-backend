import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Relation,
} from 'typeorm';
import { UserBattles } from '../../users/entities/users.entity';
import {
  UserBrawlerBattles, UserBrawlerItems,
  UserBrawlers,
} from '../../users/entities/userBrawlers.entity';

@Entity({ name: 'BRAWLERS' })
export class Brawlers {
  @PrimaryGeneratedColumn()
  BRAWLER_ID: string;

  @Column()
  BRAWLER_NM: string;

  @Column()
  BRAWLER_RRT: string;

  @Column()
  BRAWLER_CL: string;

  @Column()
  BRAWLER_GNDR: string;

  @Column()
  BRAWLER_ICN: string;

  @Column()
  BRAWLER_SP1_ID: string;

  @Column()
  BRAWLER_SP1_NM: string;

  @Column()
  BRAWLER_SP2_ID: string;

  @Column()
  BRAWLER_SP2_NM: string;

  @Column()
  BRAWLER_GDG1_ID: string;

  @Column()
  BRAWLER_GDG1_NM: string;

  @Column()
  BRAWLER_GDG2_ID: string;

  @Column()
  BRAWLER_GDG2_NM: string;

  @OneToMany(() => UserBattles, (battle) => battle.brawler)
  userBattles: Relation<UserBattles[]>;

  @OneToMany(() => UserBrawlers, (brawler) => brawler.brawler)
  userBrawlers: Relation<UserBrawlers[]>;

  @OneToMany(() => UserBrawlerBattles, (brawler) => brawler.brawler)
  userBrawlerBattles: Relation<UserBrawlerBattles[]>;

  @OneToMany(() => UserBrawlerItems, (brawler) => brawler.brawler)
  userBrawlerItems: Relation<UserBrawlerItems[]>;
}
