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
    name: 'brawler_rank_25',
    type: 'smallint',
    unsigned: true,
    default: () => 0,
  })
  brawlerRank25: number;

  @Column({
    name: 'brawler_rank_30',
    type: 'smallint',
    unsigned: true,
    default: () => 0,
  })
  brawlerRank30: number;

  @Column({
    name: 'brawler_rank_35',
    type: 'smallint',
    unsigned: true,
    default: () => 0,
  })
  brawlerRank35: number;

  @Column({
    name: 'current_solo_league_rank',
    type: 'tinyint',
    unsigned: true,
    default: () => 0,
  })
  currentSoloPL: number;

  @Column({
    name: 'highest_solo_league_rank',
    type: 'tinyint',
    unsigned: true,
    default: () => 0,
  })
  highestSoloPL: number;

  @Column({
    name: 'current_team_league_rank',
    type: 'tinyint',
    unsigned: true,
    default: () => 0,
  })
  currentTeamPL: number;

  @Column({
    name: 'highest_team_league_rank',
    type: 'tinyint',
    unsigned: true,
    default: () => 0,
  })
  highestTeamPL: number;

  @OneToOne(() => Users, (user) => user.userProfile, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Users;
}
