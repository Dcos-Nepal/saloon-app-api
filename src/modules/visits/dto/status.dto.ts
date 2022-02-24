import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { VisitStatusType } from 'src/modules/visits/interfaces/visit.interface';

export class Status {
  @IsMongoId()
  @IsOptional()
  updatedBy: string;

  @IsOptional()
  updatedAt: Date;

  @IsEnum(VisitStatusType)
  status: VisitStatusType;
}
