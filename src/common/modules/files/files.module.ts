import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PublicFilesService } from './public-files.service';

@Module({
  imports: [ConfigModule],
  providers: [PublicFilesService],
  exports: [PublicFilesService]
})
export class FilesModule {}
