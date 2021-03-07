const puppeteer = require('puppeteer');
const path = require('path');

async function go (fn) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`file:${path.join(__dirname, '../html/index.html')}`);
  await page.evaluate(fn);
}

describe('ledgers.js smoke', function() {
  this.timeout('20s');

  it('finds my-try', async () => {
    await go(async () => {
      const handle = document.querySelector("body > fast-design-system-provider > my-try#my-try").shadowRoot.querySelector("div > h3")
      chai.assert(handle != null);
    });
  });
});