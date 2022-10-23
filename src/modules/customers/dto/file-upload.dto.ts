import { IsString } from 'class-validator';
import { PhotoType } from '../schemas/customer.schema';

export class FileUploadDto {
    @IsString()
    caption: string;
  
    @IsString()
    type: PhotoType;
}  