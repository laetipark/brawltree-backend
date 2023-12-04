import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '~/database/entities/base.entity';
import { Brawlers } from '~/brawlers/entities/brawlers.entity';

@Entity({ name: 'battle_stats' })
export class BattleStats extends BaseEntity {
  @PrimaryColumn({
    name: 'map_id',
    length: 8,
  })
  mapID: string;

  @PrimaryColumn({
    name: 'brawler_id',
    length: 8,
  })
  brawlerID: string;

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
    name: 'mode_name',
    type: 'varchar',
    length: 12,
  })
  mode: string;

  @Column({
    name: 'match_count',
    type: 'int',
    unsigned: true,
    default: () => 0,
  })
  matchCount: number;

  @Column({
    name: 'MATCH_CNT_VIC',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  victoriesCount: number;

  @Column({
    name: 'defeats_count',
    type: 'int',
    unsigned: true,
    default: () => 0,
  })
  defeatsCount: number;

  @ManyToOne(() => Brawlers, (brawler) => brawler.battleStats)
  @JoinColumn({ name: 'brawler_id', referencedColumnName: 'id' })
  brawler: Brawlers;
}
