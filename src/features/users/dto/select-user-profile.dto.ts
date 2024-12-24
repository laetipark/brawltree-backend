import { IsNumber, IsString } from 'class-validator';

export class SelectUserProfileDto {
  @IsString()
  userID: string;

  @IsString()
  name: string;

  @IsString()
  profileIcon: string;

  @IsString()
  clubID: string;

  @IsString()
  clubName: string;

  @IsNumber()
  currentTrophies: number;

  @IsNumber()
  highestTrophies: number;

  @IsNumber()
  trophyChange: number;

  @IsNumber()
  trioMatchVictories: number;

  @IsNumber()
  duoMatchVictories: number;

  @IsNumber()
  soloMatchVictories: number;

  // @IsNumber()
  // brawlerRank25: number;
  //
  // @IsNumber()
  // brawlerRank30: number;

  @IsNumber()
  brawlerRank50: number;

  @IsNumber()
  currentSoloRanked: number;

  @IsNumber()
  highestSoloRanked: number;

  // @IsNumber()
  // currentTeamPL: number;

  // @IsNumber()
  // highestTeamPL: number;
}
