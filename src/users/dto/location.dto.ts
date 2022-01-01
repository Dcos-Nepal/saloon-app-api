import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator'

export class LocationDto {
  @IsEnum({ Point: 'Point' })
  @IsOptional()
  type: string

  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMaxSize(2)
  @ArrayMinSize(2)
  coordinates: number[]
}
