/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-restricted-syntax */
const _ = require('lodash');
const scrap = require('../scrap');
const utils = require('../utils/utils');

// Get all gps
const allGPS = async () => {
  let csv = await utils.readCSV('utils/CP.csv', ',');

  csv = csv.map((city) => {
    return {
      name: city.Nom_commune,
      cp: city.Code_postal,
      lat: city.coordonnees_gps.split(',')[0] * 1,
      lgt: city.coordonnees_gps.split(',')[1] * 1,
    };
  });

  return csv;
};

// Get all clubs from city
const getClubFromCity = async (city) => {
  const body = JSON.stringify({
    find_club: {
      latitude: city.lat,
      longitude: city.lgt,
    },
  });

  return new Promise((resolve) =>
    scrap.post({
      url: `https://www.fff.fr/api/find-club`,
      contentType: 'json',
      body,
      onSuccess: async ($, response, html, config) => {
        if (response.statusCode !== 200) {
          console.error(
            `loading of ${config.url} failed, response code= ${response.statusCode}`
          );
          resolve();
          return;
        }
        // console.log(response.body);
        resolve(JSON.parse(response.body));
      },
      onError: (error) => {
        console.log('error:', error);
        resolve();
      },
    })
  );
};

// body > section.staff.container > section > section:nth-child(1) > section > p.margin_b8.bold
// body > section.staff.container > section > section:nth-child(2) > section > p.margin_b8.bold
// body > section.staff.container > section > section:nth-child(9) > section > p

// Scrap club
const scrapClub = async (club) => {
  return new Promise((resolve) => {
    const fct = async ($, response, html, config, dataArr) => {
      const data = {};
      return new Promise((resolve) => {
        data.clubName = club.name;
        data.cp = club.cp;

        for (let contact = 1; contact < 11; contact++) {
          data[`name-contact${contact}`] = $(
            `body > section.staff.container > section > section:nth-child(${contact}) > section > p.margin_b8.bold`
          ).text();
          const info1 = $(
            `body > section.staff.container > section > section:nth-child(${contact}) > section > p:nth-child(2)`
          ).text();
          const info2 = $(
            `body > section.staff.container > section > section:nth-child(${contact}) > section > p:nth-child(3)`
          ).text();
          const info3 = $(
            `body > section.staff.container > section > section:nth-child(${contact}) > section > p:nth-child(4)`
          ).text();
          const info4 = $(
            `body > section.staff.container > section > section:nth-child(${contact}) > section > p:nth-child(5)`
          ).text();

          data[`email1-contact${contact}`] = '';
          data[`phone1-contact${contact}`] = '';

          if (info1.includes('Email')) {
            data[`email1-contact${contact}`] = info1.split(' : ')[1];
          } else if (info1.includes('Mobile')) {
            data[`phone1-contact${contact}`] = info1.split(' : ')[1];
          }

          if (info2.includes('Email')) {
            if (data[`email1-contact${contact}`] === '') {
              data[`email1-contact${contact}`] = info2.split(' : ')[1];
            } else {
              data[`email2-contact${contact}`] = info2.split(' : ')[1];
            }
          } else if (info2.includes('Mobile')) {
            if (data[`phone1-contact${contact}`] === '') {
              data[`phone1-contact${contact}`] = info2.split(' : ')[1];
            } else {
              data[`phone2-contact${contact}`] = info2.split(' : ')[1];
            }
          }

          if (info3.includes('Email')) {
            if (data[`email1-contact${contact}`] === '') {
              data[`email1-contact${contact}`] = info3.split(' : ')[1];
            } else {
              data[`email2-contact${contact}`] = info3.split(' : ')[1];
            }
          } else if (info3.includes('Mobile')) {
            if (data[`phone1-contact${contact}`] === '') {
              data[`phone1-contact${contact}`] = info3.split(' : ')[1];
            } else {
              data[`phone2-contact${contact}`] = info3.split(' : ')[1];
            }
          }

          if (info4.includes('Email')) {
            if (data[`email1-contact${contact}`] === '') {
              data[`email1-contact${contact}`] = info4.split(' : ')[1];
            } else {
              data[`email2-contact${contact}`] = info4.split(' : ')[1];
            }
          } else if (info4.includes('Mobile')) {
            if (data[`phone1-contact${contact}`] === '') {
              data[`phone1-contact${contact}`] = info4.split(' : ')[1];
            } else {
              data[`phone2-contact${contact}`] = info4.split(' : ')[1];
            }
          }
        }

        // console.log(data);
        resolve(data);
      });
    };

    utils.scrapTemplate(
      `https://www.fff.fr/competition/club/${club.id}-${club.slug}/information.html`,
      fct,
      resolve
    );
  });
};

// Scrap all club
exports.scrapDataClubs = async () => {
  //   const gps = await allGPS();
  const allClubs = await utils.readCSV('fff-ids.csv', ',');

  let indexClub = 0;
  const startAt = `${new Date().getHours()}:${new Date().getMinutes()}`;
  let data = [];
  for await (const club of allClubs) {
    data.push(await scrapClub(club));

    if (indexClub % 20 === 0) {
      await utils.convertToCSV(data, 'data/fff.csv');
      data = [];
    }
    indexClub++;
    utils.logProgress(indexClub, allClubs.length, 'City', startAt);
  }

  //   let indexCity = 0;
  //   const startAt = `${new Date().getHours()}:${new Date().getMinutes()}`;
  //   for await (const city of gps) {
  //     const clubs = await getClubFromCity(city);
  //     allClubs = allClubs.concat(
  //       clubs.map((club) => {
  //         return {
  //           name: club.cl_nom,
  //           slug: club.cl_nom_slug,
  //           cp: club.cl_cp,
  //           id: club.cl_cod,
  //         };
  //       })
  //     );
  //     indexCity++;
  //     utils.logProgress(indexCity, gps.length, 'City', startAt);
  //   }

  //   allClubs = _.uniqBy(allClubs, 'id');
  //   console.log(allClubs, allClubs.length);
  //   await utils.convertToCSV(allClubs, 'data/fff-ids.csv');
  return [];
};
