import { Entity, PrimaryGeneratedColumn, PrimaryColumn, Column } from 'typeorm';

abstract class Common {
  @PrimaryGeneratedColumn()
  MAP_ID: string;
}

@Entity({ name: 'BATTLE_TRIO' })
export class BattleTrio extends Common {
  @PrimaryColumn()
  BRAWLER_1_ID: string;

  @PrimaryColumn()
  BRAWLER_2_ID: string;

  @PrimaryColumn()
  BRAWLER_3_ID: string;

  @PrimaryColumn()
  MATCH_TYP: number;

  @PrimaryColumn()
  MATCH_GRD: number;

  @Column()
  MAP_MD: string;

  @Column()
  MATCH_CNT: number;

  @Column()
  MATCH_CNT_VIC: number;

  @Column()
  MATCH_CNT_DEF: number;
}

@Entity({ name: 'BRAWLER_STATS' })
export class BrawlerStats extends Common {
  @PrimaryColumn()
  BRAWLER_ID: string;

  @PrimaryColumn()
  MATCH_TYP: number;

  @PrimaryColumn()
  MATCH_GRD: number;

  @Column()
  MAP_MD: string;

  @Column()
  MATCH_CNT: number;

  @Column()
  MATCH_CNT_VIC: number;

  @Column()
  MATCH_CNT_DEF: number;
}
