require("regenerator-runtime"); // to fix await in case babel polyfills the code (polyfilling the code removes async/await native)

const { MTProto } = require('@mtproto/core');
const { tempLocalStorage } = require('@mtproto/core/src/storage/temp');
const { getSRPParams } = require('@mtproto/core');
const Readline = require('readline');

const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./localStorage');

const MTProtoApiId = 3470289;
const MTProtoApiHash = '97e9bcb0c5e52b1fdc9d7b6bab3732da';

export class telegramMain {
  constructor() {
    
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
        
        console.log(`authResult:`, authResult);
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
        
        //await getUser();
      }
    } else {
      console.log("PASSED");
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
  
  async fake() {
    await this.getUser();
  }
  
  listenMessages() {
      this.mtproto.updates.on('updates', message => {
        if (message.updates[0]._ === "updateNewChannelMessage") {
          if (message.updates[0].message.peer_id.channel_id === 1389805972) {
            console.log(message.updates[0].message.message)
          }
        }
      });
  }
  
  async listenMessages2() {
    this.listenMessages();
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
  
  async getMessages2() {
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
  
  async getUser() {
    try {
      const user = await this.api.call('users.getFullUser', {
        id: {
          _: 'inputUserSelf',
        },
      });
      
      console.log(user);
      
      return user;
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


