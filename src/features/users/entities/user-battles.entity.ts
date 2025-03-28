import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
} from 'typeorm';
import { Brawlers } from '~/brawlers/entities/brawlers.entity';
import { Users } from '~/users/entities/users.entity';
import { BaseEntity } from '~/database/entities/base.entity';

@Entity({ name: 'user_battles' })
@Index(['userID', 'playerID', 'brawlerID', 'battleTime'], { unique: true })
@Index(['userID', 'playerID', 'battleTime'])
@Index(['userID', 'playerID', 'battleTime', 'matchType', 'mapID'])
@Index(['userID', 'playerID', 'brawlerID', 'battleTime', 'matchType', 'mapID'])
export class UserBattles extends BaseEntity {
  @PrimaryColumn({
    name: 'user_id',
    type: 'varchar',
    length: 20
  })
  userID: string;

  @PrimaryColumn({
    name: 'player_id',
    type: 'varchar',
    length: 20
  })
  playerID: string;

  @PrimaryColumn({
    name: 'brawler_id',
    type: 'char',
    length: 8
  })
  brawlerID: string;

  @PrimaryColumn({
    name: 'battle_time',
    type: 'timestamp'
  })
  battleTime: Date;

  @Column({
    name: 'map_id',
    type: 'char',
    length: 8
  })
  mapID: string;

  @Column({
    name: 'mode_code',
    type: 'tinyint'
  })
  modeCode: number;

  @Column({
    name: 'match_type',
    type: 'tinyint'
  })
  matchType: number;

  @Column({
    name: 'match_grade',
    type: 'tinyint'
  })
  matchGrade: number;

  @Column({
    type: 'smallint',
    unsigned: true,
    nullable: true
  })
  duration: number;

  @Column({
    name: 'game_rank',
    type: 'tinyint'
  })
  gameRank: number;

  @Column({
    name: 'game_result',
    type: 'tinyint'
  })
  gameResult: number;

  @Column({
    name: 'trophy_change',
    type: 'tinyint'
  })
  trophyChange: number;

  @Column({
    name: 'duels_trophy_change',
    type: 'tinyint'
  })
  duelsTrophyChange: number;

  @Column({
    name: 'player_name',
    type: 'varchar',
    length: 30
  })
  playerName: string;

  @Column({
    name: 'team_number',
    type: 'tinyint'
  })
  teamNumber: number;

  @Column({
    name: 'is_team_player',
    nullable: true
  })
  isTeamPlayer: boolean;

  @Column({
    name: 'is_star_player',
    nullable: true
  })
  isStarPlayer: boolean;

  @Column({
    name: 'brawler_power',
    type: 'tinyint'
  })
  brawlerPower: number;

  @Column({
    name: 'brawler_trophies',
    type: 'smallint'
  })
  brawlerTrophies: number;

  @ManyToOne(() => Users, (user) => user.userBattles)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Users;

  @ManyToOne(() => Brawlers, (brawler) => brawler.userBattles)
  @JoinColumn({ name: 'brawler_id', referencedColumnName: 'id' })
  brawler: Brawlers;
}
