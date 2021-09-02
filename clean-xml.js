const fs = require('fs');
const _ = require('lodash');
const utils = require('./utils/utils');

const cleanXML = async (xml) => {
  return new Promise((resolve) => {
    const urls = [];
    fs.readFile(xml, 'utf8', function (err, data) {
      const array = data.split('\n').map((e) => e.trim());

      array.forEach((line) => {
        if (
          line.substring(0, 10) === '<loc>https' &&
          line.split('https://yoopies.fr/')[1].split('-')[0] !== 'cours'
        )
          urls.push({
            url: line.substring(5, line.length - 6),
            id: line.substring(5, line.length - 6).split('/')[
              line.substring(5, line.length - 6).split('/').length - 1
            ],
          });
      });
      //   console.log(urls, urls.length);
      resolve(urls);
    });
  });
};

const deleteDoublon = async (csv) => {
  const array = await utils.read(csv);
  const arrayFiltred = _.uniqBy(array, (e) => e.id);
};

const main = async () => {
  for await (const xml of _.range(36)) {
    const urls = await cleanXML(`data/yp/xml${xml + 1}`);

    console.log(urls, urls.length);
    await utils.convertToCSV(urls, 'data/yp/urls-reste.csv');
  }
};

main();
