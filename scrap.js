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
        // cookie:
        //   'session-3=800abbf6a2f8022194ff1e3635c5e255573f695e48f2abe4f54080810cf0f3e4; nocache=detail-3',
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
