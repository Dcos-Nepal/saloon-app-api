import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { AWSError } from 'aws-sdk';
import { DeleteObjectOutput } from 'aws-sdk/clients/s3';
import { PromiseResult } from 'aws-sdk/lib/request';
import { ConfigService } from 'src/configs/config.service';
import { v4 as uuid } from 'uuid';
import { AWSLib } from '../aws/aws';
import { InjectAWS } from '../aws/aws.decorator';

@Injectable()
export class PublicFilesService {
  private logger: Logger = new Logger('PublicFilesService');
  constructor(@InjectAWS() private readonly aws: AWSLib, private readonly configService: ConfigService) {}

  /**
   * Uploads file to the AWS S3 Bucket
   *
   * @param dataBuffer Buffer
   * @param filename string
   * @param isPrivate boolean
   * @returns Object
   */
  async uploadFileToS3(dataBuffer: Buffer, filename: string, isPrivate: false) {
    let uploadResult = null;

    try {
      this.logger.log('Uploading file to the AWS S3 public bucket');
      uploadResult = await this.aws.s3
        .upload({
          Bucket: isPrivate ? this.configService.getAWSConfig().AWS_PRIVATE_BUCKET : this.configService.getAWSConfig().AWS_PUBLIC_BUCKET,
          Body: dataBuffer,
          Key: `${uuid()}-${filename}`
        })
        .promise();
    } catch (error) {
      throw new InternalServerErrorException('Error while uploading the file to public AWS S3 Bucket');
    }

    this.logger.log('Uploaded file to the AWS S3 public bucket');
    return uploadResult;
  }

  /**
   * Generated presigned URL for the given object in private s3 bucket
   *
   * @param key String
   * @returns String
   */
  public generatePresignedUrl(key: string) {
    const s3 = this.aws.s3;

    return s3.getSignedUrlPromise('getObject', {
      Bucket: this.configService.getAWSConfig().AWS_PRIVATE_BUCKET,
      Key: key
    });
  }

  /**
   * Deletes File from AWS S3 Bucket using the given key
   *
   * @param key String
   * @param isPrivate String
   * @returns Boolean
   */
  async deleteFileFromS3(key: string, isPrivate = false) {
    let isDeleted: PromiseResult<DeleteObjectOutput, AWSError>;

    try {
      this.logger.log('Deleting file from the AWS S3 public bucket');
      isDeleted = await this.aws.s3
        .deleteObject({
          Bucket: isPrivate ? this.configService.getAWSConfig().AWS_PRIVATE_BUCKET : this.configService.getAWSConfig().AWS_PUBLIC_BUCKET,
          Key: key
        })
        .promise();
    } catch (error) {
      throw new InternalServerErrorException('Error while deleting the file to public AWS S3 Bucket');
    }

    this.logger.log('Deleted file from the AWS S3 public bucket');
    return isDeleted;
  }
}
