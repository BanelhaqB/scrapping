const utils = require('../utils/utils');

// Get all marques
const getAllProjets = async () => {
  return new Promise((resolve) => {
    const fct = async ($, response, html, config, dataArr) => {
      return new Promise(async (resolve) => {
        const projets = [];

        const startAt = `${new Date().getHours()}:${new Date().getMinutes()}`;

        for (let k = 2; k < 160; k++) {
          const projet = {
            link: $(`#ajaxc > div > div > div:nth-child(${k}) > #n_color`).attr(
              'href'
            ),
            name: $(`#ajaxc > div > div > div:nth-child(${k}) > #n_color`)
              .text()
              .trim(),
            date: $(
              `#ajaxc > div > div > div:nth-child(${k}) > #n_color > #upcoming_ico > div.date`
            )
              .text()
              .trim(),
          };
          console.log(
            $(`#ajaxc > div > div > div:nth-child(${k}) > #n_color`).attr(
              'href'
            )
          );
          projets.push(projet);

          utils.logProgress(k, 160, projet.name, startAt);

          //   console.log(projets);
          resolve(projets);
        }
        await utils.convertToCSV(projets, 'data/crypto/projet.csv');
      });
    };

    utils.scrapTemplate(
      `https://icodrops.com/category/upcoming-ico/`,
      fct,
      resolve
    );
  });
};

exports.scrap = async () => {
  const projets = await getAllProjets();

  return projets;
};
