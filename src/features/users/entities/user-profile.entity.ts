import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Users } from '~/users/entities/users.entity';
import { BaseEntity } from '~/database/entities/base.entity';

@Entity({ name: 'user_profile' })
export class UserProfile extends BaseEntity {
  @PrimaryColumn({
    name: 'user_id',
    type: 'varchar',
    length: 20,
  })
  userID: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 30,
  })
  name: string;

  @Column({
    name: 'profile_icon',
    length: 8,
  })
  profileIcon: string;

  @Column({
    name: 'club_id',
    type: 'varchar',
    length: 12,
    nullable: true,
  })
  clubID: string;

  @Column({
    name: 'club_name',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  clubName: string;

  @Column({
    name: 'current_trophies',
    type: 'int',
    unsigned: true,
  })
  currentTrophies: number;

  @Column({
    name: 'highest_trophies',
    type: 'int',
    unsigned: true,
  })
  highestTrophies: number;

  @Column({
    name: 'trio_match_victories',
    type: 'int',
    unsigned: true,
  })
  trioMatchVictories: number;

  @Column({
    name: 'duo_match_victories',
    type: 'int',
    unsigned: true,
  })
  duoMatchVictories: number;

  @Column({
    name: 'solo_match_victories',
    type: 'int',
    unsigned: true,
  })
  soloMatchVictories: number;

  @Column({
    name: 'brawler_rank_50',
    type: 'smallint',
    unsigned: true,
    default: () => 0,
  })
  brawlerRank50: number;

  @Column({
    name: 'current_solo_ranked',
    type: 'tinyint',
    unsigned: true,
    default: () => 0,
  })
  currentSoloRanked: number;

  @Column({
    name: 'highest_solo_ranked',
    type: 'tinyint',
    unsigned: true,
    default: () => 0,
  })
  highestSoloRanked: number;

  @OneToOne(() => Users, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Users;
}
