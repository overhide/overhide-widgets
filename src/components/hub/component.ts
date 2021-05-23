import {
  customElement,
  FASTElement,
  html,
  css,
  attr,
  observable
} from "@microsoft/fast-element";

import {
  CURRENCY_BY_IMPARTER,
  NETWORKS_BY_IMPARTER,
  Currency,
  Imparter,
  IOverhideHub,
  PaymentsInfo,
  NetworkType
} from './definitions';

import oh$ from "ledgers.js";
import w3Css from "../../static/w3.css";

interface CtorNamedParams {
  isTest?: boolean
}
@customElement({
  name: "overhide-hub"
})
export class OverhideHub extends FASTElement implements IOverhideHub {
  @attr 
  public isTest?: boolean | null;

  // payments object
  @observable 
  public paymentsInfo: PaymentsInfo = {
    currentCurrency: Currency.dollars,
    currentImparter: Imparter.ohledger,
    defaultCurrency: Currency.dollars,
    defaultImparter: Imparter.ohledger,
   
    enabled: {
      "btc-manual": false,
      "eth-web3": false,
      "ohledger-social": false,
      "ohledger-web3": false,
      ohledger: false,
      unknown: false
    },
    isOnLedger: {
      "btc-manual": false,
      "eth-web3": false,
      "ohledger-social": false,
      "ohledger-web3": false,
      ohledger: false,
      unknown: false
    },
    wallet: {
      "btc-manual": false,
      "eth-web3": false,
      "ohledger-social": false,
      "ohledger-web3": false,
      ohledger: false,
      unknown: false
    },
    pendingTransaction: {
      "btc-manual": false,
      "eth-web3": false,
      "ohledger-social": false,
      "ohledger-web3": false,
      ohledger: false,
      unknown: false
    },

    payerAddress: {
      "btc-manual": null,
      "eth-web3": null,
      "ohledger-social": null,
      "ohledger-web3": null,
      ohledger: null,
      unknown: null
    },
    payerPrivateKey: {
      "btc-manual": null,
      "eth-web3": null,
      "ohledger-social": null,
      "ohledger-web3": null,
      ohledger: null,
      unknown: null
    },
    payerSignature: {
      "btc-manual": null,
      "eth-web3": null,
      "ohledger-social": null,
      "ohledger-web3": null,
      ohledger: null,
      unknown: null
    },
    messageToSign: {
      "btc-manual": null,
      "eth-web3": null,
      "ohledger-social": null,
      "ohledger-web3": null,
      ohledger: null,
      unknown: null
    },

    time: new Date()
  };
  
  // set error if any
  @observable 
  public error?: string | null;

  public readonly THIS_IS_OVERHIDE_HUB: boolean = true;

  private allowNetworkType: NetworkType = NetworkType.prod;

  // cache of outstanding results
  private outstandingCache: {[key: string]: number} = {};

  connectedCallback() {
    super.connectedCallback();
    console.log('my-header is now connected to the DOM');
  };

  public constructor({isTest}: CtorNamedParams = {}) {
    super();
    this.allowNetworkType = !!isTest ? NetworkType.test : NetworkType.prod;
    if (isTest) {
      this.isTestChanged(false, isTest);
    }
  }

  // @param {string} error -- the error string to set
  public setError = (error: string) => {
    this.error = error;
  }

  // Set current imparter and authenticates
  // @param {Imparter} imparter - to set
  public setCurrentImparter = async (imparter: Imparter) => {
    const oldInfo = {...this.paymentsInfo};
    try {
      this.outstandingCache = {}; // reset outstanding cache
      this.paymentsInfo.currentImparter = imparter;
      this.paymentsInfo.currentCurrency = CURRENCY_BY_IMPARTER[imparter];

      if (imparter !== Imparter.unknown && !this.isAuthenticated(imparter)) {
        await this.authenticate(imparter);
      }
      this.pingApplicationState();
    }
    catch (e) 
    {
      this.paymentsInfo = {...oldInfo};
      this.error = e;
    }
  }

  // Sets credentials secret key for non-wallet workflow
  // @param {Imparter} imparter - to set 
  // @param {string} new key - to set
  // @returns {Promise<boolean>} -- whether successful
  public setSecretKey = async (imparter: Imparter, newKey: string): Promise<boolean> => {
    try {
      if (imparter === Imparter.unknown) this.error = 'cannot set secret, imparter not set';
      if (!this.paymentsInfo.wallet[imparter]) {
        return await oh$.setCredentials(imparter, {secret: newKey});
      }
    } catch (error) {
    }
    return false;
  }

  // Generates new PKI keys for non-wallet workflows.
  // Updates paymentsInfo provided by service.
  // No-op if current currency has a wallet set.
  // @param {Imparter} imparter - to set 
  public generateNewKeys = async (imparter: Imparter) => {
    const oldInfo = {...this.paymentsInfo};
    try {
      if (imparter === Imparter.unknown) this.error = 'cannot generate new key, imparter not set';
      if (!this.paymentsInfo.wallet[imparter]) {
        await oh$.generateCredentials(imparter,null);
      }
    } catch (error) {
      this.paymentsInfo = {...oldInfo};
      this.error = `${typeof error === 'object' && 'message' in error ? error.message : error}`;
    }
  }

  // Is current crednetial authenticatd against the current currency's ledger? 
  // @param {Imparter} imparter - to set 
  // @returns {boolean} after checking signature and whether ledger has any transactions (to anyone)
  public isAuthenticated = (imparter: Imparter) => {
    return this.paymentsInfo.isOnLedger[imparter];
  }  

  // Get balance outstanding for authorization as per current currency.
  // @param {number} costInDollars - amount expected to tally (in dollars or ethers)
  // @param {string} to - address of recepient
  // @param {number} minutes - number of minutes to look back (since) on the ledger
  // @returns {number} differnce in dollars, $0 if authorized, null if not yet known.
  public getOutstanding = (costInDollars: number, to: string, tallyMinutes: number): number | null => {
    const currency = this.getCurrentCurrency();
    const imparter = this.getCurrentImparter();
    if (currency === Currency.unknown || imparter === Imparter.unknown) throw `unknown current currency/imparter in getOutstanding`;
    const key = `${imparter}_${costInDollars}_${to}_${tallyMinutes}`;
    console.log(`#getOutstanding(${key}) = ${this.outstandingCache[key]}`);
    if (key in this.outstandingCache) {
      return this.outstandingCache[key];
    }
    delete this.outstandingCache[key]; // for re-requests
    (async () => {
      const oldInfo = {...this.paymentsInfo};
      try {
        let tally;
        const creds = await oh$.getCredentials(imparter);
        if (!creds || !creds.address) {
          this.outstandingCache[key] = costInDollars;
          this.pingApplicationState();
          return;
        };
        if (tallyMinutes) {
          let since = new Date();
          since.setMinutes(since.getMinutes() - tallyMinutes);
          tally = await oh$.getTallyDollars(imparter, { address: to }, since);
        } else {
          tally = await oh$.getTallyDollars(imparter, { address: to }, null);
        } 
        
        var delta = costInDollars - tally;
        delta = delta < 0 ? 0 : delta;
        this.outstandingCache[key] = delta;
        this.pingApplicationState();
      } catch (error) {
        this.paymentsInfo = {...oldInfo};
        this.error = `${typeof error === 'object' && 'message' in error ? error.message : error}`;
      }  
    })();
    return null;
  }

  // Do the actual topup to authorize
  // @param {number} amountDollars - amount to topup in US dollars, can be 0 to just create a free transaction for getting on ledger
  // @param {} toAddress - to pay
  public topUp = async (amountDollars: number, toAddress: string) => {
    const currency = this.getCurrentCurrency();
    const imparter = this.getCurrentImparter();
    const oldInfo = {...this.paymentsInfo};
    try {
      const wallet = this.paymentsInfo.wallet[imparter];
        const amount = await oh$.getFromDollars(imparter, amountDollars);
      this.paymentsInfo.pendingTransaction[imparter] = amount;
      let aDayAgo = new Date((new Date()).getTime() - 24*60*60*1000);     // we compare tallies...
      let before = await oh$.getTally(imparter, {address: toAddress}, aDayAgo);  // ... by taking a sample before
      let options = this.paymentsInfo.payerSignature && this.paymentsInfo.messageToSign && {
          message: this.paymentsInfo.messageToSign, 
          signature: this.paymentsInfo.payerSignature
        };
      await oh$.createTransaction(imparter, amount, toAddress, options);
      if (amount > 0) {
        for (var i = 0; i < 12; i++) {
          let now = await oh$.getTally(imparter, { address: toAddress }, aDayAgo); // ... we take a sample now
          if (now > before) break;                                          // ... and exit out as soon as decentralized
                                                                            //     ledger is consistent between the wallet's
                                                                            //     node and ledgers.js node
          await this.delay(5000);                                                // ... else wait 5 seconds
        }  
      }
      this.paymentsInfo.pendingTransaction[imparter] = false;
      this.paymentsInfo.isOnLedger[imparter] = true;      
      this.outstandingCache = {}; // reset outstanding cache
      this.pingApplicationState();
    } catch (error) {
      this.paymentsInfo = {...oldInfo};
      this.paymentsInfo.pendingTransaction[imparter] = false;
      this.error = `${typeof error === 'object' && 'message' in error ? error.message : error}`;
    }
  }

  // Get URL for imparter
  // @param {Imparter} imparter - to set 
  // @return {string} the URL
  public getUrl = (imparter: Imparter) => {
    return oh$.getOverhideRemunerationAPIUri(imparter);
  }

  // Authenticate for the specific imparter.
  // @param {Imparter} imparter - to set 
  private authenticate = async (imparter: Imparter) => {
    this.outstandingCache = {}; // reset outstanding cache
    if ((!this.paymentsInfo.payerSignature 
          || !this.paymentsInfo.messageToSign)) {
      await this.sign(imparter);
    }
    await this.isOnLedger()  
  }

  private isTestChanged(oldValue: boolean, newValue: boolean) {
    this.allowNetworkType = newValue ? NetworkType.test : NetworkType.prod;
    this.init();
  }

  // @returns {Currency} 
  private getCurrentCurrency = () => {
    return this.paymentsInfo.currentCurrency || this.paymentsInfo.defaultCurrency;
  }  

  // @returns {Imparter} 
  private getCurrentImparter = () => {
    return this.paymentsInfo.currentImparter || this.paymentsInfo.defaultImparter;
  }

  // Trigger redraw via application state update
  private pingApplicationState = () => {
    this.paymentsInfo = {...this.paymentsInfo, time: new Date()};
  }
  
  // Check current credentials for any transactions on current ledger.
  private isOnLedger = async () => {
    try {
      const currency = this.getCurrentCurrency();
      const imparter = this.getCurrentImparter();
      this.paymentsInfo.isOnLedger[imparter] = false;
      if (await oh$.isOnLedger(imparter)) {
        this.paymentsInfo.isOnLedger[imparter] = true;
      }
    } catch (error) {
      throw `${typeof error === 'object' && 'message' in error ? error.message : error}`;
    }
  }

  // Sign a challenge with current credentials and set to the payments info.
  private sign = async (imparter: Imparter) => {
    try {
      const challenge = this.makePretendChallenge();
      var signature = await oh$.sign(imparter, challenge);
      this.setSignature(imparter, challenge, signature);
    } catch (error) {
      this.setSignature(imparter, null, null);
      throw `${typeof error === 'object' && 'message' in error ? error.message : error}`;
    }
  }

  // Set imparter enabled status
  // @param {Imparter} imparter - to set 
  // @para {bool} value - to set
  private setImparterEnabled = (imparter: Imparter, value: boolean) => {
    this.paymentsInfo.enabled[imparter] = value;
    this.pingApplicationState();
  }

  // Set wallet
  // @param {Imparter} imparter - to set 
  // @param {boolean} value - to set
  private setWallet = (imparter: Imparter, value: boolean) => {
    this.paymentsInfo.wallet[imparter] = value;
    this.pingApplicationState();
  }

  // Set signature
  // @param {Imparter} imparter - to set 
  // @param {string} messageToSign - message to sign
  // @param {string} payerSignature - signed message
  private setSignature = (imparter: Imparter, messageToSign: string | null, payerSignature: string | null) => {
    this.paymentsInfo.messageToSign[imparter] = messageToSign;
    this.paymentsInfo.payerSignature[imparter] = payerSignature;
    this.pingApplicationState();
  }

  // Set credentials
  // @param {Imparter} imparter - to set 
  // @param {string} payerAddress - (out only) payer's public address as set by service
  // @param {string} payerPrivateKey - payer's private key (receipt code) iff not using wallet, null if using wallet
  private setCredentials = async (imparter: Imparter, payerAddress: string, payerPrivateKey: string | null) => {
    if (imparter !== this.getCurrentImparter()) return;
    this.paymentsInfo.payerAddress[imparter] = payerAddress;
    this.paymentsInfo.payerPrivateKey[imparter] = payerPrivateKey;
    this.paymentsInfo.messageToSign[imparter] = null;
    this.paymentsInfo.payerSignature[imparter] = null;    
    await this.authenticate(imparter);
    this.pingApplicationState();
  }

  // Clear credentials and wallet if problem
  private clear = (imparter: Imparter) => {
    this.paymentsInfo.enabled[imparter] = false;
    delete this.paymentsInfo.wallet[imparter];
    this.paymentsInfo.payerAddress[imparter] = null;
    this.paymentsInfo.payerPrivateKey[imparter] = null;
    this.paymentsInfo.messageToSign[imparter] = null;
    this.paymentsInfo.payerSignature[imparter] = null;    
    this.pingApplicationState();
  }

  /**
   * Retrieve API access token
   * 
   * @returns {string} the token.
   */
  private getToken = async () => {
    const tokenUrl = `https://token.overhide.io/token`;
    const apiKey = '0x___API_KEY_ONLY_FOR_DEMOS_AND_TESTS___';
    const url = `${tokenUrl}?apikey=${apiKey}`;

    return fetch(url, {
      method: 'GET'
    }).then(result => {
      if (result.status === 200) {
        return result.text();
      } else {
        throw(JSON.stringify({url: url, status: result.status, error: result.statusText}));
      }
    }).then(token => {
      return token;
    }).catch(e => {
    });
  }

  // Initialize oh$ listeners.
  private init = () => {

    // Ensure oh$ has a token.
    (async () => {
      oh$.enable(await this.getToken());
    })();

    // Determine if ethers should be enabled based on uri from wallet (versus admin)
    // Ethers only enabled if wallet, so do everything in 'onWalletChange'
    oh$.addEventListener('onWalletChange', async (e: any) => {
      const network = await oh$.getNetwork(e.imparterTag);
      const credentials = await oh$.getCredentials(e.imparterTag);
      const imparter: Imparter = e.imparterTag;
      switch (imparter) {
        case Imparter.ethWeb3:
          if (e.isPresent) {
            if (NETWORKS_BY_IMPARTER[this.allowNetworkType][imparter] === network.name) {
              this.setImparterEnabled(imparter, true);
              this.setWallet(imparter, e.isPresent);
              await this.setCredentials(imparter, credentials.address, null);
            } else {
              // wrong network
              this.clear(imparter);
              this.error = `Network misconfiguration: (expected:${NETWORKS_BY_IMPARTER[this.allowNetworkType][imparter]}) (seen:${network.name})`;
              return;
            }
          } else {
            // no wallet no ether payments
            this.clear(imparter);
          }
          // dollars always available, ethers enabled when network detected below  
          break;
        case 'ohledger-web3':
          this.setWallet(imparter, e.isPresent);
          await this.setCredentials(imparter, credentials.address, null);
          console.log(`overhide-ledger wallet set for network ${network.currency}:${network.mode}`); // no network misconfigs for ohledger as explicitly set
          break;
        default:
      }
    });

    // Determine if dollars should be enabled.  Since we enable dollars test network at end below, we know this will trigger..
    // No wallet for dollars in this example.
    oh$.addEventListener('onNetworkChange', async (e: any) => {
      const imparter: Imparter = e.imparterTag;
      switch (imparter) {
        case Imparter.ethWeb3:
        case Imparter.btcManual:
          if (e && e.name && NETWORKS_BY_IMPARTER[this.allowNetworkType][imparter] !== e.name) {
            // wrong network
            this.clear(imparter);
            this.error = `Network misconfiguration: (expected:${NETWORKS_BY_IMPARTER[this.allowNetworkType][imparter]}) (seen:${e.name})`;
            return;
          }
          break;
        case Imparter.ohledger:
        case Imparter.ohledgerWeb3:
        case Imparter.ohledgerSocial:
          if ('currency' in e
            && 'mode' in e
            && `${e.currency}:${e.mode}` === NETWORKS_BY_IMPARTER[this.allowNetworkType][imparter]) {
            this.setImparterEnabled(imparter, true);
            break;
          }
          // wrong network
          this.clear(imparter);
          this.error = `overhide-ledger network misconfig: (expected:${NETWORKS_BY_IMPARTER[this.allowNetworkType][imparter]}) (seen: ${e.currency}:${e.mode})`;
          return;
        default:
      }
    });

    // Update current payer
    oh$.addEventListener('onCredentialsUpdate', async (e: any) => {
      const imparter: Imparter = e.imparterTag;
      // don't update if wallet not set/unset:  perhaps network error above.
      if (imparter === Imparter.ethWeb3 && !this.paymentsInfo.wallet[imparter]) return;
      if (imparter === Imparter.ohledgerWeb3 && !this.paymentsInfo.wallet[imparter]) return;      

      await this.setCredentials(imparter, e.address, 'secret' in e ? e.secret : null);
    });

    oh$.addEventListener('onWalletChange', async (e: any) => {
      this.outstandingCache = {};
      this.pingApplicationState();
    });

    oh$.setNetwork('ohledger', { currency: 'USD', mode: this.allowNetworkType ? 'test' : 'prod' }); 
    oh$.setNetwork('ohledger-web3', { currency: 'USD', mode: this.allowNetworkType ? 'test' : 'prod' });
    oh$.setNetwork('ohledger-social', { currency: 'USD', mode: this.allowNetworkType ? 'test' : 'prod' });
  }

  /**
   * @returns {string} a challenge
   */
  public makePretendChallenge(): string {
    return `please sign this challenge proving you own this address :: ${(new Date()).getTime() / 1000}`; // make pretend challenge
  }
  
  /**
   * @param {number} t - millis to delay
   * @returns {Promise} completing when delay is done
   */
  public delay(t: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve.bind(null), t));
  };  
}
