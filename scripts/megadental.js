/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-unused-vars */
const scrap = require('../scrap');
const utils = require('../utils/utils');

// Get all marques
const getAllMarques = async () => {
  return new Promise((resolve) => {
    const fct = async ($, response, html, config, dataArr) => {
      const alpha = [
        { letter: 'A', nbMarques: 27 },
        { letter: 'B', nbMarques: 17 },
        { letter: 'C', nbMarques: 27 },
        { letter: 'D', nbMarques: 41 },
        { letter: 'E', nbMarques: 17 },
        { letter: 'F', nbMarques: 10 },
        { letter: 'G', nbMarques: 9 },
        { letter: 'H', nbMarques: 18 },
        { letter: 'I', nbMarques: 9 },
        { letter: 'J', nbMarques: 3 },
        { letter: 'K', nbMarques: 21 },
        { letter: 'L', nbMarques: 9 },
        { letter: 'M', nbMarques: 28 },
        { letter: 'N', nbMarques: 9 },
        { letter: 'O', nbMarques: 14 },
        { letter: 'P', nbMarques: 17 },
        { letter: 'Q', nbMarques: 0 },
        { letter: 'R', nbMarques: 13 },
        { letter: 'S', nbMarques: 46 },
        { letter: 'T', nbMarques: 18 },
        { letter: 'U', nbMarques: 8 },
        { letter: 'V', nbMarques: 10 },
        { letter: 'W', nbMarques: 7 },
        { letter: 'X', nbMarques: 2 },
        { letter: 'Y', nbMarques: 3 },
        { letter: 'Z', nbMarques: 6 },
        { letter: '09', nbMarques: 1 },
      ];

      return new Promise((resolve) => {
        const marques = [];

        let idxLetter = 0;
        const startAt = `${new Date().getHours()}:${new Date().getMinutes()}`;
        for (let letter = 0; letter < alpha.length; letter++) {
          for (let k = 1; k < alpha[letter].nbMarques + 1; k++) {
            if (
              $(
                `#${alpha[letter].letter} > div > ul > li:nth-child(${k}) > a`
              ).attr('href')
            ) {
              console.log(
                `#${alpha[letter].letter} > div > ul > li:nth-child(${k}) > a`
              );
              console.log(
                $(
                  `#${alpha[letter].letter} > div > ul > li:nth-child(${k}) > a`
                ).attr('href')
              );
              const marque = {
                link: $(
                  `#${alpha[letter].letter} > div > ul > li:nth-child(${k}) > a`
                ).attr('href'),
                name: $(
                  `#${alpha[letter].letter} > div > ul > li:nth-child(${k}) > a`
                )
                  .attr('href')
                  .split('/')[2],
              };
              //   console.log(marques);
              marques.push(marque);

              idxLetter++;
              utils.logProgress(idxLetter, alpha.length, 'Letter', startAt);
            }

            console.log(marques);
            resolve(marques);
          }
        }
      });
    };

    utils.scrapTemplate(
      `https://www.megadental.fr/brands/toutes-les-marques`,
      fct,
      resolve
    );
  });
};

//  Get all produit
const getAllProductsFromPage = async (marque, page, prevArticleID) => {
  return new Promise((resolve) => {
    const fct = async ($, response, html, config, dataArr) => {
      return new Promise(async (resolve) => {
        const produits = [];

        let newArticleID =
          $(
            '#maincontent > div.columns > div.column.main > div.products.wrapper.grid.products-grid > ol > li:nth-child(1)'
          ).attr('data-product_id') * 1;
        // console.log(newArticleID);

        if (!newArticleID) {
          resolve(true);
        } else if (newArticleID !== prevArticleID) {
          prevArticleID = newArticleID;

          for (let k = 1; k < 37; k++) {
            if (
              $(
                `#maincontent > div.columns > div.column.main > div.products.wrapper.grid.products-grid > ol > li:nth-child(${k})`
              ).attr('data-product_id')
            ) {
              const produit = {
                marque,
                id:
                  $(
                    `#maincontent > div.columns > div.column.main > div.products.wrapper.grid.products-grid > ol > li:nth-child(${k})`
                  ).attr('data-product_id') * 1,
                name: $(
                  `#maincontent > div.columns > div.column.main > div.products.wrapper.grid.products-grid > ol > li:nth-child(${k}) > div > a`
                )
                  .attr('href')
                  .split('/')[3],
                link: $(
                  `#maincontent > div.columns > div.column.main > div.products.wrapper.grid.products-grid > ol > li:nth-child(${k}) > div > a`
                ).attr('href'),
              };

              produits.push(produit);
            }
          }
        } else {
          resolve(true);
        }

        await utils.convertToCSV(produits, 'data/megadental/produits.csv');
        resolve(prevArticleID);
      });
    };

    utils.scrapTemplate(
      `https://www.megadental.fr/brands/${marque}?product_list_limit=36&p=${page}`,
      fct,
      resolve
    );
  });
};

// Scrap data
exports.scrapData = async () => {
  const marques = await utils.readCSV('data/megadental/marques.csv', ',');

  let idx = 0;
  const startAt = `${new Date().getHours()}:${new Date().getMinutes()}`;

  for await (const marque of marques) {
    let prevArticleID = -1;
    let stop = false;
    let page = 1;

    //   Parcourt pages
    for await (const pageIdx of new Array(500)) {
      if (stop !== true) {
        stop = await getAllProductsFromPage(marque.name, page, prevArticleID);
        page++;
        prevArticleID = stop;
      } else {
        break;
      }
    }
    idx++;
    utils.logProgress(idx, marques.length, `${marque.name}`, startAt);
  }

  //   console.log(marques);
  //   await utils.convertToCSV(marques, 'data/megadental/marques.csv');

  return [];
};
