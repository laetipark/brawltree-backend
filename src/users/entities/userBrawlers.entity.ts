import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';
import { Users } from './users.entity';
import { Brawlers } from '~/brawlers/entities/brawlers.entity';
import { Maps } from '~/maps/entities/maps.entity';

abstract class Common {
  @PrimaryGeneratedColumn()
  USER_ID: string;

  @PrimaryColumn()
  BRAWLER_ID: string;
}

@Entity({ name: 'USER_BRAWLERS' })
export class UserBrawlers extends Common {
  @Column()
  BRAWLER_PWR: number;

  @Column()
  TROPHY_BGN: number;

  @Column()
  TROPHY_CUR: number;

  @Column()
  TROPHY_HGH: number;

  @Column()
  TROPHY_RNK: number;

  @ManyToOne(() => Users, (user) => user.userBrawlers)
  @JoinColumn({ name: 'USER_ID', referencedColumnName: 'USER_ID' })
  user: Relation<Users>;

  @ManyToOne(() => Brawlers, (brawler) => brawler.userBrawlers)
  @JoinColumn({ name: 'BRAWLER_ID', referencedColumnName: 'BRAWLER_ID' })
  brawler: Relation<Brawlers>;
}

@Entity({ name: 'USER_BRAWLER_BATTLES' })
export class UserBrawlerBattles extends Common {
  @PrimaryColumn()
  MAP_ID: string;

  @PrimaryColumn()
  MATCH_TYP: number;

  @PrimaryColumn()
  MATCH_GRD: number;

  @Column()
  MATCH_CNT: number;

  @Column()
  MATCH_CNT_VIC: number;

  @Column()
  MATCH_CNT_DEF: number;

  @ManyToOne(() => Brawlers, (brawler) => brawler.userBrawlerBattles)
  @JoinColumn({ name: 'BRAWLER_ID', referencedColumnName: 'BRAWLER_ID' })
  brawler: Relation<Brawlers>;

  @ManyToOne(() => Maps, (map) => map.userBrawlerBattles)
  @JoinColumn({ name: 'MAP_ID', referencedColumnName: 'MAP_ID' })
  map: Relation<Maps>;
}

@Entity({ name: 'USER_BRAWLER_ITEMS' })
export class UserBrawlerItems extends Common {
  @PrimaryColumn()
  ITEM_ID: string;

  @Column()
  ITEM_K: string;

  @Column()
  ITEM_NM: string;

  @ManyToOne(() => Brawlers, (brawler) => brawler.userBrawlerItems)
  @JoinColumn({ name: 'BRAWLER_ID', referencedColumnName: 'BRAWLER_ID' })
  brawler: Relation<Brawlers>;
}
