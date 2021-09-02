let cheerio = require('cheerio');
const cheerioAdv = require('cheerio-advanced-selectors');
const ObjectsToCsv = require('objects-to-csv');
// const { resolve } = require('path');
// const scrap = require('./scrap');
const megadental = require('./scripts/megadental');
const dpi = require('./scripts/dpi');
const ico = require('./scripts/ico');
const hs = require('./scripts/hs');
const pd = require('./scripts/pd');
const dv = require('./scripts/dv');
const kp = require('./scripts/kp');
const yp = require('./scripts/yp');

// console.log(ffa);
cheerio = cheerioAdv.wrap(cheerio);

const main = async () => {
  let data;
  switch (process.env.SITE) {
    case 'megadental':
      data = await megadental.getMissingproducts();
      break;
    case 'dpi':
      data = await dpi.scrapProductsData();
      break;
    case 'ico':
      data = await ico.scrap();
      break;
    case 'hs':
      data = await hs.scrapProductsData();
      break;
    case 'pd':
      data = await pd.scrapProductsData();
      break;
    case 'dv':
      data = await dv.scrapProductsData();
      break;
    case 'kp':
      data = await kp.scrapProductsData();
      break;
    case 'yp':
      data = await yp.scrapProductsData();
      break;
    default:
      console.log('Site not supported yet');
      break;
  }

  console.log(`Done! ${data.length} items imported succefuly`);
};

main();
