import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Users } from '~/users/entities/users.entity';
import { BaseEntity } from '~/database/entities/base.entity';

abstract class Common extends BaseEntity {
  @PrimaryColumn({
    name: 'user_id',
    type: 'varchar',
    length: 20
  })
  userID: string;

  @PrimaryColumn({
    name: 'match_type',
    type: 'tinyint'
  })
  matchType: number;

  @PrimaryColumn({
    name: 'match_grade',
    type: 'tinyint'
  })
  matchGrade: number;

  @PrimaryColumn({
    name: 'mode_name',
    type: 'varchar',
    length: 20
  })
  mode: string;

  @ManyToOne(() => Users, (user) => user.userRecords)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Users;
}

@Entity({ name: 'user_records' })
export class UserRecords extends Common {
  @Column({
    name: 'trophy_change',
    type: 'int',
    default: () => 0
  })
  trophyChange: number;

  @Column({
    name: 'match_count',
    type: 'int',
    unsigned: true,
    default: () => 0
  })
  matchCount: number;

  @Column({
    name: 'victories_count',
    type: 'int',
    unsigned: true,
    default: () => 0
  })
  victoriesCount: number;

  @Column({
    name: 'defeats_count',
    type: 'int',
    unsigned: true,
    default: () => 0
  })
  defeatsCount: number;
}

@Entity({ name: 'user_friends' })
export class UserFriends extends Common {
  @PrimaryColumn({
    name: 'friend_id',
    type: 'varchar',
    length: 12
  })
  friendID: string;

  @Column({
    name: 'friend_name',
    type: 'varchar',
    length: 30
  })
  friendName: string;

  @Column({
    name: 'match_count',
    type: 'int',
    unsigned: true,
    default: () => 0
  })
  matchCount: number;

  @Column({
    name: 'victories_count',
    type: 'int',
    unsigned: true,
    default: () => 0
  })
  victoriesCount: number;

  @Column({
    name: 'defeats_count',
    type: 'int',
    unsigned: true,
    default: () => 0
  })
  defeatsCount: number;

  @Column({
    name: 'friend_point',
    type: 'float',
    default: () => 0
  })
  friendPoints: number;
}
