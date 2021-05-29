// Map of oh$ imparter tags to allowed networks
//
// see https://overhide.github.io/ledgers.js/docs/ledgers.js-rendered-docs/index.html#getimpartertags

export enum NetworkType {
  test = 'test',
  prod = 'prod'
}

export enum Currency {
  unknown = 'unknown',
  dollars = 'dollars',
  ethers = 'ethers',
  bitcoins = 'bitcoins'
}

export enum Imparter {
  unknown = 'unknown',
  ohledger = 'ohledger',
  ohledgerWeb3 = 'ohledger-web3',
  ohledgerSocial = 'ohledger-social',
  ethWeb3 = 'eth-web3',
  btcManual = 'btc-manual'
}

export enum Social {
  unknown = 'unknown',
  microsoft = 'microsoft',
  google = 'google'
}

export const CURRENCY_BY_IMPARTER: {[what in Imparter]: Currency} = {
  'eth-web3': Currency.ethers,
  'ohledger': Currency.dollars,
  'ohledger-web3': Currency.dollars,
  'ohledger-social': Currency.dollars,
  'btc-manual': Currency.bitcoins,
  unknown: Currency.unknown
};

export const NETWORKS_BY_IMPARTER: {[which in NetworkType]: {[what in Imparter]: string}} = {
  'test': {
    'eth-web3': 'rinkeby',
    'ohledger': 'USD:test',
    'ohledger-web3': 'USD:test',
    'ohledger-social': 'USD;test',
    'btc-manual': 'test',
    unknown: ''
  },
  'prod': {
    'eth-web3': 'main',
    'ohledger': 'USD:prod',
    'ohledger-web3': 'USD:prod',
    'ohledger-social': 'USD:prod',
    'btc-manual': 'prod',
    unknown: ''
  }
};

export interface PaymentsInfo {
  enabled: {[which in Imparter]: boolean},  // keyed by (currentImparter || defaultImparter); informs if currency available, e.g. wallet availble
  wallet: {[which in Imparter]: boolean},   // keyed by (currentImparter || defaultImparter); informs of currently used wallet
  isOnLedger: {[which in Imparter]: boolean}, // keyed by (currentImparter || defaultImparter); informs if currently used credentials are on ledger
  pendingTransaction: {[which in Imparter]: boolean}, // keyed by (currentImparter || defaultImparter); informs amount of currently pending transaction or null

  payerAddress: {[which in Imparter]: string | null},            // (out only) payer's public address as set by service
  payerPrivateKey: {[which in Imparter]: string | null},         // payer's private key (receipt code) iff not using wallet, null if using wallet
  payerSignature: {[which in Imparter]: string | null},          // signed `messageToSign` by payer
  messageToSign: {[which in Imparter]: string | null},           // message to sign into `payerSignature`

  currentImparter: Imparter,                // chosen payment imparter
  currentCurrency: Currency,                // chosen payment currency, either 'dollars', 'ethers', or null
  currentSocial: Social,                    // chosen social provider
  time: Date                                // just a timestamp for refresh
}

export interface IOverhideHub {
  // @param {Imparter} imparter - to set
  // @returns {string} the network name
  getNetwork: (imparter: Imparter) => string;

  // @param {string} error -- the error string to set
  setError: (error: string) => void,

  // Sets credentials secret key for non-wallet workflow
  // @param {Imparter} imparter - to set 
  // @param {string} new key - to set
  // @returns {Promise<boolean>} -- whether successful
  setSecretKey: (imparter: Imparter, newKey: string) => Promise<boolean>,

  // Sets credentials address for non-wallet workflow
  // @param {Imparter} imparter - to set 
  // @param {string} newAddress - to set
  // @returns {Promise<boolean>} -- whether successful
  setAddress: (imparter: Imparter, newAddress: string) => Promise<boolean>,

  // Generates new PKI keys for non-wallet workflows.
  // Updates paymentsInfo provided by service.
  // No-op if current currency has a wallet set.
  // @param {Imparter} imparter - to set 
  generateNewKeys: (imparter: Imparter) => void,

  // Set current imparter and authenticates
  // @param {Imparter} imparter - to set
  // @returns {bool} true if success or cancel, false if some problem
  setCurrentImparter: (imparter: Imparter) => Promise<boolean>,

  // Set social provider if any
  // @param {Social} social provider to set
  setCurrentSocial: (social: Social) => void,

  // Is current crednetial authenticatd against the current currency's ledger? 
  // @param {Imparter} imparter - to set 
  // @returns {boolean} after checking signature and whether ledger has any transactions (to anyone)
  isAuthenticated: (impater: Imparter) => boolean,

  // Get balance outstanding for authorization as per current currency.
  // @param {number} costInDollars - amount expected to tally (in dollars or ethers)
  // @param {string} to - address of recepient
  // @param {number} minutes - number of minutes to look back (since) on the ledger
  // @returns {number} differnce in dollars, $0 if authorized, null if not yet known.
  getOutstanding: (costInDollars: number, to: string, tallyMinutes: number) => number | null,

  // Do the actual topup to authorize
  // @param {number} amountDollars - amount to topup in US dollars, can be 0 to just create a free transaction for getting on ledger
  // @param {} toAddress - to pay
  topUp: (amountDollars: number, toAddress: string) => void

  // Get URL for imparter
  // @param {Imparter} imparter - to set 
  // @return {string} the URL
  getUrl: (impater: Imparter) => string;

  // Clear and log-out of the provided imparter.
  // @param {Imparter} imparter - to set 
  clear: (imparter: Imparter) => void;

  // Get the current info
  // @returns {PaymentsInfo} -- the current info
  getInfo: () => PaymentsInfo;
}