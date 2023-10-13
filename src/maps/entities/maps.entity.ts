import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  Relation,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '~/database/entities/base.entity';
import { Events } from './events.entity';
import { UserBrawlerBattles } from '~/users/entities/user-brawlers.entity';

abstract class Common extends BaseEntity {
  @PrimaryColumn({
    name: 'MAP_ID',
    length: 8,
  })
  mapID: string;
}

@Entity({ name: 'MAPS' })
export class Maps extends Common {
  @Column({
    name: 'MAP_MD',
    type: 'varchar',
    length: 12,
  })
  mode: string;

  @Column({
    name: 'MAP_NM',
    type: 'varchar',
    length: 30,
  })
  name: string;

  @OneToOne(() => MapRotation)
  @JoinColumn({ name: 'MAP_ID' })
  mapRotation: Relation<MapRotation>;

  @OneToMany(
    () => UserBrawlerBattles,
    (userBrawlerBattle) => userBrawlerBattle.map,
  )
  userBrawlerBattles: Relation<UserBrawlerBattles[]>;
}

@Entity({ name: 'MAP_ROTATION' })
export class MapRotation {
  @PrimaryColumn({
    name: 'MAP_ID',
    length: 8,
  })
  mapID: string;

  @Column({
    name: 'ROTATION_TL_BOOL',
  })
  isTrophyLeague: boolean;

  @Column({
    name: 'ROTATION_PL_BOOL',
  })
  isPowerLeague: boolean;

  @OneToOne(() => Maps)
  @JoinColumn({ name: 'MAP_ID' })
  map: Relation<Maps>;

  @OneToMany(() => Events, (event) => event.mapRotation)
  events: Relation<Events[]>;
}
