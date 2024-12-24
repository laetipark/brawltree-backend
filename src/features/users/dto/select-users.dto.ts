import { IsDateString, IsNumber, IsString } from 'class-validator';

export class SelectUsersDto {
  @IsString()
  userID!: string;

  @IsString()
  userName!: string;

  @IsString()
  profileIcon!: string;

  @IsString()
  clubName!: string;

  @IsNumber()
  currentTrophies!: number;

  @IsNumber()
  currentSoloRanked!: number;

  // @IsNumber()
  // currentTeamRanked!: number;
}

export class SelectUserDto {
  @IsString()
  userID!: string;

  @IsDateString()
  lastBattledOn!: Date;

  @IsString()
  crew!: string;

  @IsString()
  crewName!: string;

  @IsDateString()
  updatedAt!: Date;

  @IsString()
  userName!: string;

  @IsString()
  profileIcon!: string;
}
