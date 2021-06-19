/* eslint-disable camelcase */
/* eslint-disable guard-for-in */
/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-unused-vars */
const _ = require('lodash');
const csvParser = require('csv-parser');
const { htmlToText } = require('html-to-text');
const scrap = require('../scrap');
const utils = require('../utils/utils');

// Get all marques
const getAllCategories = async () => {
  return new Promise((resolve) => {
    const fct = async ($, response, html, config, dataArr) => {
      const ul = $(
        `#wrapwrap > nav > div > ul > li.an_navbar_navigation_has_child.catalogue > ul`
      );
      const categories = [];
      for (let index = 1; index < 32; index++) {
        const link = $(
          `#wrapwrap > nav > div > ul > li.an_navbar_navigation_has_child.catalogue > ul > li:nth-child(${index}) > a`
        ).attr('href');
        console.log(link);
        categories.push(link);
      }

      console.log(categories, categories.length);
      resolve(categories);
      // utils.convertToCSV(categories, 'data/dpi/categ.csv');
    };

    utils.scrapTemplate(`https://www.dentalpromotion.fr/`, fct, resolve);
  });
};

const getAllProductFromPage = async (page) => {
  return new Promise((resolve) => {
    const fct = async ($, response, html, config, dataArr) => {
      const links = [];
      const stop = page === 2281 ? 4 : 13;
      for (let index = 1; index < stop; index++) {
        const link = $(
          `#wrapwrap > main > div > div.an_shop_sub_container > div.an_shop > div:nth-child(${index})`
        ).attr('data-redirection');
        links.push({ link });
      }
      // console.log(links);
      resolve(links);
    };

    utils.scrapTemplate(
      `https://www.dentalpromotion.fr/shop/page/${page}`,
      fct,
      resolve
    );
  });
};

const getAllProducts = async () => {
  let idx = 0;
  const startAt = `${new Date().getHours()}:${new Date().getMinutes()}`;

  const products = [];
  const start = (process.env.I - 1) * 200 + 1;
  let stop = process.env.I * 200 + 1;
  if (process.env.I * 1 === 12) stop = 2282;

  for await (const page of _.range(start, stop)) {
    const newProducts = await getAllProductFromPage(page);

    console.log(newProducts, newProducts.length);

    products.push(newProducts);

    await utils.convertToCSV(newProducts, 'data/dpi/produits.csv');
    idx++;
    utils.logProgress(idx, 2281, page, startAt);
  }
};

// Scrap data
exports.scrapProductsData = async () => {
  // let idx = 0;
  // const startAt = `${new Date().getHours()}:${new Date().getMinutes()}`;

  await getAllProducts();

  return [];
};
