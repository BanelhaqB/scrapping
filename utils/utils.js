/* eslint-disable import/extensions */
import ObjectsToCsv from 'objects-to-csv';
import csvParser from 'csv-parser';
import fs from 'fs';
// import { } = require('path';
import scraper from '../scrap.js';

const utils = {
  convertToCSV: async (obj, path) => {
    const csv = new ObjectsToCsv(obj);

    await csv.toDisk(path, { append: true });
  },

  readCSV: async (path, separator) => {
    return new Promise((resolve) => {
      const results = [];

      fs.createReadStream(path)
        .pipe(csvParser({ separator }))
        .on('data', (data) => results.push(data))
        .on('end', () => {
          // console.log(`${results.length} itmes readed`);
          resolve(results);
        });
    });
  },

  scrapTemplate: async (url, fct, resolve) => {
    scraper.get({
      url: url,
      // referer:
      //   'https://dentalversender.de/praxisbedarf/verbrauchsmaterial/?cat=21679',
      onSuccess: async ($, response, html, config) => {
        if (response.statusCode !== 200) {
          console.error(
            `loading of ${config.url} failed, response code= ${response.statusCode} ${response}`
          );
          console.log(response.error, response.stack);
          resolve();
          return;
        }

        let data = [];

        data = await fct($, response, html, config, data);

        // console.log(html);

        resolve(html);
      },
      onError: (error) => {
        console.log('error:', error);
        resolve();
      },
    });
  },

  strToHex: (id) => {
    let hexreturn = '';
    for (let i = 1; i <= id.toString().length; i++) {
      hexreturn += 99 - id.toString().charCodeAt(i - 1);
      hexreturn += id.toString().charCodeAt(i - 1);
    }
    return hexreturn;
  },

  logProgress: (index, totale, name, startAt) => {
    const pourcentage = Math.round((index / totale) * 100);

    console.log(
      `${name} : ${index}/${totale} ----- ${pourcentage}% ----- (start at : ${startAt})`
    );
  },

  sleep: (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};

export default utils;
