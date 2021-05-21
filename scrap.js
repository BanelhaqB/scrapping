const request = require('request');
let cheerio = require('cheerio');
const cheerioAdv = require('cheerio-advanced-selectors');
const randomUA = require('random-fake-useragent');

cheerio = cheerioAdv.wrap(cheerio);

const scrap = function (req, config) {
  req(
    {
      url: config.url,
      headers: {
        Referer: config.referer ? config.referer : config.url,
        'User-Agent': randomUA.getRandom(),
        'Content-Type': `application/${config.contentType}`,
        Accept: '*/*',
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
