const allow_cors = require('cors')();
const http = require('http');
const express = require('express');

const PORT = 8100;

const RunFeature = require('./RunFeature/index.js');
const GetSchedule = require('./GetSchedule/index.js');

// MIDDLEWARE

const app = express();
app.use(express.json());
app.use(allow_cors);

// ROUTES

/**
 * @param {query:..} req -- request object whereby query should have:
 *   - 'featureName', see keys in 'feesSchedule.js' -- the gated feature name
 *   - 'currency', one of 'dollars', 'ethers', 'bitcoins'
 *   - 'address', ledger specific address
 *   - 'message', message signed to prove ownership of 'address'
 *   - 'signature', signature of 'message' for 'address'
 * @param {body:..} res -- will contain the response 'res' which is a JSON payload `{featureUsed:true|false}` 
 *   indicating whether the feature was "make-pretend" used by the back-end
 */
app.get('/RunFeature',  async (req, res) => {
  const context = {};
  await RunFeature(context, req);
  res.set(context.res.headers);
  res.status(context.res.status).send(context.res.body);
});

/**
 * @param {query:..} req -- request object, not parsed
 * @param {res:..} context -- will contain the response 'res' which is a JSON payload `{schedule:..}` 
 *   which is the fees schedule as per `SharedCode/feesSchedule.js`
 */
app.get('/GetSchedule',  async (req, res) => {
  const context = {};
  await GetSchedule(context, req);
  res.set(context.res.headers);
  res.status(context.res.status).send(context.res.body);
});

// SERVER LIFECYCLE

const server = http.createServer(app);

server.listen(PORT);