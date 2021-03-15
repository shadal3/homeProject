// main.js
require("regenerator-runtime"); // to fix await in case babel polyfills the code (polyfilling the code removes async/await native)

//Required External Modules

const Express = require('express');
const Readline = require('readline');
const Binance = require('node-binance-api');

//App Variables
const app = Express();
const port = "8080";
const pairToTrade = "USDT";


const client = new Promise((resolve, err) => {
  resolve(new Binance().options({
      APIKEY: "1k8pHcreUowwve7fUOWlWt4dzwOXxL4hkYpYdIXW266TwND73dZmWD6PVyjDX3kZ",
      APISECRET: "CfNBL3uuhZQPQYV2oxTt5cG74smyzgQ7kDsFxeJ9dzhmaJg2B9RM4oadbCPhVpNR"
  }))
  /*getApiKeys().then((apiKeys) => {
    resolve(Binance().options(apiKeys));
  })*/
})

async function getCryptoCurrencyPrice(binance) {
  const currency = (await askQuestion("What cryptocurrence are you interested in: ")).toUpperCase();
  const combinePair = currency + pairToTrade;
  console.time('\x1b[36mgetCryptoCurrencyPrice execution time\x1b[0m');
  
  binance.prices(combinePair, (error, ticker) => {
    console.log(`Price of ${currency}: `, ticker[combinePair]);
    console.timeEnd('\x1b[36mgetCryptoCurrencyPrice execution time\x1b[0m');
  });
}

// based on bookTickers
async function traceCryptoCurrencyBooksLiveWebSocket(binance) {
  const currency = (await askQuestion("What cryptocurrence are you interested in: ")).toUpperCase();
  const combinePair = currency + pairToTrade;
  let isTimeLoggerDone = false;
  console.time('\x1b[36mtraceCryptoCurrencyPriceLive execution time\x1b[0m');
  
  binance.websockets.bookTickers(combinePair, data => {
    if (!isTimeLoggerDone) {
      console.timeEnd('\x1b[36mtraceCryptoCurrencyPriceLive execution time\x1b[0m');
      isTimeLoggerDone = true;
      console.log(`Price of ${currency}: `, data.bestBid);
    }
  });
}


//Based on trading
async function traceCryptoCurrencyPriceLiveWebsocket(binance) {
  const currency = (await askQuestion("What cryptocurrence are you interested in: ")).toUpperCase();
  const combinedPair = currency + pairToTrade;
  
  let isTimeLoggerDone = false;
  console.time('\x1b[36mtraceCryptoCurrencyPriceLive execution time\x1b[0m');
  
  binance.websockets.trades(combinedPair, (trades) => {
    if (!isTimeLoggerDone) {
      let { e: eventType, E: eventTime, s: symbol, p: price, q: quantity, m: maker, a: tradeId } = trades;
      console.log(symbol + " trade update. price: " + price + ", quantity: " + quantity + ", maker: " + maker);
      console.timeEnd('\x1b[36mtraceCryptoCurrencyPriceLive execution time\x1b[0m');
      isTimeLoggerDone = true;
    }
  });
}

//Based on trading
async function traceCryptoCurrencyPriceLive(binance) {
  const currency = (await askQuestion("What cryptocurrence are you interested in: ")).toUpperCase();
  const combinePair = currency + pairToTrade;
  let isTimeLoggerDone = false;
  
  console.time('\x1b[36mgetCryptoCurrencyPrice execution time\x1b[0m');
  
    setInterval(() => {
      binance.prices('BTCUSDT', (error, ticker) => {
        console.log(`Price of ${currency}: `, ticker['BTCUSDT']);
  
        if (!isTimeLoggerDone) {
          console.timeEnd('\x1b[36mgetCryptoCurrencyPrice execution time\x1b[0m');
          isTimeLoggerDone = true;
        }
      });
    }, 100)
}

async function buyCryptoCurrency(binance) {
  let quantity = null;
  let currency = null;
  let combinedPair = null;
  
  while (true) {
    quantity = await askQuestion("How much crypto currency you want to buy?: ")
    
    if (isNumeric(quantity)) {
      quantity = parseFloat(quantity);
      
      const balances = await binance.balance();
      const pairToTradeBalance = parseFloat(balances[pairToTrade].available);
      
      quantity = parseFloat(balances[pairToTrade].available);
      
      if (quantity > pairToTradeBalance) {
        console.log(balances[pairToTrade]);
        console.log('\x1b[36m%s\x1b[0m', 'Your Balance is Lower Than Desired Quantity of Crypto Currency');  //cyan
        continue;
      }
      break
    }
  }
  
  while(true) {
    currency = (await askQuestion("What cryptocurrency you are willing to buy?: ")).toUpperCase();
    combinedPair = currency + pairToTrade;
    let exitLoop = false;
  
    exitLoop = await new Promise((resolve, err) => {
      binance.prices(combinedPair, (error, ticker) => {
        if (error == null) {
          invokeImmediateBuy(combinedPair, ticker[combinedPair], quantity)
        } else {
          resolve(false)
        }
      });
    })
    if (exitLoop) break;
  }
  
  function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) && !isNaN(parseFloat(str))
  }
  
  function invokeImmediateBuy(currency, price, balance) {
    const newBalance = balance - (balance * 0.02);
    const quantity = (newBalance / price).toFixed(6)
  
    console.log(`currency: ${currency}, price: ${price}, balance: ${balance}, quantity: ${quantity}`);
    
    binance.marketBuy(currency, quantity, (error, response) => {
      if (error == null) {
        console.log("Market buy response", response);
        console.log("orderId: ", response.orderId)
      } else {
        console.log(error.body);
        console.log('\x1b[36m%s\x1b[0m', 'Purchase has Failed ... Seems to Something Went Wrong');  //cyan
      }
    });
  }
}

client.then(
  (result) => {
    console.log('\x1b[36m%s\x1b[0m', 'Connection via api established :)');  //cyan
    //getCryptoCurrencyPrice(result);
    //traceCryptoCurrencyBooksLiveWebSocket(result); //Keep in mind that the connection is establishing a way long for shit coins
    //traceCryptoCurrencyPriceLiveWebsocket(result);
    //traceCryptoCurrencyPriceLive(result);
    buyCryptoCurrency(result);
    
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
