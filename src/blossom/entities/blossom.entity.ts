import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { Users } from '~/users/entities/users.entity';
import { BaseEntity } from '~/database/entities/base.entity';

abstract class Common extends BaseEntity {
  @PrimaryColumn({
    name: 'USER_ID',
    type: 'varchar',
    length: 12,
  })
  userID: string;

  @PrimaryColumn({
    name: 'MATCH_TYP',
    type: 'tinyint',
  })
  matchType: number;

  @PrimaryColumn({
    name: 'MATCH_GRD',
    type: 'tinyint',
  })
  matchGrade: number;

  @PrimaryColumn({
    name: 'MAP_MD',
    type: 'varchar',
    length: 12,
  })
  mode: string;
}

@Entity({ name: 'USER_RECORDS' })
export class UserRecords extends Common {
  @Column({
    name: 'MATCH_CHG',
    type: 'int',
  })
  matchChange: number;

  @Column({
    name: 'MATCH_CNT',
    type: 'int',
    unsigned: true,
  })
  matchCount: number;

  @Column({
    name: 'MATCH_CNT_VIC',
    type: 'int',
    unsigned: true,
  })
  victoryCount: number;

  @Column({
    name: 'MATCH_CNT_DEF',
    type: 'int',
    unsigned: true,
  })
  defeatCount: number;

  @ManyToOne(() => Users, (user) => user.userRecords)
  @JoinColumn({ name: 'USER_ID', referencedColumnName: 'userID' })
  user: Users;
}

@Entity({ name: 'USER_FRIENDS' })
export class UserFriends extends Common {
  @PrimaryColumn({
    name: 'FRIEND_ID',
    type: 'varchar',
    length: 12,
  })
  friendID: string;

  @Column({
    name: 'FRIEND_NM',
    type: 'varchar',
    length: 30,
  })
  name: string;

  @Column({
    name: 'MATCH_CNT',
    type: 'int',
    unsigned: true,
  })
  matchCount: number;

  @Column({
    name: 'MATCH_CNT_VIC',
    type: 'int',
    unsigned: true,
  })
  victoryCount: number;

  @Column({
    name: 'MATCH_CNT_DEF',
    type: 'int',
    unsigned: true,
  })
  defeatCount: number;

  @Column({
    name: 'FRIEND_PT',
    type: 'float',
  })
  friendPoints: number;

  @ManyToOne(() => Users, (user) => user.userFriends)
  @JoinColumn({ name: 'USER_ID', referencedColumnName: 'userID' })
  user: Relation<Users>;
}
