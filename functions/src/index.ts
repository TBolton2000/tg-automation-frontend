import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
admin.initializeApp();

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

export const createNewUserInFirestore = functions.auth.user().onCreate((user)=>{
  db.doc("/users/"+ user.uid).set({
    name: user.displayName,
    team: null
  })
})