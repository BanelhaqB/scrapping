let cheerio = require('cheerio');
const cheerioAdv = require('cheerio-advanced-selectors');
const ObjectsToCsv = require('objects-to-csv');
// const { resolve } = require('path');
// const scrap = require('./scrap');
const megadental = require('./scripts/megadental');

// console.log(ffa);
cheerio = cheerioAdv.wrap(cheerio);

const main = async () => {
  let data;
  switch (process.env.SITE) {
    case 'megadental':
      data = await megadental.getMissingproducts();
      break;
    default:
      console.log('Site not supported yet');
      break;
  }

  // console.log(`Done! ${data.length} items imported succefuly`);
};

main();
