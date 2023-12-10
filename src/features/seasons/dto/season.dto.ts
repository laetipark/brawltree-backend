import { IsDateString } from 'class-validator';

export class SeasonDto {
  @IsDateString()
  beginDate: Date;

  @IsDateString()
  endDate: Date;
}