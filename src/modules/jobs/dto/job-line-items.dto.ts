import { IsNumber, IsOptional, IsString } from 'class-validator';

export class JobLineItem {
  @IsOptional()
  @IsString()
  ref: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
}
