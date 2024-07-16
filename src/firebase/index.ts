import firebase from "firebase-admin";

const serviceAccount = require("./serviceAccountKey.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

const messaging = firebase.messaging();
export { messaging };
