/* eslint-disable camelcase */
/* eslint-disable guard-for-in */
/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-unused-vars */
const _ = require('lodash');
const request = require('request');
const randomUA = require('random-fake-useragent');
const csvParser = require('csv-parser');
const { htmlToText } = require('html-to-text');
const scrap = require('../scrap');
const utils = require('../utils/utils');

// Get all marques
const getAllCategories = () => [
  // { id: 21679, name: 'Verbrauchsmaterial', nbPage: 164 },
  // { id: 24021, name: 'covid-19 sortiment', nbPage: 2 },
  // { id: 24361, name: 'handschuhe', nbPage: 10 },
  // { id: 23691, name: 'hersteller-aktionen', nbPage: 204 },
  // { id: 23621, name: 'eigenmarken', nbPage: 35 },
  // { id: 22029, name: 'abformung', nbPage: 55 },
  // { id: 22068, name: 'einwegartikel', nbPage: 137 },
  // { id: 22161, name: 'endodontie', nbPage: 41 },
  // { id: 22089, name: 'F%C3%BCllungsmaterialien', nbPage: 67 },
  // { id: 22189, name: 'Glaswaren+%2F+Kunststoffe+%2F+Metalle', nbPage: 18 },
  // { id: 22099, name: 'Hilfsmittel+f%C3%BCr+F%C3%BCllungsmaterial', nbPage: 56 },
  // { id: 22046, name: 'Hygiene+und+Arbeitsschutz', nbPage: 122 },
  // { id: 22107, name: 'implantologie', nbPage: 8 },
  // { id: 22126, name: 'instrumente', nbPage: 232 },
  // { id: 22113, name: 'medikamente', nbPage: 33 },
  // { id: 22196, name: 'organisation+in+der+praxis', nbPage: 38 },
  // { id: 22202, name: 'Praxisger%C3%A4te', nbPage: 59 },
  // { id: 22171, name: 'prophylaxe', nbPage: 100 },
  // { id: 22140, name: 'R%C3%B6ntgen', nbPage: 17 },
  // { id: 22149, name: 'rotierende+instrumente', nbPage: 152 },
  // { id: 22220, name: 'Zubeh%C3%B6r+f%C3%BCr+Praxisger%C3%A4te', nbPage: 112 },
  { id: 21679, name: 'Verbrauchsmaterial', nbPage: 55 },
  { id: 24021, name: 'covid-19 sortiment', nbPage: 1 },
  { id: 24361, name: 'handschuhe', nbPage: 4 },
  { id: 23691, name: 'hersteller-aktionen', nbPage: 68 },
  { id: 23621, name: 'eigenmarken', nbPage: 12 },
  { id: 22029, name: 'abformung', nbPage: 19 },
  { id: 22068, name: 'einwegartikel', nbPage: 46 },
  { id: 22161, name: 'endodontie', nbPage: 14 },
  { id: 22089, name: 'F%C3%BCllungsmaterialien', nbPage: 23 },
  { id: 22189, name: 'Glaswaren+%2F+Kunststoffe+%2F+Metalle', nbPage: 6 },
  { id: 22099, name: 'Hilfsmittel+f%C3%BCr+F%C3%BCllungsmaterial', nbPage: 19 },
  { id: 22046, name: 'Hygiene+und+Arbeitsschutz', nbPage: 41 },
  { id: 22107, name: 'implantologie', nbPage: 3 },
  { id: 22126, name: 'instrumente', nbPage: 78 },
  { id: 22113, name: 'medikamente', nbPage: 11 },
  { id: 22196, name: 'organisation+in+der+praxis', nbPage: 13 },
  { id: 22202, name: 'Praxisger%C3%A4te', nbPage: 20 },
  { id: 22171, name: 'prophylaxe', nbPage: 34 },
  { id: 22140, name: 'R%C3%B6ntgen', nbPage: 6 },
  { id: 22149, name: 'rotierende+instrumente', nbPage: 51 },
  { id: 22220, name: 'Zubeh%C3%B6r+f%C3%BCr+Praxisger%C3%A4te', nbPage: 38 },
];

const getnbPagesCategory = async (category, fct) => {
  return new Promise((resolve) => {
    request.get(
      {
        url:
          category.id === 21679
            ? 'https://dentalversender.de/ReplyFactFinder/ajax/Search.ff?query=%2a&channel=dv-sw-live_de&sid=DJ2Bazksmbdtrj417eD3aHcESF84RQ&filterCategoryPathROOT=Praxisbedarf&filterCategoryPathROOT%2FPraxisbedarf=Verbrauchsmaterial&cat=21679&productsPerPage=36&format=json'
            : `https://dentalversender.de/ReplyFactFinder/ajax/Search.ff?query=%2a&channel=dv-sw-live_de&sid=DJ2Bazksmbdtrj417eD3aHcESF84RQ&filterCategoryPathROOT=Praxisbedarf&filterCategoryPathROOT%2FPraxisbedarf=Verbrauchsmaterial&filterCategoryPathROOT%2FPraxisbedarf%2FVerbrauchsmaterial=${category.name}&cat=${category.id}&productsPerPage=36&format=json`,
        headers: {
          Referer: `https://dentalversender.de/`,
          'User-Agent': randomUA.getRandom(),
          'Content-Type': `application/x-www-form-urlencoded; charset=UTF-8`,
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'Cache-Control': 'no-cache',
          authority: 'dentalversender.de',
          // ':method': 'GET',
          // ':path':
          //   '/ReplyFactFinder/ajax/Search.ff?query=%2a&channel=dv-sw-live_de&sid=DJ2Bazksmbdtrj417eD3aHcESF84RQ&cat=21679&filterCategoryPathROOT=Praxisbedarf&filterCategoryPathROOT%2FPraxisbedarf=Verbrauchsmaterial&format=json',
          // ':scheme': 'https',
          'accept-encoding': 'gzip, deflate, br',
          'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,la;q=0.6',
          cookie:
            'allowCookie=1; cookiePreferences={"groups":{"technical":{"name":"technical","cookies":{"cookieDeclined":{"name":"cookieDeclined","active":true},"allowCookie":{"name":"allowCookie","active":true},"shop":{"name":"shop","active":true},"backendUser":{"name":"backendUser","active":true},"csrf_token":{"name":"csrf_token","active":true},"cookiePreferences":{"name":"cookiePreferences","active":true},"x-cache-context-hash":{"name":"x-cache-context-hash","active":true},"slt":{"name":"slt","active":true},"nocache":{"name":"nocache","active":true},"session":{"name":"session","active":true},"currency":{"name":"currency","active":true}},"active":true},"comfort":{"name":"comfort","cookies":{"sUniqueID":{"name":"sUniqueID","active":true}},"active":true},"statistics":{"name":"statistics","cookies":{"x-ua-device":{"name":"x-ua-device","active":true},"_ga":{"name":"_ga","active":true},"partner":{"name":"partner","active":true}},"active":true}},"hash":"WyJfZ2EiLCJhbGxvd0Nvb2tpZSIsImJhY2tlbmRVc2VyIiwiY29tZm9ydCIsImNvb2tpZURlY2xpbmVkIiwiY29va2llUHJlZmVyZW5jZXMiLCJjc3JmX3Rva2VuIiwiY3VycmVuY3kiLCJub2NhY2hlIiwicGFydG5lciIsInNVbmlxdWVJRCIsInNlc3Npb24iLCJzaG9wIiwic2x0Iiwic3RhdGlzdGljcyIsInRlY2huaWNhbCIsIngtY2FjaGUtY29udGV4dC1oYXNoIiwieC11YS1kZXZpY2UiXQ=="}; _ga=GA1.2.358614956.1621540147; _gcl_au=1.1.1256238095.1624885998; session-3=09ca66ab722c7760c302cc900fdb37b9514e43d25dd933bc5f892a2780f79ec6; x-ua-device=desktop; _gid=GA1.2.142564262.1625498366; __csrf_token-3=87RfKTf6fSxjKHfaBeIhVF6Mw8yobi; _gat_gtag_UA_66171411_1=1',
          referer:
            'https://dentalversender.de/praxisbedarf/verbrauchsmaterial/?cat=21679',
          'sec-ch-ua':
            '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
          'sec-ch-ua-mobile': '?0',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
        },
      },
      function (error, response, html) {
        if (!error) {
          fct2(JSON.parse(response.body), resolve, category);
          // resolve(true);
        } else {
          console.log(error);
        }
      }
    );
  });
};

const getDataOfPage = async (category, page, fct) => {
  return new Promise((resolve) => {
    request.get(
      {
        url:
          category.id === 21679
            ? `https://dentalversender.de/ReplyFactFinder/ajax/Search.ff?query=%2a&channel=dv-sw-live_de&sid=DJ2Bazksmbdtrj417eD3aHcESF84RQ&filterCategoryPathROOT=Praxisbedarf&filterCategoryPathROOT%2FPraxisbedarf=Verbrauchsmaterial&cat=21679&page=${page}&productsPerPage=36&format=json`
            : `https://dentalversender.de/ReplyFactFinder/ajax/Search.ff?query=%2a&channel=dv-sw-live_de&sid=DJ2Bazksmbdtrj417eD3aHcESF84RQ&filterCategoryPathROOT=Praxisbedarf&filterCategoryPathROOT%2FPraxisbedarf=Verbrauchsmaterial&filterCategoryPathROOT%2FPraxisbedarf%2FVerbrauchsmaterial=${category.name}&cat=${category.id}&page=${page}&productsPerPage=36&format=json`,
        headers: {
          Referer: `https://dentalversender.de/`,
          'User-Agent': randomUA.getRandom(),
          'Content-Type': `application/x-www-form-urlencoded; charset=UTF-8`,
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'Cache-Control': 'no-cache',
          authority: 'dentalversender.de',
          // ':method': 'GET',
          // ':path':
          //   '/ReplyFactFinder/ajax/Search.ff?query=%2a&channel=dv-sw-live_de&sid=DJ2Bazksmbdtrj417eD3aHcESF84RQ&cat=21679&filterCategoryPathROOT=Praxisbedarf&filterCategoryPathROOT%2FPraxisbedarf=Verbrauchsmaterial&format=json',
          // ':scheme': 'https',
          'accept-encoding': 'gzip, deflate, br',
          'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,la;q=0.6',
          cookie:
            'allowCookie=1; cookiePreferences={"groups":{"technical":{"name":"technical","cookies":{"cookieDeclined":{"name":"cookieDeclined","active":true},"allowCookie":{"name":"allowCookie","active":true},"shop":{"name":"shop","active":true},"backendUser":{"name":"backendUser","active":true},"csrf_token":{"name":"csrf_token","active":true},"cookiePreferences":{"name":"cookiePreferences","active":true},"x-cache-context-hash":{"name":"x-cache-context-hash","active":true},"slt":{"name":"slt","active":true},"nocache":{"name":"nocache","active":true},"session":{"name":"session","active":true},"currency":{"name":"currency","active":true}},"active":true},"comfort":{"name":"comfort","cookies":{"sUniqueID":{"name":"sUniqueID","active":true}},"active":true},"statistics":{"name":"statistics","cookies":{"x-ua-device":{"name":"x-ua-device","active":true},"_ga":{"name":"_ga","active":true},"partner":{"name":"partner","active":true}},"active":true}},"hash":"WyJfZ2EiLCJhbGxvd0Nvb2tpZSIsImJhY2tlbmRVc2VyIiwiY29tZm9ydCIsImNvb2tpZURlY2xpbmVkIiwiY29va2llUHJlZmVyZW5jZXMiLCJjc3JmX3Rva2VuIiwiY3VycmVuY3kiLCJub2NhY2hlIiwicGFydG5lciIsInNVbmlxdWVJRCIsInNlc3Npb24iLCJzaG9wIiwic2x0Iiwic3RhdGlzdGljcyIsInRlY2huaWNhbCIsIngtY2FjaGUtY29udGV4dC1oYXNoIiwieC11YS1kZXZpY2UiXQ=="}; _ga=GA1.2.358614956.1621540147; _gcl_au=1.1.1256238095.1624885998; session-3=09ca66ab722c7760c302cc900fdb37b9514e43d25dd933bc5f892a2780f79ec6; x-ua-device=desktop; _gid=GA1.2.142564262.1625498366; __csrf_token-3=87RfKTf6fSxjKHfaBeIhVF6Mw8yobi; _gat_gtag_UA_66171411_1=1',
          referer:
            'https://dentalversender.de/praxisbedarf/verbrauchsmaterial/?cat=21679',
          'sec-ch-ua':
            '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
          'sec-ch-ua-mobile': '?0',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
        },
      },
      function (error, response, html) {
        if (!error) {
          fct(JSON.parse(response.body), resolve, category);
          // resolve(true);
        } else {
          console.log(error);
        }
      }
    );
  });
};

// https://dentalversender.de/Praxisbedarf/Verbrauchsmaterial/Einwegartikel/Handschuhe-unsteril/9859/smart-Latexhandschuhe-PF?number=
// https://dentalversender.de/Praxisbedarf/Verbrauchsmaterial/Einwegartikel/Handschuhe-unsteril/9859/smart-Latexhandschuhe-PF?group%5B532%5D=148239&template=ajax

const fct = async (response, resolve, category, url) => {
  const urls = [];
  response.searchResult.records.forEach((product) => {
    const p = {
      url: product.record.Deeplink,
      marque: product.record.Manufacturer,
      id_variante: product.record.ProductNumber,
      nom_attr_1: undefined,
      val_attr_1: undefined,
      nom_attr_2: undefined,
      val_attr_2: undefined,
      nom_attr_3: undefined,
      val_attr_3: undefined,
      nom_attr_4: undefined,
      val_attr_4: undefined,
      nom_attr_5: undefined,
      val_attr_5: undefined,
      nom_attr_6: undefined,
      val_attr_6: undefined,
      nom_attr_7: undefined,
      val_attr_7: undefined,
      designation: product.record.Title,
      reference: product.record.ProductNumber,
      sku: product.record.MasterProductNumber,
      code_article_fournisseur: product.record.MasterProductNumber,
      descritptif: product.record.Description,
      prix_reference: product.record.Price,
      prix_promo_unitaire: undefined,
      quantite_degressif_1: undefined,
      prix_promo_degressif_1: undefined,
      quantite_degressif_2: undefined,
      prix_promo_degressif_2: undefined,
      quantite_degressif_3: undefined,
      prix_promo_degressif_3: undefined,
      quantite_degressif_4: undefined,
      prix_promo_degressif_4: undefined,
    };
    urls.push(p);
  });

  // console.log(urls);
  await utils.convertToCSV(urls, 'data/dv/produits-data2.csv');
  resolve();
};
const fct2 = async (response, resolve, category) => {
  console.log({
    id: category.id,
    name: category.name,
    nbPage: response.searchResult.paging.pageCount,
  });
  resolve();
};

const getDataFrom = async (produit) => {
  return new Promise((resolve) => {
    const fct1 = async ($, response, html, config, dataArr) => {
      // const vObj = $(
      //   'body > div.page-wrap > section > div > div.content--wrapper > div > div.top-content > div.product--detail-upper.block-group > div.product--buybox.block > div > div:nth-child(5) > form > div > div.select-field > select > option'
      // );

      // const v = _.slice(Object.values(vObj), 0, Object.values(vObj).length - 4);

      // if (v.length > 0) {
      // const variantes = [];
      // v.forEach((variantO, index) => {
      //   if (index < 7) {
      //     const variante = $(variantO);
      //     const varFile = {};
      //     varFile.urlProd = `${produit.urlProd.split('?')[0]}?group%5B532%5D=${
      //       produit.id
      //     }`;
      //     varFile.nom_attr_1 = 'vairante';
      //     varFile.val_attr_1 = variante.text().trim();
      //     varFile.id = variante.attr('value');

      //     variantes.push(varFile);
      //   }
      // });
      // await utils.convertToCSV(
      //   variantes,
      //   'data/dv/produits-urls-variantes.csv'
      // );
      // console.log(variantes);
      // } else {
      const pmarque = $(
        'body > div.page-wrap > section > div > div.content--wrapper > div > div.top-content > div.product--detail-upper.block-group > div.product--buybox.block > div > div.sx-other-details > div > div.nxs--manufacturer-container > div.article-manufacturer > a'
      )
        .text()
        .trim();

      const pdes = $(
        'body > div.page-wrap > section > div > div.content--wrapper > div > div.top-content > header > div > h1'
      )
        .text()
        .trim();

      const pref = $(
        'body > div.page-wrap > section > div > div.content--wrapper > div > div.top-content > div.product--detail-upper.block-group > div.product--buybox.block > div > div.sx-other-details > div > div.article-nr'
      )
        .text()
        .split(':')[1]
        .trim();

      const psku = $(
        'body > div.page-wrap > section > div > div.content--wrapper > div > div.top-content > div.product--detail-upper.block-group > div.product--buybox.block > div > div.sx-other-details > div > div.nxs--manufacturer-container > div.base-info--entry.entry-attribute > span.entry--content'
      )
        .text()
        .trim();

      const pdesc = $(
        'body > div.page-wrap > section > div > div.content--wrapper > div > div.top-content > div.tab-menu--product.js--tab-menu > div > div > div.content--description > div.product--description'
      )
        .text()
        .trim();

      const pprixref = $(
        'body > div.page-wrap > section > div > div.content--wrapper > div > div.top-content > div.product--detail-upper.block-group > div.product--buybox.block > div > div.sx-white-container > div > span > meta'
      ).attr('content');

      const p = {
        url: `${produit.urlProd.split('?')[0]}?group%5B532%5D=${produit.id}`,
        marque: pmarque,
        id_variante: produit.id,
        nom_attr_1: produit.nom_attr_1,
        val_attr_1: produit.val_attr_1,
        nom_attr_2: undefined,
        val_attr_2: undefined,
        nom_attr_3: undefined,
        val_attr_3: undefined,
        nom_attr_4: undefined,
        val_attr_4: undefined,
        nom_attr_5: undefined,
        val_attr_5: undefined,
        nom_attr_6: undefined,
        val_attr_6: undefined,
        nom_attr_7: undefined,
        val_attr_7: undefined,
        designation: pdes,
        reference: pref,
        sku: psku,
        code_article_fournisseur: psku,
        descritptif: pdesc,
        prix_reference: pprixref,
        prix_promo_unitaire: undefined,
        quantite_degressif_1: undefined,
        prix_promo_degressif_1: undefined,
        quantite_degressif_2: undefined,
        prix_promo_degressif_2: undefined,
        quantite_degressif_3: undefined,
        prix_promo_degressif_3: undefined,
        quantite_degressif_4: undefined,
        prix_promo_degressif_4: undefined,
      };

      await utils.convertToCSV([p], 'data/dv/produits-data.csv');
      // }
      // const urls = [];
      // _.range(nbPages).forEach((page) => {
      //   urls.push({ url: `${category}?p=${page + 1}`, page: page + 1 });
      // });
      // await utils.convertToCSV(urls, 'data/pd/pages-url.csv');

      resolve();
    };

    // console.log(2, category);
    utils.scrapTemplate(
      `${produit.urlProd.split('?')[0]}?group%5B532%5D=${produit.id}`,
      fct1,
      resolve
    );
  });
};

const scrapUrls = async () => {
  let idx = 0;
  const startAt = `${new Date().getHours()}:${new Date().getMinutes()}`;
  // console.log(getAllCategories()[0]);
  for await (const category of getAllCategories()) {
    let idx2 = 0;
    const startAt2 = `${new Date().getHours()}:${new Date().getMinutes()}`;
    for await (const page of _.range(category.nbPage)) {
      try {
        await getDataOfPage(category, page + 1, fct);
      } catch (error) {
        console.log(error);
      }
      idx2++;
      utils.logProgress(
        idx2,
        _.range(category.nbPage).length,
        `Page`,
        startAt2
      );
    }
    idx++;
    utils.logProgress(idx, getAllCategories().length, `Categorie`, startAt);
  }
};

// Scrap data
exports.scrapProductsData = async () => {
  const allProducts = await utils.readCSV(
    'data/dv/produits-urls-variantes.csv',
    ','
  );
  let idx = 0;
  const startAt = `${new Date().getHours()}:${new Date().getMinutes()}`;

  for await (const product of allProducts) {
    if (idx % 2 === process.env.V * 1) {
      await getDataFrom(product);
      await utils.sleep(1000);
      console.log(process.env.V);
    }

    idx++;
    utils.logProgress(idx, allProducts.length, `Produit`, startAt);
  }
  // await scrapUrls();

  return [];
};
