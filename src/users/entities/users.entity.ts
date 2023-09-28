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
import { UserFriends, UserRecords } from '../../blossom/blossom.entity';
import { UserBrawlers } from './userBrawlers.entity';
import { Brawlers } from '../../brawlers/entities/brawlers.entity';

abstract class Common {
  @PrimaryColumn()
  USER_ID: string;
}

@Entity({ name: 'USERS' })
export class Users extends Common {
  @Column()
  USER_LST_CK: Date;

  @Column()
  USER_LST_BT: Date;

  @Column()
  USER_CR: string;

  @Column()
  USER_CR_NM: string;

  @Column()
  CYCLE_NO: number;

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

  /*@CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
                            USER_C_AT: Date;
                        
                            @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
                            USER_U_AT: Date;
                        
                            @DeleteDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
                            USER_D_AT: Date;
                        
                            @BeforeInsert()
                            insertCreated() {
                                this.USER_C_AT = new Date(
                                    moment().format("YYYY-MM-DD HH:mm:ss")
                                );
                                this.USER_U_AT = new Date(
                                    moment().format("YYYY-MM-DD HH:mm:ss")
                                );
                            }
                        
                            @BeforeUpdate()
                            insertUpdated() {
                                this.USER_U_AT = new Date(
                                    moment().format("YYYY-MM-DD HH:mm:ss")
                                );
                            }*/
}

@Entity({ name: 'USER_PROFILE' })
export class UserProfile extends Common {
  @Column()
  USER_NM: string;

  @Column()
  USER_PRFL: string;

  @Column()
  CLUB_ID: string;

  @Column()
  CLUB_NM: string;

  @Column()
  TROPHY_CUR: number;

  @Column()
  TROPHY_HGH: number;

  @Column()
  VICTORY_TRP: number;

  @Column()
  VICTORY_DUO: number;

  @Column()
  BRAWLER_RNK_25: number;

  @Column()
  BRAWLER_RNK_30: number;

  @Column()
  BRAWLER_RNK_35: number;

  @Column()
  PL_SL_CUR: number;

  @Column()
  PL_SL_HGH: number;

  @Column()
  PL_TM_CUR: number;

  @Column()
  PL_TM_HGH: number;

  @OneToOne(() => Users)
  @JoinColumn({ name: 'USER_ID' })
  users: Relation<Users>;
}

@Entity({ name: 'USER_BATTLES' })
export class UserBattles extends Common {
  @PrimaryColumn()
  PLAYER_ID: string;

  @PrimaryColumn()
  BRAWLER_ID: string;

  @PrimaryColumn()
  MATCH_DT: Date;

  @Column()
  MAP_ID: string;

  @Column()
  MAP_MD_CD: number;

  @Column()
  MATCH_TYP: number;

  @Column()
  MATCH_TYP_RAW: number;

  @Column()
  MATCH_GRD: number;

  @Column()
  MATCH_DUR: number;

  @Column()
  MATCH_RNK: number;

  @Column()
  MATCH_RES: number;

  @Column()
  MATCH_CHG: number;

  @Column()
  MATCH_CHG_RAW: number;

  @Column()
  PLAYER_NM: string;

  @Column()
  PLAYER_TM_NO: number;

  @Column()
  PLAYER_SP_BOOL: boolean;

  @Column()
  BRAWLER_PWR: number;

  @Column()
  BRAWLER_TRP: number;

  @ManyToOne(() => Users, (user) => user.userBattles)
  @JoinColumn({ name: 'USER_ID', referencedColumnName: 'USER_ID' })
  user: Relation<Users>;

  @ManyToOne(() => Brawlers, (brawler) => brawler.userBattles)
  @JoinColumn({ name: 'BRAWLER_ID', referencedColumnName: 'BRAWLER_ID' })
  brawler: Relation<Brawlers>;
}
