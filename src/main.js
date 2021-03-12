// main.js

require("regenerator-runtime"); // to fix await in case babel polyfills the code (polyfilling the code removes async/await native)

//Required External Modules

const Express = require('express');
const Readline = require('readline');
const Binance = require('node-binance-api');
const Rx = require('rxjs');
const RxOp = require('rxjs/operators');

//App Variables

const app = Express();
const port = "8080";


/*Rx.forkJoin(getApiKeys)
  .switchMap(([key, secretKey]) => {
    console.log(key, secretKey);
  })
  .subscribe();

interval.subscribe((value) => console.log("someRandomData"));*/

const binance = new Promise((resolve, err) => {
  getApiKeys().then((_) => {
    const result = Binance().options(_);
    resolve(result);
  })
})

binance.then(
  (result) => {
    console.log(result)
  },
  (error) => {
    console.log(error)
  }
)



//Server Activation
/*app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});*/


/**
 *  App Configuration
 */

//Routes Definitions

//start App



async function getApiKeys() {
    const apiKey = await askQuestion("Please enter your API key: ");
    const apiSecretKey = await askQuestion("Please enter your API secret key: ");

    return {
      APIKEY: apiKey,
      APISECRET: apiSecretKey
    }
}

function askQuestion(question) {
    const rl = Readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise((resolve, err) => {
        rl.question(question, (name) => {
            rl.close();
            resolve(name);
        })
    });
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
