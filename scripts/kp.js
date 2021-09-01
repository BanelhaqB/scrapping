const _ = require('lodash');
const request = require('request');
const randomUA = require('random-fake-useragent');
const csvParser = require('csv-parser');
const { htmlToText } = require('html-to-text');
const scrap = require('../scrap');
const utils = require('../utils/utils');

// Get all marques
const getAllCitiesFromCP = async (cp) => {
  return new Promise(async (resolve) => {
    scrap.get({
      url: `https://www.kelprof.com/ajax/cities?q=${cp}`,
      referer: 'https://www.kelprof.com',
      onSuccess: async ($, response, html, config) => {
        if (response.statusCode !== 200) {
          console.error(
            `loading of ${config.url} failed, response code= ${response.statusCode} ${response}`
          );
          console.log(response.error, response.stack);
          resolve();
          return;
        }

        // let data = [];

        // data = await fct($, response, html, config, data);

        // console.log(html);

        resolve(JSON.parse(html));
      },
      onError: (error) => {
        console.log('error:', error);
        resolve();
      },
    });
  });
};

const getAllCities = async () => {
  let cities = [];
  let idx = 0;
  const startAt = `${new Date().getHours()}:${new Date().getMinutes()}`;
  const allCP = await utils.readCSV('data/kp/cps.csv', ';');
  for await (const cp of allCP) {
    // console.log(cp, cp.CP, await getAllCitiesFromCP(cp.CP));
    cities = cities.concat(await getAllCitiesFromCP(cp.CP));
    await utils.convertToCSV(cities, 'data/kp/cities-data2.csv');
    idx++;
    utils.logProgress(idx, allCP.length, `Code Postal`, startAt);
  }

  //   console.log(cities, cities.length);

  await utils.convertToCSV(cities, 'data/kp/cities-data2.csv');
  return cities;
};

// Scrap data
exports.scrapProductsData = async () => {
  const cities = await getAllCities();
  console.log(cities, cities.length);
  return [];
};
