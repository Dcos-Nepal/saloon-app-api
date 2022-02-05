import * as firebase from 'firebase-admin';
// const serviceAccount = require('./json/firebase.config.json');

// // Get Firebase Admin Configuration from json file
// const config = ConfigFactory.getConfig(obj).init();
// const object = config.toObject();

// console.log(serviceAccount);

firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: 'orange-cleaning-f05c7',
    privateKey:
      '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC0zff8QWyl+Gu9\nri8uzyfWoucM/moBp/AfY3D0r7iK3W2lGVPs/2jhyD/urAfFjm14SHOL8UnBhGDi\nNi36MqEQTnkPI0N3jff1UH+xxBaPj/0zTgR2GYkyc28p63k5YauOY9oDuDvBUiGw\nBmIAo6smDBvcx8TGRqAzzwUZdcDgt34zGWVaWxAWrREt6wyaxP1EmOSDTB1Xu8xQ\nEcAAfxfJ+x4Y8slIWEfLNngyhW1GpnAdhFZRQxZ8zKDyU+3SPXxRfdJqqHbY6DHf\nF7LuTCO3P7H3nFAxMjDR5J7UNJUMRbhmZTg8JIqY2rmZAAnIOe1F/H5V2OXnZEtu\nmaD+K1bTAgMBAAECggEACT+6DlDodmsJU+grqLjXIF8v85W2JYSKP4jON+4fQhdG\nqxnrFaYRHu+n+ZUaRqxdBDislH2Q2NHlRN0hp/lcDOH+xlv28RA1nXpzNcxCnTBv\n8uZsSwBOaOLHznyptFo/NOb9uY/8moyRhZgl/kNhF26qJDah5cSqIExYRe+koLob\n8l44KFulFwW1CokuI2F+/Fcmf43LVctT/O1ABP3SjlZRwM9kVCHblvlXJokhcIdK\nef6uWxES6Op5540HPPx31ZBtIh3ALMgxDvcWmlR/PVMfnmHnL1BdFL26TG1YPohU\nwL/zLFt0hHqvYNFrhSyfMeVNX+ntSIv4sKgqeU/hiQKBgQD8n9fnS1lget9qwDqt\nc14PHW6ukB4P4HLeeSuyDF/3pqdLGn5j44gzpUSeE8qFlwqb59CQderUrff0mmro\n6+lXghhJG/7Q8dUPFHjwyW1v6cBC7FDqbVF+ejkdk7zOg5oDHDgXfe+HHAU5FsT/\n5DUucP2DhVmP7MNO8HFFUf8sKQKBgQC3OHMzkAiP+3/B0s/lPTFfj7sUaXDM7yi4\nrDue+5Qu5tIoDNZu0pFBQI/VUZpqU84mgUmau25nTUsL3mzVjgop7IIoGLj5cGHC\n/BdALxg8KKUfSODBHUrsN065LKQqk3hVaZVUCLm9DLh+56dBIXCnRfjjbncS5eCd\nc6tE16IKmwKBgQCx6rFYCE0uEdt/h1rMBdBcvNHSx1UkwWKlJJmNkAGWnRx9XG9f\nUkP+e4rT+gRMCZBDNQRCeYmlt9BFyOs6l8uDAfCwrLLN3UO8lyKGEpasluf9OgnS\n0KLwfIv1NLNojm7NefZXNS6Y7TcQeeTMg6Cg0Jr7IdNt9cWnttdPhuw74QKBgQCm\n5joypyrVlcDMG7AbX0HBjhlZv67sT5Nlnib1bLCQhNy9dOxEqXV93kTnid1CrDKm\n6rDUzZYFbehF2IiFhE0H4ZSy18pwFopHZwH7Cqtl6ZR4yhdKcteUE9GXZu3ohstf\n6r0HfqdLafIKUBUQhFitV1UgP7kiMtsIMpy6Kj9GrwKBgCJrsD4UuOJVIQX4vEq0\ngxlqHKUB6BxaX4lpg2YYmTwysyXrguHhF/zKHMOqVQb2IGjaPCycW8+QjAhDgsFO\niqrJ8xHzZjsK2m7zH//8J0+gThOsQKxPe08q3y1nj7oagUfsoJk/X0tTlt8yyDZO\nxPrH/NqDKWUX2kgWo+WAC0tQ\n-----END PRIVATE KEY-----\n',
    clientEmail: 'firebase-adminsdk-1zjo9@orange-cleaning-f05c7.iam.gserviceaccount.com'
  })
});

// Initializing Firebase FCM Messaging
const fcm = firebase.messaging();

export { fcm };
