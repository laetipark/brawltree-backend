import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '~/database/entities/base.entity';

@Entity({ name: 'game_modes' })
export class GameModes extends BaseEntity {
  @PrimaryColumn({
    name: 'mode_name',
    type: 'varchar',
    length: 30,
  })
  modeName: string;

  @Column({
    name: 'mode_type',
    type: 'tinyint',
  })
  modeType: number;
}
