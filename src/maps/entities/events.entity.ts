import {
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Relation,
  JoinColumn,
} from 'typeorm';
import { MapRotation } from './maps.entity';

@Entity({ name: 'EVENTS' })
export class Events {
  @PrimaryGeneratedColumn()
  ROTATION_SLT_NO: number;

  @PrimaryColumn()
  ROTATION_BGN_DT: Date;

  @Column()
  ROTATION_END_DT: Date;

  @Column()
  MAP_ID: string;

  @Column()
  MAP_MDFS: string;

  @ManyToOne(() => MapRotation, (mapRotation) => mapRotation.events)
  @JoinColumn({ name: 'MAP_ID', referencedColumnName: 'MAP_ID' })
  mapRotation: Relation<MapRotation>;
}
