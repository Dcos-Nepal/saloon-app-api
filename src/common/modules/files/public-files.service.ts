import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from 'src/configs/config.service';
import { v4 as uuid } from 'uuid';
import { AWSLib } from '../aws/aws';
import { InjectAWS } from '../aws/aws.decorator';

@Injectable()
export class PublicFilesService {
  private logger: Logger = new Logger('PublicFilesService');
  constructor(@InjectAWS() private readonly aws: AWSLib, private readonly configService: ConfigService) {}

  /**
   * Uploads file to the AWS S3 Public Bucket
   *
   * @param dataBuffer Buffer
   * @param filename string
   * @returns Object
   */
  async uploadPublicFile(dataBuffer: Buffer, filename: string) {
    this.logger.log('Uploading file to the AWS S3 public bucket');
    const uploadResult = await this.aws.s3
      .upload({
        Bucket: this.configService.getAWSConfig().AWS_PUBLIC_BUCKET,
        Body: dataBuffer,
        Key: `${uuid()}-${filename}`
      })
      .promise();

    this.logger.log('Uploaded file to the AWS S3 public bucket');
    return uploadResult;
  }

  /**
   * Deletes File from AWS S3 Bucket using the given key
   *
   * @param key String
   * @returns Boolean
   */
  async deletePublicFile(key: string) {
    this.logger.log('Deleting file from the AWS S3 public bucket');
    const isDeleted = await this.aws.s3
      .deleteObject({
        Bucket: this.configService.getAWSConfig().AWS_PUBLIC_BUCKET,
        Key: key
      })
      .promise();

    this.logger.log('Deleted file from the AWS S3 public bucket');
    return isDeleted;
  }
}
