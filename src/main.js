// main.js
require("regenerator-runtime"); // to fix await in case babel polyfills the code (polyfilling the code removes async/await native)

//Required External Modules

const Express = require('express');
const { sleep } = require('@mtproto/core/src/utils/common');

const Readline = require('readline');
const { performance } = require('perf_hooks');

const Binance = require('node-binance-api');
const ccxt = require('ccxt');

const { MTProto } = require('@mtproto/core');
const { tempLocalStorage } = require('@mtproto/core/src/storage/temp');
const { getSRPParams } = require('@mtproto/core');

//App Variables
const app = Express();
const port = "8080";
const pairToTrade = "BTC";
const baseCryptoPrecision = 0; //ADA -1, SKY - 0
const quoteCryptoPrecision = 8 //USDT - 3, BTC - 8

const MTProtoApiId = 3470289;
const MTProtoApiHash = '97e9bcb0c5e52b1fdc9d7b6bab3732da';

const mtproto =new MTProto({
  api_id: MTProtoApiId,
  api_hash: MTProtoApiHash,
  customLocalStorage: tempLocalStorage,
})

const commonDataHandler = new Promise((resolve, err) => {
  resolve(new Binance())
});

const client = new Promise((resolve, err) => {
  resolve(new ccxt.binance({
    apiKey: '1k8pHcreUowwve7fUOWlWt4dzwOXxL4hkYpYdIXW266TwND73dZmWD6PVyjDX3kZ',
    secret: 'CfNBL3uuhZQPQYV2oxTt5cG74smyzgQ7kDsFxeJ9dzhmaJg2B9RM4oadbCPhVpNR'
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
    }
    isTimeLoggerDone = true;
    console.log(`Price of ${currency}: `, data.bestBid);
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
      binance.prices(combinePair, (error, ticker) => {
        console.log(`Price of ${currency}: `, ticker[combinePair]);
        
        if (error != null) {
          console.log(error);
        }
  
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
  let boughtBaseCurrencyAmount = 0
  let boughtPrice = 0;
  let milestones = [];
  
  while (true) {
    quantity = await askQuestion("How much quote crypto currency you want to spend to buy base crypto?: ") //BTC/USDT === base currency/quote currency
    
    if (isNumeric(quantity)) {
      quantity = parseFloat(quantity);
      const balances = await binance.fetchBalance();
      const pairToTradeBalance = parseFloat(balances[pairToTrade].free);
      
      if (quantity > pairToTradeBalance) {
        console.log('\x1b[36m%s\x1b[0m', 'Your Free Balance is ' + balances[pairToTrade].free);
        console.log('\x1b[36m%s\x1b[0m', 'Your Balance is Lower Than Desired Quantity of Quote Crypto Currency');  //cyan
        continue;
      }
      break
    }
  }
  
  milestones = await askMilestones();
  
  while(true) {
    currency = (await askQuestion("What cryptocurrency you are willing to buy?: ")).toUpperCase();
    combinedPair = currency + '/' + pairToTrade;
    let exitLoop = false;
    
    console.log('\x1b[36m%s\x1b[0m', 'Send a Request to Create Market Order ' + performance.now());
  
    exitLoop = await new Promise((resolve, err) => {
      binance.createMarketOrder(combinedPair, 'buy', undefined, undefined, { 'quoteOrderQty': quantity })
        .then((result) => {
          boughtBaseCurrencyAmount = result.amount;
          boughtPrice = result.price
          resolve(true)
        })
        .catch(() => resolve(false))
    })
    if (exitLoop) break;
  }
  
  await sellCryptoCurrency(binance, combinedPair, boughtBaseCurrencyAmount, boughtPrice, ...milestones);
  
  
  function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) && !isNaN(parseFloat(str))
  }
}

async function askMilestones() {
  const milestone1 = parseInt(await askQuestion("What percentage of profit you want to get as milestone 1: "));
  const milestone2 = parseInt(await askQuestion("What percentage of profit you want to get as milestone 2: "));
  const milestone3 = parseInt(await askQuestion("What percentage of profit you want to get as milestone 3: "));
  
  return [milestone1, milestone2, milestone3];
}

async function sellCryptoCurrency(binance, combinedPair, boughtBaseCurrencyAmount, boughtPrice, milestone1, milestone2, milestone3) {
  const amount1 = round(boughtBaseCurrencyAmount * 0.333, baseCryptoPrecision);
  const amount2 = round((boughtBaseCurrencyAmount * 0.333), baseCryptoPrecision);
  const amount3 = (round((boughtBaseCurrencyAmount - amount1 - amount2) * 0.99, baseCryptoPrecision));
  
  const milestonePrice1 = (boughtPrice + (boughtPrice * milestone1 / 100)).toFixed(quoteCryptoPrecision)
  const milestonePrice2 = (boughtPrice + (boughtPrice * milestone2 / 100)).toFixed(quoteCryptoPrecision)
  const milestonePrice3 = (boughtPrice + (boughtPrice * milestone3 / 100)).toFixed(quoteCryptoPrecision)
  
  console.log(`milestone1: ${milestone1},  milestone2: ${milestone2},  milestone3: ${milestone3}`)
  console.log(`amount1: ${amount1},  amount2: ${amount2},  amount3: ${amount3}`)
  console.log(`milestonePrice1: ${milestonePrice1},  milestonePrice2: ${milestonePrice2},  milestonePrice3: ${milestonePrice3}`)
  
  binance.createLimitOrder(combinedPair, "sell", amount1, milestonePrice1).then(_ => console.log('\x1b[36m%s\x1b[0m', 'Response Arrived, Limit order is completed ' + performance.now()));
  binance.createLimitOrder(combinedPair, "sell", amount3, milestonePrice2);
  binance.createLimitOrder(combinedPair, "sell", amount2, milestonePrice3);
  
  function round(value, decimals) {
    return Number(Math.floor(value+'e'+decimals)+'e-'+decimals);
  }
}

const api = {
  call(method, params, options = {}) {
    return mtproto.call(method, params, options).catch(async error => {
      console.log(`${method} error:`, error);
      
      const { error_code, error_message } = error;
      
      if (error_code === 420) {
        const seconds = +error_message.split('FLOOD_WAIT_')[1];
        const ms = seconds * 1000;
        
        await sleep(ms);
        
        return this.call(method, params, options);
      }
      
      if (error_code === 303) {
        const [type, dcId] = error_message.split('_MIGRATE_');
        
        // If auth.sendCode call on incorrect DC need change default DC, because call auth.signIn on incorrect DC return PHONE_CODE_EXPIRED error
        if (type === 'PHONE') {
          await mtproto.setDefaultDc(+dcId);
        } else {
          options = {
            ...options,
            dcId: +dcId,
          };
        }
        
        return this.call(method, params, options);
      }
      
      return Promise.reject(error);
    });
  },
};


async function getUser() {
  try {
    const user = await api.call('users.getFullUser', {
      id: {
        _: 'inputUserSelf',
      },
    }, {syncAuth: true, dcId: 2});
    
    return user;
  } catch (error) {
    return null;
  }
}

function sendCode(phone) {
  return api.call('auth.sendCode', {
    phone_number: phone,
    settings: {
      _: 'codeSettings',
    },
  });
}

function signIn({ code, phone, phone_code_hash }) {
  return api.call('auth.signIn', {
    phone_code: code,
    phone_number: phone,
    phone_code_hash: phone_code_hash,
  });
}

function getPassword() {
  return api.call('account.getPassword');
}

function checkPassword({ srp_id, A, M1 }) {
  return api.call('auth.checkPassword', {
    password: {
      _: 'inputCheckPasswordSRP',
      srp_id,
      A,
      M1,
    },
  });
}

const phone = 'XXXXXX';
let code = 'XXXXX';
const password = 'XXXXXX';

(async () => {
  const user = await getUser();
  
  if (!user) {
    const { phone_code_hash } = await sendCode(phone);
    
    code = parseInt(await askQuestion('Enter your code '));
    
    try {
      const authResult = await signIn({
        code,
        phone,
        phone_code_hash,
      });
      
      console.log(`authResult:`, authResult);
    } catch (error) {
      if (error.error_message !== 'SESSION_PASSWORD_NEEDED') {
        return;
      }
      
      // 2FA
      
      const { srp_id, current_algo, srp_B } = await getPassword();
      const { g, p, salt1, salt2 } = current_algo;
      
      const { A, M1 } = await getSRPParams({
        g,
        p,
        salt1,
        salt2,
        gB: srp_B,
        password,
      });
      
      const authResult = await checkPassword({ srp_id, A, M1 });
      
      console.log(`authResult:`, authResult);
    }
  }
})()

/*(async function getUser() {
  try {
    const user = await api.call('users.getFullUser', {
      id: {
        _: 'inputUserSelf',
      },
    });
    
    console.log("meow")
    
    console.log(user);
    
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
})()*/



Promise.all([commonDataHandler, client]).then(
  (data) => {
    console.log('\x1b[36m%s\x1b[0m', 'Connection via api established :)');  //cyan
    
    const commonDataHandlerInner = data[0];
    const clientInner = data[1];
    
    
  
    //getCryptoCurrencyPrice(commonDataHandlerInner);
    //traceCryptoCurrencyBooksLiveWebSocket(commonDataHandlerInner); //Keep in mind that the connection is establishing a way long for shit coins
    //traceCryptoCurrencyPriceLiveWebsocket(commonDataHandlerInner);
    //traceCryptoCurrencyPriceLive(commonDataHandlerInner);
    //buyCryptoCurrency(clientInner);
    //sellCryptoCurrency(clientInner).
    
  },
  (error) => {
    console.log(error)
  }
)


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
