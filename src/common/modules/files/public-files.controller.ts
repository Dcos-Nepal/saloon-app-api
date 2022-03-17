import { Controller, Delete, Logger, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/common/decorators/current-user';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { PublicFilesService } from './public-files.service';

@Controller({
  path: '/files',
  version: '1.0.0'
})
@UseGuards(AuthGuard('jwt'))
export class FilesController {
  private logger: Logger = new Logger('UsersService');

  constructor(private readonly publicFilesService: PublicFilesService) {}

  @Post('/public')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPublicFile(@CurrentUser() authUser, @UploadedFile() file: Express.Multer.File) {
    if (!authUser?._id) {
      return new ResponseError('Unauthorized access denied.');
    }

    if (!file) {
      return new BadRequestException('Invalid file data provided');
    }

    this.logger.log('Uploading public file to AWS S3');
    const uploadedFile = await this.publicFilesService.uploadFileToS3(file.buffer, file.originalname, false);

    if (!uploadedFile) {
      return new ResponseError('Error uploading the public file to AWS S3');
    }

    this.logger.log('Public file upload complete');
    return new ResponseSuccess('Public file uploaded successfully!', {
      key: uploadedFile.Key,
      url: uploadedFile.Location
    });
  }

  @Delete('/public/:key')
  @UseInterceptors(FileInterceptor('file'))
  async deletePublicFile(@CurrentUser() authUser, @Param() key: string) {
    if (!authUser?._id) {
      return new ResponseError('Unauthorized access denied.');
    }

    if (!key) {
      return new BadRequestException('Invalid S3 bucket item key provided.');
    }

    this.logger.log('Deleting public file from AWS S3');
    const isDeleted = await this.publicFilesService.deleteFileFromS3(key, false);

    if (!isDeleted) {
      return new ResponseError('Error deleting the public file from AWS S3');
    }

    this.logger.log('Public file delete complete');
    return new ResponseSuccess('Public file deleted successfully!', isDeleted);
  }
}
