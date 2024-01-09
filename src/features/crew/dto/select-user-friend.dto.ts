import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SelectUserFriendDto {
  @IsString()
  friendID!: string;

  @IsString()
  friendName!: string;

  @IsNumber()
  @Type(() => Number)
  matchType!: number;

  @IsNumber()
  @Type(() => Number)
  matchGrade!: number;

  @IsString()
  mode!: string;

  @IsNumber()
  @Type(() => Number)
  matchCount!: number;

  @IsNumber()
  @Type(() => Number)
  victoriesCount!: number;

  @IsNumber()
  @Type(() => Number)
  defeatsCount!: number;

  @IsNumber()
  @Type(() => Number)
  victoryRate!: number;

  @IsNumber()
  @Type(() => Number)
  friendPoints!: number;
}
