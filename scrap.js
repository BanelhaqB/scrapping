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
        'User-Agent': randomUA.getRandom(),
        'Content-Type': `application/${config.contentType}`,
        Accept: '*/*',
        'Cache-Control': 'no-cache',
        cookie:
          'Commerce_TestPersistentCookie=TestCookie; Commerce_TestSessionCookie=TestCookie; OneWeb=DivisionId=dental&sid=JXy4OeORddGlv2MGyXXxwnshYFapdqIyqmWo8rev8D8%3d&theme=Harmony; ASP.NET_SessionId=5t2l05e1w1haubnwzg0m4jni; HSCSProfileNonHttpOnly=PreferredCultureId=fr-FR; TestCookie=ok; ak_bmsc=CDBD33938561C4EC5AAE213586A1433F~000000000000000000000000000000~YAAQFLcQAhTAQxh6AQAACmi0LQwR2a/UVVlbyc74nizjt687mBm9oXGiKlgDdadxwtfNnVfG6K89M7XbxpuTbXBrrqRmnMxICBHUg1JCumLMe1hoS/9uDHxUYymAnx2hgHoOEqa56iGVci67OsMLTo8L5qYI9GmB/hWEyxUOaJfgDBDn5jbtAlIV+R0nyGF5jfNjIi4OdlTCYqDtQN+o6edAi3H/73ZNMR7Z5157NTduDrHmJPteQcbxD2q+7kq4Gz2q2PcfFeM3HGKPI/2J/b5PL9kOfY69fzdO2Mp/AmWh4IfPrYm5+rwHzb1M3Eg0i+NGcuHUNzctQihq2D1N1ljQFTJj0qRv3OttWH1C8G5ld1JsDbbBdgJMATVqWIDo; HSCSProfile=HSCSProfile=%7bae8e70e7-7f2b-4a5e-9078-94337ee8202d%7d&ExchangeMessage=; CampaignHistory=; OneWebSessionCookie=GetNextCounter=160&AccordianMenuActiveIndex=0; bm_mi=98E34CEFEBA68BBB7FED0A098EFA0288~C1pDnnjPQUfzBB2psW3k2PwjOuRpN8qDbylYMAOWpYbIf9zskhKvxVShbt+ECZ460KdPSS6hAgb4ENCCJVYs6BM6rnqa6l5q9VaZA5cGfxInQyVeOOdvS4U34nUq891d1bzB+dIBDQFP6TYudGZcq4bH22k7PIjyuRwjyMmZH7f6Al5UvoDp5qFnO2UOzmQC96tlMEFXs2erql1/hkyBhOpl1K5aTnslDeHZty3PgAaJJcYsDuPUnmSxnyb2nwcxsQUswTNBazJEEzj0LzVFkQ==; bm_sv=F24A3B8929B20DB343BDFE66EE39DAF0~wTGcTeF/6PM2TUisnEa1S3CPfcCAeXNi1h/wWDD/dk/sbt1ceVETRCsuyVls9YIePYquxY4s9T6rw4F3LOupRdnePA7U2KJJBF4TV/xZ07kJCUjkRI0+vCoBOkVc/GjF8hOyOMWzqPr0FvxfbwVE9o5BlxCGWIhHFZE/3oy5gnA=',
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
