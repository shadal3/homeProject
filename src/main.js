// main.js

require("regenerator-runtime"); // to fix await in case babel polyfills the code (polyfilling the code removes async/await native)

//Required External Modules

const Express = require('express');
const Readline = require('readline');
const Binance = require('node-binance-api');

const Rx = require('@reactivex/rxjs');

//App Variables

const app = Express();
const port = "8080";

const obs1 = new Rx.BehaviorSubject(false);
const obs2 = new Rx.BehaviorSubject(true);
const dummySubject = new Rx.BehaviorSubject(true);




getApiKeys()
  .switchMap(([apiKey, apiKeySecret]) => {
    const binance = new Binance().options({
      APIKEY: apiKey,
      APISECRET: apiKeySecret
    })
    console.log(binance.time().then(time => console.log(time)));
    
    return new Rx.BehaviorSubject(true);
  })
  .subscribe((temp) => {
    console.log(temp);
  });


/*const binance = new Promise((resolve, err) => {
  getApiKeys().then((_) => {
    const result = Binance().options(_);
    resolve(result);
  })
})*/



//Server Activation
/*app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});*/


/**
 *  App Configuration
 */

//Routes Definitions

//start App


function getApiKeys() {
  return dummySubject
    .switchMap(() => {
      return askQuestion("Please enter your API key: ")
    })
    .switchMap((apiKey) => {
      const apiSecretKey = askQuestion("Please enter your secret API key: ")
      return Rx.Observable.zip(Rx.Observable.of(apiKey), apiSecretKey);
    });
}

function askQuestion(question) {
    const rl = Readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    const answerObs = new Rx.Subject();
  
    rl.question(question, (name) => {
        rl.close();
      answerObs.next(name);
    })
  
    return answerObs;
}

/*app.get("/", (req, res) => {
    res.status(200).send("WHATABYTE: Food For Devs");
});*/


/*
var app = express();
app.get('/', transducers);
app.get('/page', page);

console.log("Listening on port 4000...");
console.log("and this as well");
app.listen(4000);*/
