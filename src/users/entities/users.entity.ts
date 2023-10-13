import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';
import { SoftDeleteEntity } from '~/database/entities/base.entity';
import { UserBrawlers } from './user-brawlers.entity';
import { UserFriends, UserRecords } from '~/blossom/entities/blossom.entity';
import { Brawlers } from '~/brawlers/entities/brawlers.entity';
import { CreateUsersDto } from '~/users/dto/create-users.dto';

abstract class Common extends SoftDeleteEntity {
  @PrimaryColumn({
    name: 'USER_ID',
    type: 'varchar',
    length: 12,
  })
  userID: string;
}

@Entity({ name: 'USERS' })
export class Users extends Common {
  @Column({
    name: 'USER_LST_BT',
  })
  lastBattleAt: Date;

  @Column({
    name: 'USER_CR',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  crew: string;

  @Column({
    name: 'USER_CR_NM',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  crewName: string;

  @Column({
    name: 'CYCLE_NO',
    type: 'tinyint',
    nullable: true,
  })
  cycleNumber: number;

  @OneToOne(() => UserProfile)
  @JoinColumn({ name: 'USER_ID' })
  userProfile: Relation<UserProfile>;

  @OneToMany(() => UserBattles, (battle) => battle.user)
  userBattles: Relation<UserBattles[]>;

  @OneToMany(() => UserBrawlers, (brawler) => brawler.user)
  userBrawlers: Relation<UserBrawlers[]>;

  @OneToMany(() => UserRecords, (record) => record.user)
  userRecords: Relation<UserRecords[]>;

  @OneToMany(() => UserFriends, (friend) => friend.user)
  userFriends: Relation<UserFriends[]>;

  static from(createUsersDto: CreateUsersDto) {
    const user = new CreateUsersDto();
    user.userID = createUsersDto.userID;
    user.lastBattleAt = createUsersDto.lastBattleAt;
    user.crew = createUsersDto.crew;
    user.crewName = createUsersDto.crewName;

    return user;
  }
}

@Entity({ name: 'USER_PROFILE' })
export class UserProfile extends Common {
  @Column({
    name: 'USER_NM',
    type: 'varchar',
    length: 30,
  })
  name: string;

  @Column({
    name: 'USER_PRFL',
    length: 8,
  })
  profile: string;

  @Column({
    name: 'CLUB_ID',
    type: 'varchar',
    length: 12,
    nullable: true,
  })
  clubID: string;

  @Column({
    name: 'CLUB_NM',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  clubName: string;

  @Column({
    name: 'TROPHY_CUR',
    type: 'int',
    unsigned: true,
  })
  currentTrophies: number;

  @Column({
    name: 'TROPHY_HGH',
    type: 'int',
    unsigned: true,
  })
  highestTrophies: number;

  @Column({
    name: 'VICTORY_TRP',
    type: 'int',
    unsigned: true,
  })
  tripleVictories: number;

  @Column({
    name: 'VICTORY_DUO',
    type: 'int',
    unsigned: true,
  })
  duoVictories: number;

  @Column({
    name: 'BRAWLER_RNK_25',
    type: 'smallint',
    unsigned: true,
    default: () => 0,
  })
  rank25Brawlers: number;

  @Column({
    name: 'BRAWLER_RNK_30',
    type: 'smallint',
    unsigned: true,
    default: () => 0,
  })
  rank30Brawlers: number;

  @Column({
    name: 'BRAWLER_RNK_35',
    type: 'smallint',
    unsigned: true,
    default: () => 0,
  })
  rank35Brawlers: number;

  @Column({
    name: 'PL_SL_CUR',
    type: 'tinyint',
    unsigned: true,
    default: () => 0,
  })
  currentSoloPL: number;

  @Column({
    name: 'PL_SL_HGH',
    type: 'tinyint',
    unsigned: true,
    default: () => 0,
  })
  highestSoloPL: number;

  @Column({
    name: 'PL_TM_CUR',
    type: 'tinyint',
    unsigned: true,
    default: () => 0,
  })
  currentTeamPL: number;

  @Column({
    name: 'PL_TM_HGH',
    type: 'tinyint',
    unsigned: true,
    default: () => 0,
  })
  highestTeamPL: number;

  @OneToOne(() => Users)
  @JoinColumn({ name: 'USER_ID' })
  users: Relation<Users>;
}

@Entity({ name: 'USER_BATTLES' })
export class UserBattles extends Common {
  @PrimaryColumn({
    name: 'PLAYER_ID',
    type: 'varchar',
    length: 12,
  })
  playerID: string;

  @PrimaryColumn({
    name: 'BRAWLER_ID',
    length: 8,
  })
  brawlerID: string;

  @PrimaryColumn({
    name: 'MATCH_DT',
  })
  matchDate: Date;

  @Column({
    name: 'MAP_ID',
    length: 8,
  })
  mapID: string;

  @Column({
    name: 'MAP_MD_CD',
    type: 'tinyint',
  })
  modeCode: number;

  @Column({
    name: 'MATCH_TYP',
    type: 'tinyint',
  })
  matchType: number;

  @Column({
    name: 'MATCH_TYP_RAW',
    type: 'tinyint',
  })
  matchTypeRaw: number;

  @Column({
    name: 'MATCH_GRD',
    type: 'tinyint',
  })
  matchGrade: number;

  @Column({
    name: 'MATCH_DUR',
    type: 'tinyint',
    unsigned: true,
    nullable: true,
  })
  duration: number;

  @Column({
    name: 'MATCH_RNK',
    type: 'tinyint',
  })
  matchRank: number;

  @Column({
    name: 'MATCH_RES',
    type: 'tinyint',
  })
  matchResult: number;

  @Column({
    name: 'MATCH_CHG',
    type: 'tinyint',
  })
  matchChange: number;

  @Column({
    name: 'MATCH_CHG_RAW',
    type: 'tinyint',
  })
  matchChangeRaw: number;

  @Column({
    name: 'PLAYER_NM',
    type: 'varchar',
    length: 30,
  })
  playerName: string;

  @Column({
    name: 'PLAYER_TM_NO',
    type: 'tinyint',
  })
  teamNumber: number;

  @Column({
    name: 'PLAYER_SP_BOOL',
    nullable: true,
  })
  isStarPlayer: boolean;

  @Column({
    name: 'BRAWLER_PWR',
    type: 'tinyint',
  })
  brawlerPower: number;

  @Column({
    name: 'BRAWLER_TRP',
    type: 'smallint',
  })
  brawlerTrophies: number;

  @ManyToOne(() => Users, (user) => user.userBattles)
  @JoinColumn({ name: 'USER_ID', referencedColumnName: 'userID' })
  user: Relation<Users>;

  @ManyToOne(() => Brawlers, (brawler) => brawler.userBattles)
  @JoinColumn({ name: 'BRAWLER_ID', referencedColumnName: 'brawlerID' })
  brawler: Relation<Brawlers>;
}
