const admin = require("firebase-admin");
const config = require("./config");
const logger = require("./logger");

const serviceAccount = {
  type: "service_account",
  project_id: config.firebase.projectId,
  private_key_id: config.firebase.privateKeyId,
  private_key: config.firebase.privateKey,
  client_email: config.firebase.clientEmail,
  client_id: config.firebase.clientId,
  auth_uri: config.firebase.authUri,
  token_uri: config.firebase.tokenUri,
  auth_provider_x509_cert_url: config.firebase.authProviderX509CertUrl,
  client_x509_cert_url: config.firebase.clientX509CertUrl,
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${config.firebase.projectId}-default-rtdb.firebaseio.com`,
  });

  logger.info("Firebase Admin initialized successfully");
} catch (error) {
  logger.error("Firebase Admin initialization failed:", error);
  throw error;
}

const db = admin.firestore();
const rtdb = admin.database();

module.exports = { admin, db, rtdb };
