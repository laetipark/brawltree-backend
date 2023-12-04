import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'SEASONS' })
export class Seasons {
  @PrimaryColumn({
    type: 'tinyint',
    unsigned: true,
  })
  id: number;

  @Column({
    name: 'begin_date',
    type: 'timestamp',
  })
  beginDate: Date;

  @Column({
    name: 'end_date',
    type: 'timestamp',
  })
  endDate: Date;
}
