import request from 'request';
import cheerio from 'cheerio';
import cheerioAdv from 'cheerio-advanced-selectors';
import randomUA from 'random-fake-useragent';

const cheerioWrapped = cheerioAdv.wrap(cheerio);

const scraper = function (req, config) {
  req(
    {
      url: config.url,
      headers: {
        Referer: config.referer ? config.referer : config.url,
        // Host: 'www.dentalversender.de',
        'User-Agent': randomUA.getRandom(),
        // 'Content-Type': `application/${config.contentType}`,
        Accept: '*/*',
        'Cache-Control': 'no-cache',
        Cookie: config.cookie,
        Host: config.host,
      },

      form: config.form,
      body: config.body,
    },
    function (error, response, html) {
      if (!error) {
        const $ = cheerioWrapped.load(html);
        config.onSuccess($, response, html, config);
      } else {
        config.onError(error, response, html, config);
      }
    }
  );
};

const scrap = {
  get: (config) => scraper(request.get, config),
  post: (config) => scraper(request.post, config),
};

export default scrap;
