import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn
} from 'typeorm';
import { GameMaps } from '~/maps/entities/maps.entity';
import { GameEvents } from './events.entity';

@Entity({ name: 'game_map_rotation' })
export class GameMapRotation {
  @PrimaryColumn({
    name: 'map_id',
    length: 8
  })
  mapID: string;

  @Column({
    name: 'is_trophy_league'
  })
  isTrophyLeague: boolean;

  @Column({
    name: 'is_power_league'
  })
  isPowerLeague: boolean;

  @OneToOne(() => GameMaps)
  @JoinColumn({ name: 'map_id', referencedColumnName: 'id' })
  map: GameMaps;

  @OneToMany(() => GameEvents, (event) => event.mapRotation)
  events: GameEvents[];
}
