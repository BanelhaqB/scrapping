/* eslint-disable no-restricted-syntax */
/* eslint-disable node/no-unsupported-features/es-syntax */
const scrap = require('../scrap');
const utils = require('../utils/utils');

// Scrap: id regions
const scrapIdRegions = async () => {
  return new Promise((resolve) => {
    const fct = async ($, response, html, config, data) => {
      return new Promise((resolve) => {
        for (let index = 3; index < 24; index++) {
          const url = $(`#frmligue > option:nth-child(${index})`).attr('value');

          data.push(url);
        }

        resolve(data);
      });
    };

    utils.scrapTemplate(
      'https://www.athle.fr/asp.net/main.clubs/carte.aspx',
      fct,
      resolve
    );
  });
};

// Scrap: id clubs
const scrapIdClubFromRegion = async (region) => {
  return new Promise((resolve) =>
    scrap.get({
      url: `https://www.athle.fr/asp.net/main.clubs/CalcPoints.aspx?ltne=0&lgne=0&ltso=0&lgso=0&ligue=${region}&dept=&ville=&mode=&piste=false&jeunes=false&htniveau=false&santeloisir=false&horsstade=false`,
      onSuccess: async ($, response, html, config) => {
        if (response.statusCode !== 200) {
          console.error(
            `loading of ${config.url} failed, response code= ${response.statusCode}`
          );
          resolve();
          return;
        }

        resolve(JSON.parse(response.body));
      },
      onError: (error) => {
        console.log('error:', error);
        resolve();
      },
    })
  );
};

const scrapIdClubs = async (region) => {
  return new Promise(async (resolve) => {
    const clubs = [];
    const json = await scrapIdClubFromRegion(region);
    json.forEach((club) => {
      clubs.push({
        name: club.club,
        id: club.id,
        idHex: utils.strToHex(club.id),
      });
    });
    // console.log(clubs);
    resolve(clubs);
  });
};

// Scrap: data club
const scrapDataFromClub = async (club) => {
  return new Promise((resolve) => {
    const fct = async ($, response, html, config, data) => {
      return new Promise((resolve) => {
        const president = $(
          `#ctnContentDetails > table:nth-child(2) > tbody > tr > td > div:nth-child(2)`
        )
          .text()
          .split(': ')[1]
          .split('\n')[0];

        const mail = $(
          `#ctnContentDetails > table:nth-child(2) > tbody > tr > td > table > tbody > tr:nth-child(1) > td:nth-child(3) > a`
        )
          .attr('href')
          .split(':')[1]
          .split('?')[0];

        const adresse = $(
          `#ctnContentDetails > table:nth-child(2) > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(3)`
        ).text();

        const CP = $(
          `#ctnContentDetails > table:nth-child(2) > tbody > tr > td > table > tbody > tr:nth-child(3) > td:nth-child(3)`
        ).text();

        const ville = $(
          `#ctnContentDetails > table:nth-child(2) > tbody > tr > td > table > tbody > tr:nth-child(4) > td:nth-child(3)`
        ).text();

        const tel = $(
          `#ctnContentDetails > table:nth-child(2) > tbody > tr > td > table > tbody > tr:nth-child(5) > td:nth-child(3)`
        ).text();

        const nbLicencie = $(
          `#ctnContentDetails > table.linedBrown > tbody > tr:nth-child(3) > td:nth-child(3)`
        ).text();

        data = {
          club: club.name,
          clubID: club.id,
          clubIdHex: club.idHex,
          president,
          mail,
          tel,
          adresse,
          ville,
          CP,
          nbLicencie,
          fede: 'ffa',
          sport: 'athlétisme',
        };

        resolve(data);
      });
    };

    utils.scrapTemplate(
      `https://bases.athle.fr/asp.net/contacts.aspx?base=contacts&id=${club.idHex}&type=S`,
      fct,
      resolve
    );
  });
};

exports.scrapDataClubs = async () => {
  const regions = await scrapIdRegions();

  return new Promise(async (resolve) => {
    const clubs = [];
    let indexRegion = 0;
    let indexClub = 0;
    for await (const region of regions) {
      const idClubs = await scrapIdClubs(region);
      for await (const club of idClubs) {
        const data = await scrapDataFromClub(club);
        clubs.push(data);
        indexClub++;
        utils.logProgress(indexClub, idClubs.length, 'Club', '--');
        utils.logProgress(indexRegion, regions.length, 'Région', '--');
      }
      indexRegion++;
      utils.logProgress(indexRegion, regions.length, 'Région', '--');
    }

    // console.log(clubs);
    await utils.convertToCSV(clubs, 'data/ffa.csv');
    resolve(clubs);
  });
};
