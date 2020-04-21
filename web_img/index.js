#!/usr/bin/env node

const { argv } = require('yargs')
  .usage('Usage: $0 [options]')
  .example('$0 -u http://example.com', 'render HTML from webpage')
  .example('$0 -u /path/to.file', 'render HTML from file')
  .options({
    'url': {
      alias: 'u',
      describe: 'render URL',
      demandOption: true
    },
    'width': {
      alias: 'x',
      describe: 'width',
      default: 300,
      type: 'number'
    },
    'height': {
      alias: 'y',
      describe: 'height',
      default: 400,
      type: 'number'
    },
    'selector': {
      describe: 'scroll to selector',
      type: 'string'
    },
    'scale': {
      describe: 'viwport scale',
      default: 1,
      type: 'number'
    },
    'path': {
      alias: 'p',
      describe: 'save path',
      default: '/tmp/webimg.png'
    },
    'disableJs': {
      describe: 'disable javascript',
      default: false,
      type: 'boolean'
    },
    'sp': {
      describe: 'emulate smartphone',
      default: false,
      type: 'boolean'
    },
    'debug': {
      describe: 'debug log',
      default: false,
      type: 'boolean'
    },
    'timeout': {
      describe: 'browser navigation timeout(ms)',
      default: 3000000,
      type: 'number'
    }
  });

const puppeteer = require('puppeteer');
const { exec } = require('child_process');

(async () => {
  try {
    argv.debug && console.log('browser launch.');

    const width = argv.x * argv.scale;
    const height = argv.y * argv.scale;

    const browser = await puppeteer.launch({
      product: 'chrome',
      executablePath: '/usr/bin/chromium-browser',
      headless: true
    });
    const page = await browser.newPage();
    argv.disableJs && await page.setJavaScriptEnabled(false);
    page.setDefaultNavigationTimeout(argv.timeout);
    if (argv.sp) {
      // iPhone X/Chrome
      const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/77.0.3865.69 Mobile/15E148 Safari/605.1';
      await page.emulate({
        viewport: {
          width,
          height,
          isMobile: true
        },
        userAgent: UA
      });
    } else {
      await page.setViewport({ width, height });
    }

    argv.debug && console.log('goto', argv.u);
    await page.goto(argv.u);

    if (argv.selector) {
      argv.debug && console.log('scroll', argv.selector);
      await page.evaluate((selector) => {
        document.querySelector(selector).scrollIntoView();
      }, argv.selector);
    }
    argv.debug && console.log('take screenshot.', argv.p);
    await page.screenshot({path: argv.p});
  
    browser.close();

    argv.debug && console.log('show img.');
    const { stdout, stderr } = exec(`${process.cwd()}/../show_img/show_img.py ${argv.p}`);
    //console.log(stdout);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

