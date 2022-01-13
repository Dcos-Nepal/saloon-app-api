import { IsMongoId, IsNumber, IsString } from 'class-validator';

export class QuoteLineItem {
  @IsString()
  @IsMongoId()
  lineItem: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
}
