const puppeteer = require('puppeteer');
const path = require('path');

const props = {
  debug: {
    headless: false,
    timeout: `${24*60*60}s`
  },
  run: {
    headless: true,
    timeout : '5s'    
  }
}

// to debug tests with browser -- e.g. put breakpoints and inspect browser console:
//
// [1] change the `env` below from 'run' to 'debug' 
// [2] put a `await stop();` statement in the test's `go` function

const env = props['debug'];

async function go (fn) {
  const browser = await puppeteer.launch({ headless: env.headless, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`http://localhost:8099/test/html/smoke.html`);
  await page.waitForSelector('#overhide-widgets-demo')
  await page.evaluate(fn);
}

describe('ledgers.js smoke', function() {
  this.timeout(env.timeout);

  it('finds my-try', async () => {
    await go(async () => {
      const handle = document.querySelector("#overhide-widgets-demo my-try#my-try").shadowRoot.querySelector("div > h3")
      chai.assert(handle != null);
    });
  });
});