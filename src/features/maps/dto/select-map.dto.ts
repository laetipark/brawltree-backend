import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class SelectMapDto {
  @IsString()
  mapID!: string;

  @IsString()
  mapName!: string;

  @IsString()
  mode!: string;

  @IsBoolean()
  isTrophyLeague!: boolean;

  @IsBoolean()
  isPowerLeague!: boolean;
}

export class SelectMapStatsDto {
  @IsString()
  mapID!: string;

  @IsString()
  brawlerID!: string;

  @IsNumber()
  pickRate!: number;

  @IsNumber()
  victoryRate!: number;

  @IsString()
  brawlerName!: string;
}
