import { ConfigService } from 'src/configs/config.service';
import { AWSLib } from './aws';
import { AWS_TOKEN } from './aws.constant';

export const AWSProvider = {
  inject: [ConfigService],
  provide: AWS_TOKEN,
  useFactory: async (configService: ConfigService) => {
    const config = await configService.getAWSConfig();
    const useInstanceRole = configService.get('USE_INSTANCE_ROLE') === 'true';

    return new AWSLib(config, useInstanceRole);
  }
};
