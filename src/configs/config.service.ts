import * as dotenv from 'dotenv'

export class ConfigService {
  private readonly envConfig: Record<string, string>

  constructor() {
    const result = dotenv.config()
    this.envConfig = result.error ? process.env : result.parsed
  }

  /**
   * Gets environment variable by its name
   *
   * @param key String
   * @returns Number | String
   */
  get(key: string): any {
    return this.envConfig[key]
  }

  /**
   * Get Mail Configs
   * @returns MailConfig
   */
  public getMailConfig() {
    return {
      MAIL_HOST: this.get('MAIL_HOST'),
      MAIL_PORT: this.get('MAIL_PORT'),
      MAIL_SECURE: this.get('MAIL_SECURE') === 'true' ? true : false,
      MAIL_USER: this.get('MAIL_USER'),
      MAIL_PASS: this.get('MAIL_PASS')
    }
  }

  /**
   * Gets AWS Related Configs (Sync)
   * @returns AWSConfig
   */
  public getSyncAWSConfig() {
    return {
      AWS_ACCESS_KEY_ID: this.get('AWS_ACCESS_KEY_ID'),
      AWS_SECRET_ACCESS_KEY: this.get('AWS_SECRET_ACCESS_KEY'),
      AWS_REGION: this.get('AWS_REGION'),
      AWS_PUBLIC_BUCKET: this.get('AWS_PUBLIC_BUCKET')
    }
  }

  /**
   * Gets MONGO Congifuration
   * @returns MongoConfig
   */
  public getMongoConfig() {
    return {
      uri: this.get('MONGO_URI')
    }
  }
}
