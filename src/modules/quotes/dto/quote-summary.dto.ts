import { IsMongoId, IsOptional } from 'class-validator';

export class QuoteSummaryDto {
  @IsMongoId()
  @IsOptional()
  quoteFor?: string;

  @IsMongoId()
  @IsOptional()
  createdBy?: string;
}
