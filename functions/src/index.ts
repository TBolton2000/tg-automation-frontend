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
    name: user.displayName
  })
});

// export const addHiderBotToTeam = functions.firestore.document("/hider_bots/{bot_id}")
// .onWrite((change, context) =>{
//   const data = change.after.data();
//   db.doc(data?.team)
// });

// export const addSeekerBotToTeam = functions.firestore.document("/seeker_bots/{bot_id}")
// .onWrite((change, context) =>{
//   const data = change.after.data();
//   db.doc(data?.team).update({

//   })
// });
