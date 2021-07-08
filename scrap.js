const request = require('request');
let cheerio = require('cheerio');
const cheerioAdv = require('cheerio-advanced-selectors');
const randomUA = require('random-fake-useragent');
const { cookie } = require('request');

cheerio = cheerioAdv.wrap(cheerio);

const scrap = function (req, config) {
  req(
    {
      url: config.url,
      headers: {
        Referer: config.referer ? config.referer : config.url,
        Host: 'www.dentalversender.de',
        'User-Agent': randomUA.getRandom(),
        // 'Content-Type': `application/${config.contentType}`,
        Accept: '*/*',
        'Cache-Control': 'no-cache',
        cookie:
          'session-3=800abbf6a2f8022194ff1e3635c5e255573f695e48f2abe4f54080810cf0f3e4; nocache=detail-3',
      },
      form: config.form,
      body: config.body,
    },
    function (error, response, html) {
      if (!error) {
        const $ = cheerio.load(html);
        config.onSuccess($, response, html, config);
      } else {
        config.onError(error, response, html, config);
      }
    }
  );
};

module.exports = {
  get: (config) => scrap(request.get, config),
  post: (config) => scrap(request.post, config),
};
