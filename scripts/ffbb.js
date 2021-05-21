/* eslint-disable no-restricted-syntax */
/* eslint-disable node/no-unsupported-features/es-syntax */
let cheerio = require('cheerio');
const cheerioAdv = require('cheerio-advanced-selectors');
const scrap = require('../scrap');
const utils = require('../utils/utils');

cheerio = cheerioAdv.wrap(cheerio);

// Scrap: id regions
const scrapIdRegions = async () => {
  return new Promise((resolve) => {
    const fct = async ($, response, html, config, data) => {
      return new Promise((resolve) => {
        for (let index = 2; index < 103; index++) {
          const url = $(`#dept-club > option:nth-child(${index})`).attr(
            'value'
          );

          data.push(url);
        }
        // console.log(data);
        resolve(data);
      });
    };

    utils.scrapTemplate(
      'http://www.ffbb.com/jouer/trouver-un-club',
      fct,
      resolve
    );
  });
};

// Scrap data club from one region
const scrapdataClubFromRegionAndPage = async (region, page) => {
  return new Promise((resolve) => {
    const fct = async ($, response, html, config, data) => {
      return new Promise((resolve) => {
        const allClubs = [];

        for (let club = 1; club < 9; club++) {
          const name = $(
            page === 0 && club === 1
              ? `#block-system-main > div > div > ul > li:nth-child(1) > div.salle-header.comitedepartement > span`
              : `#block-system-main > div > div > ul > li:nth-child(${club}) > div.salle-header > span`
          ).text();

          const adresse = $(
            page === 0 && club === 1
              ? `#block-system-main > div > div > ul > li:nth-child(1) > div.salle-detail.comitedepartement > p.adresse`
              : `#block-system-main > div > div > ul > li:nth-child(${club}) > div.salle-detail > p.adresse`
          ).text();

          const CP = $(
            page === 0 && club === 1
              ? `#block-system-main > div > div > ul > li:nth-child(1) > div.salle-detail.comitedepartement > p.club-add-info > span.club-code-postal`
              : `#block-system-main > div > div > ul > li:nth-child(${club}) > div.salle-detail > p.club-add-info > span.club-code-postal`
          ).text();

          const ville = $(
            page === 0 && club === 1
              ? `#block-system-main > div > div > ul > li:nth-child(1) > div.salle-detail.comitedepartement > p.club-add-info > span.club-ville`
              : `#block-system-main > div > div > ul > li:nth-child(${club}) > div.salle-detail > p.club-add-info > span.club-ville`
          ).text();

          const phone = $(
            page === 0 && club === 1
              ? `#block-system-main > div > div > ul > li:nth-child(1) > div.salle-detail.comitedepartement > p.club-add-fax > span.club-tel > span`
              : `#block-system-main > div > div > ul > li:nth-child(${club}) > div.salle-detail > p.club-add-fax > span.club-tel > span`
          ).text();

          const mail = $(
            page === 0 && club === 1
              ? `#block-system-main > div > div > ul > li:nth-child(1) > div.salle-detail.comitedepartement > p.club-email`
              : `#block-system-main > div > div > ul > li:nth-child(${club}) > div.salle-detail > p.club-email`
          )
            .text()
            .split(' : ')[1];

          const site = $(
            page === 0 && club === 1
              ? `#block-system-main > div > div > ul > li:nth-child(1) > div.salle-detail.comitedepartement > p.club-site > a`
              : `#block-system-main > div > div > ul > li:nth-child(${club}) > div.salle-detail > p.club-site > a`
          ).attr('href');

          data = {
            club: name,
            mail,
            phone,
            adresse,
            ville,
            CP,
            site,
            fede: 'fffb',
            sport: 'basket-ball',
          };

          // console.log(data);
          allClubs.push(data);
        }
        // console.log(allClubs);
        // data.push(url);

        // console.log(data);
        resolve(allClubs);
      });
    };

    utils.scrapTemplate(
      `http://www.ffbb.com/jouer/trouver-un-club?page=${page}&DepartementClub=${region}`,
      fct,
      resolve
    );
  });
};

// Scrap: id clubs
const scrapClubFromRegion = async (region) => {
  return new Promise(async (resolve) =>
    scrap.get({
      url: `http://www.ffbb.com/jouer/trouver-un-club?DepartementClub=${region}`,
      onSuccess: async ($, response, html, config) => {
        if (response.statusCode !== 200) {
          console.error(
            `loading of ${config.url} failed, response code= ${response.statusCode}`
          );
          resolve();
          return;
        }

        const nbClub =
          $('#block-system-main > div > div > h2:nth-child(2)')
            .text()
            .split(' ')[1] * 1;

        const maxPage = Math.floor(nbClub / 8);

        const allClubs = [];

        for await (const page of new Array(maxPage)) {
          const data = await scrapdataClubFromRegionAndPage(region, page);
          allClubs.push(data);
        }
        // console.log(allClubs);
        resolve(allClubs);
      },
      onError: (error) => {
        console.log('error:', error);
        resolve();
      },
    })
  );
};

exports.scrapDataClubs = async () => {
  const regions = await scrapIdRegions();

  return new Promise(async (resolve) => {
    const clubs = [];
    let indexRegion = 0;
    for await (const region of regions) {
      const data = await scrapClubFromRegion(region);
      clubs.push(data);

      indexRegion++;
      utils.logProgress(indexRegion, regions.length, 'Région', '--');
    }

    // console.log(clubs);
    await utils.convertToCSV(clubs, 'data/ffbb.csv');
    resolve(clubs);
  });
};
