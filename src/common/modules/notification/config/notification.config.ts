import { join } from 'path';
import { ConfigFactory } from 'code-config';

const defaultValue = {
  vapid: {
    subject: '',
    privateKey: '',
    publicKey: ''
  }
};

// Get Notification Configuration from json file
const notificationConfig = ConfigFactory.getConfig(join(__dirname, '/json/', 'notification.config.json'), defaultValue);

notificationConfig.initPrettify();

export { notificationConfig };