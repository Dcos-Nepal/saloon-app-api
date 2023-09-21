import { Exclude } from 'class-transformer';
import { IsArray, IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';
import { OrderProduct, OrderStatus } from '../interfaces/order.interface';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  customer?: string;

  @IsString()
  @IsOptional()
  orderDate?: string;

  @IsArray()
  @IsOptional()
  products?: OrderProduct[];

  @IsOptional()
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @Exclude()
  @IsMongoId()
  @IsOptional()
  shopId?: string;
}

export class OrderQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  minDate?: string;

  @IsOptional()
  maxDate?: string;
}
