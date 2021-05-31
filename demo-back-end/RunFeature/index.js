var feesSchedule = require('../SharedCode/feesSchedule.js');
var overhide = require('../SharedCode/overhide.js');

/**
 * @param {res:..} context -- will contain the response 'res' which is a JSON payload `{featureUsed:true|false}` 
 *   indicating whether the feature was "make-pretend" used by the back-end
 * @param {query:..} req -- request object whereby query should have:
 *   - 'featureName', see keys in 'feesSchedule.js' -- the gated feature name
 *   - 'currency', one of 'dollars', 'ethers', 'bitcoins'
 *   - 'address', ledger specific address
 *   - 'message', message signed to prove ownership of 'address'
 *   - 'signature', signature of 'message' for 'address'
 */
module.exports = async function (context, req) {

  let featureUsed = false;

  const featureName = req.query.featureName;
  const currency = req.query.currency;
  const address = req.query.address;
  const isTest = req.query.isTest;
  const message = Buffer.from(req.query.message, 'base64').toString();
  const signature = req.query.signature;
  const to = feesSchedule[featureName].address[currency];
  const costDollars = +feesSchedule[featureName].costDollars;
  const expiryMinutes = +feesSchedule[featureName].expiryMinutes || null;

  switch(currency) {
    case 'ethers':
      var uri = isTest ? 'https://rinkeby.ethereum.overhide.io' : 'https://ethereum.overhide.io';
      break;
    case 'bitcoins':
      var uri = isTest ? 'https://test.bitcoin.overhide.io' : 'https://bitcoin.overhide.io';
      break;
    case 'dollars':
      var uri = isTest ? 'https://test.ledger.overhide.io/v1' : 'https://ledger.overhide.io/v1';
      break;
    default:
      throw `invalid currency: ${currency}}`;
  } 

  try {
    if (await overhide.isValidOnLedger(uri, address, message, signature)
        && (cost === 0 
          || await overhide.isCostCovered(uri, address, to, costDollars, expiryMinutes))) {
      featureUsed = true;
    }
  } catch (e) {
    console.log(e);
  }

  if (featureUsed) {
    context.res = {
      status: 200,
      body: {
        featureUsed: true
      },
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }
  else {
    context.res = {
      status: 401,
      body: "Unauthorized by Ledger-Based AuthZ"
    };
  }
};