import { IsEnum } from 'class-validator';
import { IQuoteStatusType } from '../interfaces/quote.interface';

export class UpdateQuoteStatusDto {
  @IsEnum(IQuoteStatusType)
  status: IQuoteStatusType;
}