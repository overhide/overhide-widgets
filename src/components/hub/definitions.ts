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
  ethers = 'ethers'
}

export enum Imparter {
  unknown = 'unknown',
  ohledger = 'ohledger',
  ohledgerWeb3 = 'ohledger-web3',
  ohledgerSocial = 'ohledger-social',
  ethWeb3 = 'eth-web3',
  btcManual = 'btc-manual'
}

export const NETWORKS_BY_IMPARTER: {[which in NetworkType]: {[what in Imparter]: string}} = {
  'test': {
    'eth-web3': 'rinkeby',
    'ohledger': 'USD:test',
    'ohledger-web3': 'USD:test',
    'ohledger-social': 'USD;test',
    'btc-manual': '',
    unknown: ''
  },
  'prod': {
    'eth-web3': 'main',
    'ohledger': 'USD:prod',
    'ohledger-web3': 'USD:prod',
    'ohledger-social': 'USD:prod',
    'btc-manual': '',
    unknown: ''
  }
};

export interface Info {
  imparter: Imparter,
  currency: Currency,
  address: string,
  message: string,
  signature: string,
  ledgerUri: string
}

export interface PaymentsInfo {

  /**
   * public function: returns an object with currency ('dollars' or 'ethers'), address, message, signature, ledgerUri
   * @returns {Info}
   */
  getInfo: () => Info, 

  /**
   * Get balance outstanding for authorization as per current currency.
   * @param {number} cost - amount expected to tally (in dollars or ethers)
   * @param {string} to - address of recepient
   * @param {number} minutes - number of minutes to look back (since) on the ledger
   * @returns {number} differnce in dollars or ethers, $0 if authorized, null if not yet known.
   */
  getOutstanding: (cost: number, to: string, minutes: number) => number, 

  /**
   * Do the actual topup to authorize
   * @param {number} amount - amount to topup (in dollars or ethers), can be 0 to just create a free transaction for getting on ledger
   * @param {} toAddress - to pay
   */
  topUp: (amount: number, toAddress: string) => void,

  isAuthenticated: boolean,                 // public function: is current crednetial authenticatd against the current currency's ledger? 
  enabled: {[which in Imparter]: boolean},  // keyed by (currentImparter || defaultImparter); informs if currency available, e.g. wallet availble
  wallet: {[which in Imparter]: boolean},   // keyed by (currentImparter || defaultImparter); informs of currently used wallet, or null
  isOnLedger: {[which in Imparter]: boolean}, // keyed by (currentImparter || defaultImparter); informs if currently used credentials are on ledger
  pendingTransaction: {[which in Imparter]: boolean}, // keyed by (currentImparter || defaultImparter); informs amount of currently pending transaction or null
  defaultImparter: Imparter                 // default payment imparter
  currentImparter: Imparter                 // chosen payment imparter
  defaultCurrency: Currency                 // default payment currency, either 'dollars' or 'ethers'
  currentCurrency: Currency                 // chosen payment currency, either 'dollars', 'ethers', or null
  payerAddress?: string,                     // (out only) payer's public address as set by service
  payerPrivateKey?: string,                  // payer's private key (receipt code) iff not using wallet, null if using wallet
  payerSignature?: string,                   // signed `messageToSign` by payer
  messageToSign?: string,                    // message to sign into `payerSignature`
  time: Date                                // just a timestamp for refresh
}