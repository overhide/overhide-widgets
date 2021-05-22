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

  /**
   * Sets an error from outside.
   */
  setError: (error: string) => void,

  /**
   * Sets the current imparter we're working with.
   */
  setImparter: (imparter: Imparter) => void,

  /**
   * Sets the secret key, if any, only useful for some imparters.
   */
  setSecretKey: (key: string) => void,

  /**
   * Get balance outstanding for authorization as per current currency.
   * @param {number} costInDollars - amount expected to tally (in US dollars)
   * @param {string} to - address of recepient
   * @param {number} minutes - number of minutes to look back (since) on the ledger
   * @returns {number} differnce in US dollars, $0 if authorized, null if not yet known.
   */
  getOutstanding: (costInDollars: number, to: string, minutes: number) => number | null, 

  /**
   * Do the actual topup to authorize
   * @param {number} amountDollars - amount to topup in US dollars, can be 0 to just create a free transaction for getting on ledger
   * @param {} toAddress - to pay
   */
  topUp: (amountDollars: number, toAddress: string) => void,

  isAuthenticated: boolean,                 // public function: is current crednetial authenticatd against the current currency's ledger? 
  enabled: {[which in Imparter]: boolean},  // keyed by (currentImparter || defaultImparter); informs if currency available, e.g. wallet availble
  wallet: {[which in Imparter]: boolean},   // keyed by (currentImparter || defaultImparter); informs of currently used wallet
  isOnLedger: {[which in Imparter]: boolean}, // keyed by (currentImparter || defaultImparter); informs if currently used credentials are on ledger
  pendingTransaction: {[which in Imparter]: boolean}, // keyed by (currentImparter || defaultImparter); informs amount of currently pending transaction or null
  defaultImparter: Imparter                 // default payment imparter
  currentImparter: Imparter                 // chosen payment imparter
  defaultCurrency: Currency                 // default payment currency, either 'dollars' or 'ethers'
  currentCurrency: Currency                 // chosen payment currency, either 'dollars', 'ethers', or null
  payerAddress?: string,                    // (out only) payer's public address as set by service
  payerPrivateKey?: string,                 // payer's private key (receipt code) iff not using wallet, null if using wallet
  payerSignature?: string,                  // signed `messageToSign` by payer
  messageToSign?: string,                   // message to sign into `payerSignature`
  ledgerUri?: string,                        // URI of overhide API for imparter
  time: Date                                // just a timestamp for refresh
}