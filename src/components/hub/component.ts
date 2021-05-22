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
  PaymentsInfo,
  NetworkType
} from './definitions';

import oh$ from "ledgers.js";
import w3Css from "./static/w3.css";
import someIcon from "./static/icons/oh-ledger-coin.svg";

const template = html<OverhideHub>`
<link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Lato" />

<div id="body">
  <div class="w3-panel w3-red">
  ${someIcon}
  </div>
</div>
`;

const styles = css`
#body {
  font-family: Lato;
  font-variant: small-caps;
}

${w3Css}
`;

@customElement({
  name: "overhide-hub",
  template,
  styles,
})
export class OverhideHub extends FASTElement {

  // payments object
  @observable paymentsInfo: PaymentsInfo = {
    currentCurrency: Currency.dollars,
    currentImparter: Imparter.ohledger,
    defaultCurrency: Currency.dollars,
    defaultImparter: Imparter.ohledger,
   
    setError: (error: string) => this.setError(error),
    setImparter: (imparter: Imparter) => this.setCurrentImparter(imparter),
    setSecretKey: (key: string) => this.setSecretKey(key),
    getOutstanding: (costInDollars: number, to: string, minutes: number) => this.getOutstanding(costInDollars, to, minutes),
    topUp: (amountDollars: number, toAddress: string) => this.topUp(amountDollars, toAddress),

    isAuthenticated: false,
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
    ledgerUri: undefined,
    time: new Date()
  };
  
  // set error if any
  @observable error: string | null = null;

  connectedCallback() {
    super.connectedCallback();
    console.log('my-header is now connected to the DOM');
  };

  #allowNetworkType: NetworkType;

  constructor(private isTest: boolean = true) {
    super();
    this.#allowNetworkType = isTest ? NetworkType.test : NetworkType.prod;
    this.#init();
  }

  // @param {string} error -- the error string to set
  setError = (error: string) => {
    this.error = error;
  }

  // Set current imparter and authenticates
  // @param {Imparter} imparter - to set
  setCurrentImparter = async (imparter: Imparter) => {
    const oldInfo = {...this.paymentsInfo};
    try {
      this.#outstandingCache = {}; // reset outstanding cache
      this.paymentsInfo.currentImparter = imparter;
      this.paymentsInfo.currentCurrency = CURRENCY_BY_IMPARTER[imparter];
      this.paymentsInfo.ledgerUri = imparter === Imparter.unknown ? undefined : oh$.getOverhideRemunerationAPIUri();

      if (imparter !== Imparter.unknown && !this.#isAuthenticated()) {
        await this.#authenticate(imparter);
      }
      this.#pingApplicationState();
    }
    catch (e) 
    {
      this.paymentsInfo = {...oldInfo};
      this.error = e;
    }
  }

  // Sets credentials secret key for non-wallet workflow
  // @param {string} new key - to set
  setSecretKey = async (newKey: string) => {
    const oldInfo = {...this.paymentsInfo};
    try {
      const imparter = this.#getCurrentImparter();
      if (imparter === Imparter.unknown) this.error = 'cannot set secret, imparter not set';
      if (!this.paymentsInfo.wallet[imparter]) {
        await oh$.setCredentials(imparter, {secret: newKey});
      }
    } catch (error) {
      this.paymentsInfo = {...oldInfo};
      this.error = `Paste or generate a key.`;
    }
  }

  // Generates new PKI keys for non-wallet workflows.
  // Updates paymentsInfo provided by service.
  // No-op if current currency has a wallet set.
  generateNewKeys = async () => {
    const oldInfo = {...this.paymentsInfo};
    try {
      const imparter = this.#getCurrentImparter();
      if (imparter === Imparter.unknown) this.error = 'cannot generate new key, imparter not set';
      if (!this.paymentsInfo.wallet[imparter]) {
        await oh$.generateCredentials(imparter,null);
      }
    } catch (error) {
      this.paymentsInfo = {...oldInfo};
      this.error = `${typeof error === 'object' && 'message' in error ? error.message : error}`;
    }
  }

  // @returns {Currency} 
  #getCurrentCurrency = () => {
    return this.paymentsInfo.currentCurrency || this.paymentsInfo.defaultCurrency;
  }  

  // @returns {Imparter} 
  #getCurrentImparter = () => {
    return this.paymentsInfo.currentImparter || this.paymentsInfo.defaultImparter;
  }

  // Is current crednetial authenticatd against the current currency's ledger? 
  // @returns {bool} after checking signature and whether ledger has any transactions (to anyone)
  #isAuthenticated = () => {
    const imparter = this.#getCurrentImparter();
    return this.paymentsInfo.isOnLedger[imparter];
  }

  #authenticate = async (imparter: Imparter) => {
    if (imparter !== this.#getCurrentImparter()) throw `imparter mismatch in #authenticate`;
    this.#outstandingCache = {}; // reset outstanding cache
    if ((!this.paymentsInfo.payerSignature 
          || !this.paymentsInfo.messageToSign)) {
      await this.#sign();
    }
    await this.#isOnLedger()  
  }

  // cache of outstanding results
  #outstandingCache: {[key: string]: number} = {};

  // Get balance outstanding for authorization as per current currency.
  // @param {number} costInDollars - amount expected to tally (in dollars or ethers)
  // @param {string} to - address of recepient
  // @param {number} minutes - number of minutes to look back (since) on the ledger
  // @returns {number} differnce in dollars, $0 if authorized, null if not yet known.
  getOutstanding = (costInDollars: number, to: string, tallyMinutes: number): number | null => {
    const currency = this.#getCurrentCurrency();
    const imparter = this.#getCurrentImparter();
    if (currency === Currency.unknown || imparter === Imparter.unknown) throw `unknown current currency/imparter in getOutstanding`;
    const key = `${imparter}_${costInDollars}_${to}_${tallyMinutes}`;
    console.log(`#getOutstanding(${key}) = ${this.#outstandingCache[key]}`);
    if (key in this.#outstandingCache) {
      return this.#outstandingCache[key];
    }
    delete this.#outstandingCache[key]; // for re-requests
    (async () => {
      const oldInfo = {...this.paymentsInfo};
      try {
        let tally;
        const creds = await oh$.getCredentials(imparter);
        if (!creds || !creds.address) {
          this.#outstandingCache[key] = costInDollars;
          this.#pingApplicationState();
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
        this.#outstandingCache[key] = delta;
        this.#pingApplicationState();
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
  topUp = async (amountDollars: number, toAddress: string) => {
    const currency = this.#getCurrentCurrency();
    const imparter = this.#getCurrentImparter();
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
      this.#outstandingCache = {}; // reset outstanding cache
      this.#pingApplicationState();
    } catch (error) {
      this.paymentsInfo = {...oldInfo};
      this.paymentsInfo.pendingTransaction[imparter] = false;
      this.error = `${typeof error === 'object' && 'message' in error ? error.message : error}`;
    }
  }

  // Trigger redraw via application state update
  #pingApplicationState = () => {
    this.paymentsInfo = {...this.paymentsInfo, time: new Date()};
  }
  
  // Check current credentials for any transactions on current ledger.
  #isOnLedger = async () => {
    try {
      const currency = this.#getCurrentCurrency();
      const imparter = this.#getCurrentImparter();
      this.paymentsInfo.isOnLedger[imparter] = false;
      if (await oh$.isOnLedger(imparter)) {
        this.paymentsInfo.isOnLedger[imparter] = true;
      }
    } catch (error) {
      throw `${typeof error === 'object' && 'message' in error ? error.message : error}`;
    }
  }

  // Sign a challenge with current credentials and set to the payments info.
  #sign = async () => {
    try {
      const challenge = this.makePretendChallenge();
      const imparter = this.#getCurrentImparter();
      var signature = await oh$.sign(imparter, challenge);
      this.#setSignature(challenge, signature);
    } catch (error) {
      this.#setSignature(null, null);
      throw `${typeof error === 'object' && 'message' in error ? error.message : error}`;
    }
  }

  // Set imparter enabled status
  // @param {Imparter} imparter - to set 
  // @para {bool} value - to set
  #setImparterEnabled = (imparter: Imparter, value: boolean) => {
    this.paymentsInfo.enabled[imparter] = value;
    this.#pingApplicationState();
  }

  // Set wallet
  // @param {Imparter} imparter - to set 
  // @param {boolean} value - to set
  #setWallet = (imparter: Imparter, value: boolean) => {
    this.paymentsInfo.wallet[imparter] = value;
    this.#pingApplicationState();
  }

  // Set signature
  // @param {string} messageToSign - message to sign
  // @param {string} payerSignature - signed message
  #setSignature = (messageToSign: string | null, payerSignature: string | null) => {
    messageToSign ? this.paymentsInfo.messageToSign = messageToSign : delete this.paymentsInfo.messageToSign;
    payerSignature ? this.paymentsInfo.payerSignature = payerSignature : delete this.paymentsInfo.payerSignature;
    this.#pingApplicationState();
  }

  // Set credentials
  // @param {Imparter} imparter - to set 
  // @param {string} payerAddress - (out only) payer's public address as set by service
  // @param {string} payerPrivateKey - payer's private key (receipt code) iff not using wallet, null if using wallet
  #setCredentials = async (imparter: Imparter, payerAddress: string, payerPrivateKey: string | null) => {
    this.paymentsInfo.payerAddress = payerAddress;
    payerPrivateKey ? this.paymentsInfo.payerPrivateKey = payerPrivateKey : delete this.paymentsInfo.payerPrivateKey;
    delete this.paymentsInfo.messageToSign;
    delete this.paymentsInfo.payerSignature;    
    await this.#authenticate(imparter);
    this.#pingApplicationState();
  }

  // Clear credentials and wallet if problem
  #clear = (imparter: Imparter) => {
    this.paymentsInfo.enabled[imparter] = false;
    delete this.paymentsInfo.wallet[imparter];
    delete this.paymentsInfo.payerAddress;
    delete this.paymentsInfo.payerPrivateKey;
    delete this.paymentsInfo.messageToSign;
    delete this.paymentsInfo.payerSignature;    
    this.#pingApplicationState();
  }

  /**
   * Retrieve API access token
   * 
   * @returns {string} the token.
   */
  #getToken = async () => {
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
  #init = () => {

    // Ensure oh$ has a token.
    (async () => {
      oh$.enable(await this.#getToken());
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
            if (NETWORKS_BY_IMPARTER[this.#allowNetworkType][imparter] === network.name) {
              this.#setImparterEnabled(imparter, true);
              this.#setWallet(imparter, e.isPresent);
              await this.#setCredentials(imparter, credentials.address, null);
            } else {
              // wrong network
              this.#clear(imparter);
              this.error = `Network misconfiguration: (expected:${NETWORKS_BY_IMPARTER[this.#allowNetworkType][imparter]}) (seen:${network.name})`;
              return;
            }
          } else {
            // no wallet no ether payments
            this.#clear(imparter);
          }
          // dollars always available, ethers enabled when network detected below  
          break;
        case 'ohledger-web3':
          this.#setWallet(imparter, e.isPresent);
          await this.#setCredentials(imparter, credentials.address, null);
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
          if (e && e.name && NETWORKS_BY_IMPARTER[this.#allowNetworkType][imparter] !== e.name) {
            // wrong network
            this.#clear(imparter);
            this.error = `Network misconfiguration: (expected:${NETWORKS_BY_IMPARTER[this.#allowNetworkType][imparter]}) (seen:${e.name})`;
            return;
          }
          break;
        case Imparter.ohledger:
        case Imparter.ohledgerWeb3:
        case Imparter.ohledgerSocial:
          if ('currency' in e
            && 'mode' in e
            && `${e.currency}:${e.mode}` === NETWORKS_BY_IMPARTER[this.#allowNetworkType][imparter]) {
            this.#setImparterEnabled(imparter, true);
            break;
          }
          // wrong network
          this.#clear(imparter);
          this.error = `overhide-ledger network misconfig: (expected:${NETWORKS_BY_IMPARTER[this.#allowNetworkType][imparter]}) (seen: ${e.currency}:${e.mode})`;
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

      await this.#setCredentials(imparter, e.address, 'secret' in e ? e.secret : null);
    });

    oh$.addEventListener('onWalletChange', async (e: any) => {
      this.#outstandingCache = {};
      this.#pingApplicationState();
    });

    oh$.setNetwork('ohledger', { currency: 'USD', mode: this.#allowNetworkType ? 'test' : 'prod' }); 
    oh$.setNetwork('ohledger-web3', { currency: 'USD', mode: this.#allowNetworkType ? 'test' : 'prod' });
    oh$.setNetwork('ohledger-social', { currency: 'USD', mode: this.#allowNetworkType ? 'test' : 'prod' });
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
