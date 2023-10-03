import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  Relation,
  JoinColumn,
} from 'typeorm';
import { Events } from './events.entity';
import { UserBrawlerBattles } from '~/users/entities/userBrawlers.entity';

abstract class Common {
  @PrimaryColumn()
  MAP_ID: string;
}

@Entity({ name: 'MAPS' })
export class Maps extends Common {
  @Column()
  MAP_MD: string;

  @Column()
  MAP_NM: string;

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
export class MapRotation extends Common {
  @Column()
  ROTATION_TL_BOOL: boolean;

  @Column()
  ROTATION_PL_BOOL: boolean;

  @OneToOne(() => Maps)
  @JoinColumn({ name: 'MAP_ID' })
  map: Relation<Maps>;

  @OneToMany(() => Events, (event) => event.mapRotation)
  events: Relation<Events[]>;
}
