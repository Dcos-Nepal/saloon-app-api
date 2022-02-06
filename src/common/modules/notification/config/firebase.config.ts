import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { ConfigService } from 'src/configs/config.service';

// Set the config options
const config = new ConfigService();
const adminConfig: ServiceAccount = config.getFirebaseConfig();

admin.initializeApp({
  credential: admin.credential.cert(adminConfig)
});

// Initializing Firebase FCM Messaging
const fcm = admin.messaging();

export { fcm };
