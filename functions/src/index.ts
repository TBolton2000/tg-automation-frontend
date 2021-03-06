/* eslint-disable camelcase */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import * as rax from "retry-axios";

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
  });
});

export const cleanUpOnTeamDelete = functions.firestore
    .document("/teams/{team}").onDelete(async (snap, context) =>{
      const data = snap.data();
      const hiderBots = data.hider_bots;
      if (hiderBots) {
        for (let i = 0; i < hiderBots.length; i++) {
          await hiderBots[i].update({
            replaced: true,
          });
        }
      }
      const seekerBots = data.seeker_bots;
      if (seekerBots) {
        for (let i = 0; i < seekerBots.length; i++) {
          await seekerBots[i].update({
            replaced: true,
          });
        }
      }
      const pendingJoins = data.pendingJoins;
      if (pendingJoins) {
        for (let i = 0; i < pendingJoins.length; i++) {
          await pendingJoins[i].update({
            pendingJoin: admin.firestore.FieldValue.delete(),
          });
        }
      }
    });

export const onSeekerReplaced = functions.firestore
    .document("/seeker_bots/{bot}").onUpdate(async (change, context)=>{
      if (change.before.data().replaced == change.after.data().replaced) {
        return;
      }
      // Remove this bot from all matches with active bots
      const allValidBotsSnapshots = await db.collection("/hider_bots")
          .where("replaced", "==", false).get();
      const batch = db.batch();
      for (const snapshot of allValidBotsSnapshots.docs) {
        const data = snapshot.data();
        if (Object.keys(data.matches).includes(change.before.id)) {
          const objForRemove: any = {};
          objForRemove[`matches.${change.before.id}`] =
              admin.firestore.FieldValue.delete();
          batch.update(snapshot.ref, objForRemove);
          functions.logger.info("Removing ",
              change.before.id, " from ", snapshot.id);
        }
      }
      await batch.commit();
      functions.logger.info("Successfully removed.");
    });

export const onHiderReplaced = functions.firestore
    .document("/hider_bots/{bot}").onUpdate(async (change, context)=>{
      if (change.before.data().replaced == change.after.data().replaced) {
        return;
      }
      // Remove this bot from all matches with active bots
      const allValidBotsSnapshots = await db.collection("/seeker_bots")
          .where("replaced", "==", false).get();
      const batch = db.batch();
      for (const snapshot of allValidBotsSnapshots.docs) {
        const data = snapshot.data();
        if (Object.keys(data.matches).includes(change.before.id)) {
          const objForRemove: any = {};
          objForRemove[`matches.${change.before.id}`] =
              admin.firestore.FieldValue.delete();
          batch.update(snapshot.ref, objForRemove);
          functions.logger.info("Removing ",
              change.before.id, " from ", snapshot.id);
        }
      }
      await batch.commit();
      functions.logger.info("Successfully removed.");
    });

// For sending to automation engine
const axiosRetryConfig = {
  raxConfig: {
    retry: 10,
    noResponseRetries: 10,
    onRetryAttempt: (err: any) => {
      const cfg = rax.getConfig(err);
      functions.logger.error(`Retry attempt #${cfg!.currentRetryAttempt}`);
    },
  },
  timeout: 500,
};
export const onSeekerSubmission = functions.firestore
    .document("/seeker_bots/{bot}").onCreate(async (snap, context) =>{
      functions.logger.info("botData:", snap.data());
      const allValidBotsSnapshot = await db.collection("/hider_bots")
          .where("replaced", "==", false)
          .where("timestamp", "<", snap.data().timestamp).get();
      const allValidHiderBots = allValidBotsSnapshot.docs.map((doc)=>{
        return {
          name: doc.id,
          filename: doc.data().file_name,
          link: doc.data().downloadURL,
        };
      });
      const dataToSend = {
        name: snap.id,
        filename: snap.data().file_name,
        type: "seeker",
        link: snap.data().downloadURL,
        opponents: allValidHiderBots,
      };
      functions.logger.info("dataToSend:", dataToSend);
      const env = await db.doc("/config/ENV").get();
      const urls = (env && env.data()) ? env!.data()!.engine_url :
        ["http://ec2-18-191-29-23.us-east-2.compute.amazonaws.com"];
      const url = urls[Math.floor(Math.random() * urls.length)];
      functions.logger.log("url: ", url);
      try {
        const engineResponse =
            await axios.post(url, dataToSend, axiosRetryConfig);
        functions.logger.info("engineResponse:", engineResponse.data);
      } catch (e) {
        functions.logger.error("Axios error:", e);
      }
    });

export const onHiderSubmission = functions.firestore
    .document("/hider_bots/{bot}").onCreate(async (snap, context) =>{
      functions.logger.info("botData:", snap.data());
      const allValidBotsSnapshot = await db.collection("/seeker_bots")
          .where("replaced", "==", false)
          .where("timestamp", "<", snap.data().timestamp).get();
      const allValidSeekerBots = allValidBotsSnapshot.docs.map((doc)=>{
        return {
          name: doc.id,
          filename: doc.data().file_name,
          link: doc.data().downloadURL,
        };
      });
      const dataToSend = {
        name: snap.id,
        filename: snap.data().file_name,
        type: "hider",
        link: snap.data().downloadURL,
        opponents: allValidSeekerBots,
      };
      functions.logger.info("dataToSend:", dataToSend);
      const env = await db.doc("/config/ENV").get();
      const urls = (env && env.data()) ? env!.data()!.engine_url :
        ["http://ec2-18-191-29-23.us-east-2.compute.amazonaws.com"];
      const url = urls[Math.floor(Math.random() * urls.length)];
      try {
        const engineResponse =
            await axios.post(url, dataToSend, axiosRetryConfig);
        functions.logger.info("engineResponse:", engineResponse.data);
      } catch (e) {
        functions.logger.error("Axios error:", e);
      }
    });

export const getMatchDataFromEngine = functions.https
    .onRequest(async (request, response) =>{
      functions.logger.info("Request: ", request.body);
      const {
        seeker,
        seeker_points,
        seeker_errors,
        seeker_info,
        hider,
        hider_points,
        hider_errors,
        hider_info,
      } = request.body;

      const batch = db.batch();
      const seekerMatch = {
        seeker_points: parseInt(seeker_points),
        hider_errors: parseInt(hider_errors),
        seeker_info,
      };

      const hiderMatch = {
        hider_points: parseInt(hider_points),
        seeker_errors: parseInt(seeker_errors),
        hider_info,
      };

      const seekerMatchObj: any = {};
      seekerMatchObj["matches."+hider] = seekerMatch;
      const hiderMatchObj: any = {};
      hiderMatchObj["matches."+seeker] = hiderMatch;

      batch.update(db.doc("/seeker_bots/"+seeker), seekerMatchObj);
      batch.update(db.doc("/hider_bots/"+hider), hiderMatchObj);
      await batch.commit();

      response.send("Received Results");
    });

const GAMES_PER_MATCH = 25;
export const refreshLeaderBoards = functions.pubsub
    .schedule("every 1 minutes").onRun(async (context) => {
      // Compute Hider Scores
      const allHiderBotsSnapshot = await db.collection("/hider_bots")
          .where("replaced", "==", false).get();
      const allHiderBotsScores = [];
      for (const snapshot of allHiderBotsSnapshot.docs) {
        const totalMatches = Object.values(snapshot.data().matches)
            .reduce((prevVal: number, currVal: any) =>
              prevVal + (GAMES_PER_MATCH - currVal.seeker_errors), 0);
        const totalPoints = Object.values(snapshot.data().matches)
            .reduce((prevVal: number, currVal: any) =>
              prevVal + currVal.hider_points, 0);
        const averagePoints = totalPoints /
            (totalMatches > 0 ? totalMatches : 1);
        functions.logger.info("snapshot.data().team:", snapshot.data());
        const teamName = (await snapshot.data().team.get())
            .data()!.name;
        allHiderBotsScores.push({
          id: snapshot.id,
          name: snapshot.data().name,
          team: teamName,
          average_points: averagePoints,
        });
      }
      // Compute Seeker Scores
      const allSeekerBotsSnapshot = await db.collection("/seeker_bots")
          .where("replaced", "==", false).get();
      const allSeekerBotsScores = [];
      for (const snapshot of allSeekerBotsSnapshot.docs) {
        const totalMatches = Object.values(snapshot.data().matches)
            .reduce((prevVal: number, currVal: any) =>
              prevVal + (GAMES_PER_MATCH - currVal.hider_errors), 0);
        const totalPoints = Object.values(snapshot.data().matches)
            .reduce((prevVal: number, currVal: any) =>
              prevVal + currVal.seeker_points, 0);
        const averagePoints = totalPoints /
            (totalMatches > 0 ? totalMatches : 1);
        const teamName = (await snapshot.data().team.get())
            .data()!.name;
        allSeekerBotsScores.push({
          id: snapshot.id,
          name: snapshot.data().name,
          team: teamName,
          average_points: averagePoints,
        });
      }
      const nextScoreboardId = (await db.doc("/scoreboard/nextScoreboardId")
          .get()).data()!.value;
      const batch = db.batch();
      batch.update(db.doc("/scoreboard/nextScoreboardId"), {
        value: admin.firestore.FieldValue.increment(1),
      });
      batch.create(db.doc(`/scoreboard/${nextScoreboardId}`), {
        seekers: allSeekerBotsScores,
        hiders: allHiderBotsScores,
      });
      batch.commit();
    });
