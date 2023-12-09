import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Maps } from '~/maps/entities/maps.entity';
import { Events } from './events.entity';

@Entity({ name: 'map_rotation' })
export class MapRotation {
  @PrimaryColumn({
    name: 'map_id',
    length: 8,
  })
  mapID: string;

  @Column({
    name: 'is_trophy_league',
  })
  isTrophyLeague: boolean;

  @Column({
    name: 'is_power_league',
  })
  isPowerLeague: boolean;

  @OneToOne(() => Maps)
  @JoinColumn({ name: 'map_id', referencedColumnName: 'id' })
  map: Maps;

  @OneToMany(() => Events, (event) => event.mapRotation)
  events: Events[];
}
