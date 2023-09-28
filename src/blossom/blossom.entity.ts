import {
  Entity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn, Relation,
} from 'typeorm';
import { Users } from '../users/entities/users.entity';

abstract class Common {
  @PrimaryGeneratedColumn()
  USER_ID: string;

  @PrimaryColumn()
  MATCH_TYP: number;

  @PrimaryColumn()
  MATCH_GRD: number;

  @PrimaryColumn()
  MAP_MD: string;
}

@Entity({ name: 'USER_RECORDS' })
export class UserRecords extends Common {
  @Column()
  MATCH_CHG: number;

  @Column()
  MATCH_CNT: number;

  @Column()
  MATCH_CNT_VIC: number;

  @Column()
  MATCH_CNT_DEF: number;

  @ManyToOne(() => Users, (user) => user.userRecords)
  @JoinColumn({ name: 'USER_ID', referencedColumnName: 'USER_ID' })
  user: Users;
}

@Entity({ name: 'USER_FRIENDS' })
export class UserFriends extends Common {
  @PrimaryColumn()
  FRIEND_ID: string;

  @Column()
  FRIEND_NM: string;

  @Column()
  MATCH_CHG: number;

  @Column()
  MATCH_CNT: number;

  @Column()
  MATCH_CNT_VIC: number;

  @Column()
  MATCH_CNT_DEF: number;

  @Column()
  FRIEND_PT: number;

  @ManyToOne(() => Users, (user) => user.userFriends)
  @JoinColumn({ name: 'USER_ID', referencedColumnName: 'USER_ID' })
  user: Relation<Users>;
}
