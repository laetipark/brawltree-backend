import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '~/database/entities/base.entity';
import { GameMapRotation } from './map-rotation.entity';
import { UserBrawlerBattles } from '~/users/entities/user-brawlers.entity';

@Entity({ name: 'game_maps' })
export class GameMaps extends BaseEntity {
  @PrimaryColumn({
    length: 8,
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 12,
  })
  mode: string;

  @Column({
    type: 'varchar',
    length: 30,
  })
  name: string;

  @OneToOne(() => GameMapRotation, (mapRotation) => mapRotation.map)
  mapRotation: GameMapRotation;

  @OneToMany(
    () => UserBrawlerBattles,
    (userBrawlerBattle) => userBrawlerBattle.map,
  )
  userBrawlerBattles: UserBrawlerBattles[];
}
