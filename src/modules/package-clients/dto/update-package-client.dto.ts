import { PartialType } from '@nestjs/mapped-types';
import { CreatePackageClientDto } from './create-package-client.dto';

export class UpdatePackageClientDto extends PartialType(CreatePackageClientDto) {}
