import { IsArray, IsOptional, IsString } from 'class-validator';

export class CompleteJobDto {
  @IsString()
  note: string;

  @IsString()
  @IsOptional()
  @IsArray()
  docs?: [
    {
      key: string;
      url: string;
    }
  ];

  @IsString()
  completedBy: string;

  @IsString()
  date: Date;
}
