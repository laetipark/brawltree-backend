import { IsBoolean, IsDateString, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SelectUserBattlesSummaryDto {
  @IsString()
  day: string;

  @IsNumber()
  @Type(() => Number)
  value: number;
}

export class SelectUserBattleLogsDto {
  recentUserBattles: SelectRecentUserBattlesDto[];
  userBrawlerBattles: SelectUserBrawlerBattlesDto[];
  userBattleLogs: SelectUserBattlesDto[];
}

export class SelectRecentUserBattlesDto {
  @IsString()
  battleTime: string;

  @IsNumber()
  duration: number;

  @IsString()
  brawlerID: string;

  @IsNumber()
  gameResult: number;

  @IsString()
  mapID: string;

  @IsBoolean()
  isStarPlayer: boolean;

  @IsString()
  mode: string;

  @IsString()
  mapName: string;

  @IsString()
  brawlerName: string;

  @IsString()
  role: string;
}

export class SelectUserBrawlerBattlesDto {
  @IsString()
  brawlerName: string;

  @IsNumber()
  matchCount: number;

  @IsNumber()
  resultCount: number;

  @IsString()
  brawlerID: string;
}

export class SelectUserBattlesDto {
  battleInfo!: SelectUserBattleInfoDto;
  battlePlayers!: SelectUserBattlePlayersDto[];
}

export class SelectUserBattleInfoDto {
  @IsString()
  userID!: string;

  @IsDateString()
  battleTime!: Date;

  @IsNumber()
  duration!: number;

  @IsNumber()
  matchType!: number;

  @IsNumber()
  modeCode!: number;

  @IsNumber()
  matchGrade!: number;

  @IsNumber()
  trophyChange!: number;
}

export class SelectUserBattlePlayersDto {
  @IsString()
  playerID!: string;

  @IsString()
  playerName!: string;

  @IsNumber()
  teamNumber!: number;

  @IsString()
  brawlerID!: string;

  @IsNumber()
  brawlerPower!: number;

  @IsNumber()
  brawlerTrophies!: number;

  @IsNumber()
  gameRank!: number;

  @IsNumber()
  gameResult!: number;

  @IsNumber()
  isStarPlayer!: number;
}
