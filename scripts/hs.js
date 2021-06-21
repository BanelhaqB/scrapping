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
      const a = $(
        `#ctl00_ctlHTMLArticle > section > ul:nth-child(2) > li.show > ul > li > a`
      );

      const categories = _.slice(
        Object.values(a),
        0,
        Object.values(a).length - 4
      ).map((e) => $(e).attr('href'));

      resolve(categories);
    };

    utils.scrapTemplate(
      `https://www.henryschein.fr/fr-fr/shopping/SupplyBrowser.aspx`,
      fct,
      resolve
    );
  });
};

const getAllSubCategories = async (category) => {
  return new Promise((resolve) => {
    const fct = async ($, response, html, config, dataArr) => {
      const a = $(`#ctl00_ctlHTMLArticle > section > ul > li > ul > li > a`);

      const subCategories = _.slice(
        Object.values(a),
        0,
        Object.values(a).length - 4
      ).map((e) => $(e).attr('href'));

      resolve(subCategories);
    };

    // console.log(1, category);
    utils.scrapTemplate(category, fct, resolve);
  });
};

const getAllPages = async (category) => {
  return new Promise((resolve) => {
    const fct = async ($, response, html, config, dataArr) => {
      const nbPages =
        $(
          `#ctl00_cphMainContentHarmony_ucSearchEndecaForEnhancedViewShop_divBottomBar > div.half > div`
        ).attr('data-total') * 1;

      // console.log(1, nbPages);

      resolve({ url: category, nbPages });
    };

    // console.log(2, category);
    utils.scrapTemplate(category, fct, resolve);
  });
};

const getAllProductsFromPage = async (url) => {
  return new Promise((resolve) => {
    const fct = async ($, response, html, config, dataArr) => {
      const productsObj = $(
        `#ctl00_ctlHTMLArticle > div.hs-panel-products.result-panel.active > div.endeca-search-wrapper > section > ol > li > div > h2 > a`
      );

      const products = _.slice(
        Object.values(productsObj),
        0,
        Object.values(productsObj).length - 4
      ).map((e) => {
        return { url: $(e).attr('href') };
      });

      resolve(products);
    };

    utils.scrapTemplate(url, fct, resolve);
  });
};

const getAllProducts = async (category) => {
  let products = [];
  for await (const page of _.range(category.nbPages)) {
    const p = await getAllProductsFromPage(
      `${category.url}?pagenumber=${page + 1}`
    );
    products = products.concat(p);
  }

  await utils.convertToCSV(products, 'data/hs/produits-data.csv');
};

// Scrap data
exports.scrapProductsData = async () => {
  let idx = 0;
  const startAt = `${new Date().getHours()}:${new Date().getMinutes()}`;

  const categories = await getAllCategories();

  // Get subcategories
  const subcategories = [];
  for await (const category of categories) {
    const s = await getAllSubCategories(category);
    for await (const subcategory of s) {
      const sf = await getAllPages(subcategory);
      subcategories.push(sf);
    }
  }

  for await (const category of subcategories) {
    await getAllProducts(category);

    idx++;
    utils.logProgress(idx, subcategories.length, `subcategories`, startAt);
  }
  return [];
};
