import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GameModes } from '~/maps/entities/modes.entity';

@Injectable()
export class ModesService {
  constructor(
    @InjectRepository(GameModes)
    private readonly gameModes: Repository<GameModes>
  ) {}

  /** 모드 리스트 반환 */
  async selectModeList() {
    return (
      await this.gameModes
        .createQueryBuilder('modes')
        .select('modes.modeName', 'modeName')
        .getRawMany()
    ).map((mode) => mode.modeName);
  }
}
