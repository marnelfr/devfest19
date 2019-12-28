'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const admin = require('firebase-admin');
 
process.env.DEBUG = 'dialogflow:debug';
 

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'ws://devfestporto-92810.firebaseio.com/'
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Yo boss!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
 
  function addToDB(agent) {
    const text = agent.parameters.text;
    admin.database().ref('message').set({
      text, nom: 'GNAC'
    });
    agent.add('Text save successfuly');
  }
 
  function getFromDB(agent) {
    return admin.database().ref('message').once("value").then((snapshot) => {  
      const text = snapshot.child('text').val();
      if (text !== null) {
		agent.add(`Le text est : ${text}`);
      }else{
		agent.add('Aucun text trouvé');
      }
    });
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Add to DB', addToDB);
  intentMap.set('Get From DB', getFromDB);
  agent.handleRequest(intentMap);
});