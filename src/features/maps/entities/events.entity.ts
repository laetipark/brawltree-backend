import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Maps } from '~/maps/entities/maps.entity';

@Entity({ name: 'events' })
export class Events {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'tinyint',
    unsigned: true,
  })
  id: number;

  @PrimaryColumn({
    name: 'start_time',
  })
  startTime: Date;

  @Column({
    name: 'end_time',
  })
  endTime: Date;

  @Column({
    name: 'map_id',
    length: 8,
  })
  mapID: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  modifiers: string;

  @ManyToOne(() => Maps, (map) => map.events)
  @JoinColumn({ name: 'map_id', referencedColumnName: 'id' })
  map: Maps;
}
