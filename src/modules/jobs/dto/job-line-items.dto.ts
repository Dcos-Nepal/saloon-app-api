import { IsNumber, IsOptional, IsString } from 'class-validator';

export class JobLineItem {
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
