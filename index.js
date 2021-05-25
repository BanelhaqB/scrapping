let cheerio = require('cheerio');
const cheerioAdv = require('cheerio-advanced-selectors');
const ObjectsToCsv = require('objects-to-csv');
// const { resolve } = require('path');
// const scrap = require('./scrap');
const megadental = require('./scripts/megadental');
const ico = require('./scripts/ico');

// console.log(ffa);
cheerio = cheerioAdv.wrap(cheerio);

const main = async () => {
  let data;
  switch (process.env.SITE) {
    case 'megadental':
      data = await megadental.scrapProductsData();
      break;
    case 'ico':
      data = await ico.scrap();
      break;
    default:
      console.log('Site not supported yet');
      break;
  }

  console.log(`Done! ${data.length} items imported succefuly`);
};

main();
