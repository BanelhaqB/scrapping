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

const getAllProducts = async (pages) => {
  let idx = 0;
  const startAt = `${new Date().getHours()}:${new Date().getMinutes()}`;

  const products = [];
  const start = (process.env.I - 1) * 200 + 1;
  let stop = process.env.I * 200 + 1;
  if (process.env.I * 1 === 12) stop = 2282;
  const pagesArray = pages ? pages : _.range(start, stop);

  for await (const page of pagesArray) {
    const newProducts = await getAllProductFromPage(page);

    console.log(newProducts, `page : ${page}`, newProducts.length);

    products.push(newProducts);

    await utils.convertToCSV(newProducts, 'data/dpi/produits.csv');
    idx++;
    utils.logProgress(idx, pagesArray.length, page, startAt);
  }
};

const getMissingPages = async () => {
  const ps = await utils.readCSV('data/dpi/produits.csv', ',');
  const mp = [];
  console.log(ps.length);
  if (ps.length > 0) {
    const pf = _.uniq(ps.map((e) => e.link.split('=')[1] * 1));

    const psort = _.sortBy(pf, function (n) {
      return n;
    });

    _.range(2, 2283).forEach((e) => {
      if (!psort.includes(e)) mp.push(e);
    });
  }

  // for (let index = 2; index < 2283; index++)
  //   if (index !== psort[index - 2]) mp.push(index);

  // console.log(psort, `${ps.length} -> ${pf.length}`);

  // console.log(psort.includes(107));
  return mp;
};

const getDataFromProduct = async (productLink) => {
  return new Promise((resolve) => {
    const fct = async ($, response, html, config, dataArr) => {
      const purl = productLink;
      const pmarque = undefined;
      const pid = productLink.split('-')[1].split('?')[0] * 1;
      const pattr1 = undefined;
      const pvalattr1 = undefined;
      const pattr2 = undefined;
      const pvalattr2 = undefined;
      const pattr3 = undefined;
      const pvalattr3 = undefined;
      const pattr4 = undefined;
      const pvalattr4 = undefined;
      const pattr5 = undefined;
      const pvalattr5 = undefined;
      const pattr6 = undefined;
      const pvalattr6 = undefined;
      const pattr7 = undefined;
      const pvalattr7 = undefined;
      const pdes = $(
        '#wrap > div.an_single_article.wbWidth > div.an_shop_article_single_container > div.an_shop_article_title > span'
      )
        .text()
        .trim();
      const pref = $(
        '#wrap > div.an_single_article.wbWidth > div.an_shop_article_single_container > div.an_shop_article_short_description > span:nth-child(1)'
      )
        .text()
        .trim();
      const psku = undefined;
      const pcodef = undefined;
      const pdesc = $(
        '#product_full_description > div.an_more_infos_container > p'
      )
        .text()
        .trim();

      const promo = $('div.no_promo').text().trim();

      const pprixref = promo
        ? $(
            'div.no_promo > div.an_shop_arrow_price > div.an_shop_article_actual_price > span > span'
          )
            .text()
            .trim()
            .replace(',', '.') * 1
        : $(
            'div.an_shop_article_prices  > div.an_shop_arrow_price > div.an_shop_article_prices_promo_price > span > span'
          )
            .text()
            .trim()
            .replace(',', '.') * 1;

      const ppromouni = promo
        ? undefined
        : $(
            'div.an_shop_article_prices  > div.an_shop_arrow_price > div.an_shop_article_actual_price > span > span'
          )
            .text()
            .trim()
            .replace(',', '.') * 1;

      const pquantdeg1 = undefined;
      const pprixdeg1 = undefined;
      const pquantdeg2 = undefined;
      const pprixdeg2 = undefined;
      const pquantdeg3 = undefined;
      const pprixdeg3 = undefined;
      const pquantdeg4 = undefined;
      const pprixdeg4 = undefined;

      const p = {
        url: purl,
        marque: pmarque,
        id_variante: pid,
        nom_attr_1: pattr1,
        val_attr_1: pvalattr1,
        nom_attr_2: pattr2,
        val_attr_2: pvalattr2,
        nom_attr_3: pattr3,
        val_attr_3: pvalattr3,
        nom_attr_4: pattr4,
        val_attr_4: pvalattr4,
        nom_attr_5: pattr5,
        val_attr_5: pvalattr5,
        nom_attr_6: pattr6,
        val_attr_6: pvalattr6,
        nom_attr_7: pattr7,
        val_attr_7: pvalattr7,
        designation: pdes,
        reference: pref,
        sku: psku,
        code_article_fournisseur: pcodef,
        descritptif: pdesc,
        prix_reference: pprixref,
        prix_promo_unitaire: ppromouni,
        quantite_degressif_1: pquantdeg1,
        prix_promo_degressif_1: pprixdeg1,
        quantite_degressif_2: pquantdeg2,
        prix_promo_degressif_2: pprixdeg2,
        quantite_degressif_3: pquantdeg3,
        prix_promo_degressif_3: pprixdeg3,
        quantite_degressif_4: pquantdeg4,
        prix_promo_degressif_4: pprixdeg4,
      };

      const tabqtydegObj = $(
        '#postForm > div > div.an_shop_article_single_action_zone > div.an_cart_lines_container > div.an_cart_lines > div > div:nth-child(2)'
      );

      const tabprixdegObj = $(
        '#postForm > div > div.an_shop_article_single_action_zone > div.an_cart_lines_container > div.an_cart_lines > div > div.an_product_line_price > span[data-oe-expression="item.fixed_price"] > span'
      );

      const tabqtydeg = _.slice(
        Object.values(tabqtydegObj),
        0,
        Object.values(tabqtydegObj).length - 4
      ).map((e) => $(e).text().trim() * 1);

      const tabprixdeg = _.slice(
        Object.values(tabprixdegObj),
        0,
        Object.values(tabprixdegObj).length - 4
      ).map((e) => $(e).text().trim().replace(',', '.') * 1);

      // console.log(tabqtydeg, tabprixdeg);

      for (let k = 0; k < tabqtydeg.length; k++) {
        p[`quantite_degressif_${k + 1}`] = tabqtydeg[k];
        p[`prix_promo_degressif_${k + 1}`] = tabprixdeg[k];
      }

      // console.log(p);
      await utils.convertToCSV([p], 'data/dpi/produits-data.csv');
    };

    utils.scrapTemplate(
      `https://www.dentalpromotion.fr${productLink}`,
      fct,
      resolve
    );
  });
};

// Scrap data
exports.scrapProductsData = async () => {
  let idx = 0;
  const startAt = `${new Date().getHours()}:${new Date().getMinutes()}`;

  //
  // const missingPages = await getMissingPages();
  // console.log(missingPages, missingPages.length);
  // await getAllProducts(missingPages);
  // await getDataFromProduct(
  //   'https://www.dentalpromotion.fr/shop/product/product-30686?page=2'
  // );

  const allProducts = await utils.readCSV('data/dpi/produits.csv', ',');

  for await (const product of allProducts) {
    await getDataFromProduct(product.link);

    idx++;
    utils.logProgress(idx, allProducts.length, `Produit`, startAt);
  }
  return [];
};
