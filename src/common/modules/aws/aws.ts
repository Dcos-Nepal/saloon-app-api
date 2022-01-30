import * as AWS from 'aws-sdk';
import { Logger } from '@nestjs/common';

import { AWSConfig } from './dto/aws.dto';

export class AWSLib {
  public sns: AWS.SNS;
  public ses: AWS.SES;
  public s3: AWS.S3;

  private logger: Logger = new Logger('AWSModule');

  constructor(public readonly config: AWSConfig, useInstanceRole: boolean) {
    if (useInstanceRole) {
      AWS.config.update({
        region: config.AWS_REGION
      });
    } else {
      AWS.config.update({
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
        region: config.AWS_REGION
      });
    }

    // Initialize Services to use form AWS
    this.sns = new AWS.SNS();
    this.ses = new AWS.SES();
    this.s3 = new AWS.S3();

    this.logger.log('AWS Module loaded');
  }
}
