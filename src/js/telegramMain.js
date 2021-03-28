require("regenerator-runtime"); // to fix await in case babel polyfills the code (polyfilling the code removes async/await native)

const { MTProto } = require('@mtproto/core');
const { tempLocalStorage } = require('@mtproto/core/src/storage/temp');
const { getSRPParams } = require('@mtproto/core');
const Readline = require('readline');
const { performance } = require('perf_hooks');

const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./localStorage');

const MTProtoApiId = 3470289;
const MTProtoApiHash = '97e9bcb0c5e52b1fdc9d7b6bab3732da';

export class telegramMain {
  constructor() {
    
    this.blockUpdate = false;
    
    this.mtproto = new MTProto({
      api_id: MTProtoApiId,
      api_hash: MTProtoApiHash,
      customLocalStorage: localStorage,
    })
  
    this.mtproto.updateInitConnectionParams({
      app_version: '10.0.0',
    });
    
    this.createApiConst(this.mtproto);
  }
 
  async startSigningIn() {
    const phone = '+37256233249';
    let code = 'XXXXX';
    const password = 'XXXXXX';
    
    const user = await this.getUser();
    
    if (!user) {
      const { phone_code_hash } = await this.sendCode(phone);
      
      code = parseInt(await this.askQuestion('Enter your code '));
      
      try {
        const authResult = await this.signIn({
          code,
          phone,
          phone_code_hash,
        });
  
        console.log('\x1b[36m%s\x1b[0m', 'You Are Now Signed in, Telegram api connection is established :)');
      } catch (error) {
        if (error.error_message !== 'SESSION_PASSWORD_NEEDED') {
          return;
        }
        
        // 2FA
        
        const { srp_id, current_algo, srp_B } = await this.getPassword();
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
    } else {
      console.log('\x1b[36m%s\x1b[0m', 'You Were Signed in, Telegram api connection is established :)');
    }
    return this.listenMessages();
  }
  
  async getUser() {
    try {
      const user = await this.api.call('users.getFullUser', {
        id: {
          _: 'inputUserSelf',
        },
      });
      
      return user;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  
  sendCode(phone) {
    return this.api.call('auth.sendCode', {
      phone_number: phone,
      settings: {
        _: 'codeSettings',
      },
    });
  }
  
  signIn({ code, phone, phone_code_hash }) {
    return this.api.call('auth.signIn', {
      phone_code: code,
      phone_number: phone,
      phone_code_hash: phone_code_hash,
    });
  }
  
  getPassword() {
    return this.api.call('account.getPassword');
  }
  
  checkPassword({ srp_id, A, M1 }) {
    return this.api.call('auth.checkPassword', {
      password: {
        _: 'inputCheckPasswordSRP',
        srp_id,
        A,
        M1,
      },
    });
  }
  
  listenMessages() {
    const requiredChannelIds = [1219958536, 1248722110, 1448562668] //1389805972
    //const requiredChannelIds = [1456370275]
    let coin = null;
    return new Promise((resolve, error) => {
      this.mtproto.updates.on('updates', message => {
        if (this.blockUpdate === false) {
          if (message.updates[0]._ === "updateNewChannelMessage") {
            if (requiredChannelIds.includes(message.updates[0].message.peer_id.channel_id)) {
              //console.log('\x1b[36m%s\x1b[0m', 'The coin has been captured from telegram ' + performance.now());
              const targetMessage = message.updates[0].message.message
              console.log(targetMessage)
              //this.blockUpdate = true;
              //resolve("SKY");
              //return;
              const matchPattern1 = /(?<=#)[A-Z]{2,}(?=(\s|\n|\r))/
              if (targetMessage.match(matchPattern1)) {
                console.log('\x1b[36m%s\x1b[0m', 'The coin has been captured from telegram ' + performance.now());
                coin = matchPattern1.exec(targetMessage)[0];
                this.blockUpdate = true;
                console.log("pattern1 " + coin);
                resolve(coin);
                return;
              }
              const matchPattern2 = /(?<=\s|^)[A-Z]{2,}(?=(\n|\r|\t|\s))/
              if (targetMessage.match(matchPattern2)) {
                console.log('\x1b[36m%s\x1b[0m', 'The coin has been captured from telegram ' + performance.now());
                coin = matchPattern2.exec(targetMessage)[0];
                this.blockUpdate = true;
                console.log("pattern2 " + coin);
                resolve(coin);
                return;
              }
            }
          }
        }
      });
    })
  }
  
  async getChannelDifference() {
    const chatExample = {
      id : 1389805972,
      access_hash: "10152628692453530569"
    }
  
    const history = await this.api.call('updates.getChannelDifference', {
      channel : {
        _: 'inputChannel',
        channel_id: 1389805972,
        access_hash: "10152628692453530569"
      },
      filter: {
      _: 'channelMessagesFilterEmpty'
      },
      pts: 300
    })
    console.log(history);
    
  }
  
  async getHistory() {
    setInterval(async () => {
      const chatExample = {
        id : 1389805972,
        access_hash: "10152628692453530569"
      }
  
      const history = await this.api.call('messages.getHistory', {
        peer: {
          _          : 'inputPeerChannel',
          channel_id : chatExample.id,
          access_hash: chatExample.access_hash
        },
      })
      console.log(history.messages[0].message)
      //history.messages.forEach(_ => _.message != null ? console.log(_.message) : console.log('empty'))
    }, 750)
  }
  
  async getMessages() {
    try {
      const channel = await this.api.call('channels.getMessages', {
        channel : {
          _: 'inputChannel',
          channel_id: 1389805972,
          access_hash: "10152628692453530569"
        },
        id: {
          _: 'inputMessageID'
        }
      })
      console.log(channel);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  
  async getDialogs() {
    try {
      const channel = await this.api.call('messages.getDialogs', {
        limit: 1,
        offset_peer: {
          _: 'inputPeerSelf'
        }
      })
      console.log(channel);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  
  async askQuestion(question) {
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
  
  createApiConst(mtproto) {
     this.api = {
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
  }
}


