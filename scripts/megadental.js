/* eslint-disable camelcase */
/* eslint-disable guard-for-in */
/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-unused-vars */
const csvParser = require('csv-parser');
const { htmlToText } = require('html-to-text');
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

const getLabelOption = (attributes, idAttribute, idOption) => {
  let retrunVal = '';
  attributes[idAttribute].options.forEach((option) => {
    if (option.id === idOption) {
      retrunVal = option.label;
    }
  });

  return retrunVal;
};

const getLabeAttribute = (attributes, idAttribute) =>
  attributes[idAttribute].label;

//  Get produit
const getProductsdata = async (url, marque) => {
  return new Promise((resolve) => {
    const fct = async ($, response, html, config, dataArr) => {
      return new Promise(async (resolve) => {
        const products = [];

        if (
          JSON.parse(
            $("script[type='text/x-magento-init']")['7'].children[0].data
          )['#product_addtocart_form']
        ) {
          const json = JSON.parse(
            $("script[type='text/x-magento-init']")['7'].children[0].data
          )['#product_addtocart_form'].configurable.spConfig;

          // console.log(json);

          const idProduit = json.original_product_id;

          const indexes = [];
          for (const i in json.index)
            indexes.push({ id: i, combi: json.index[i] });

          indexes.forEach((product) => {
            const categories = [];
            for (const i in product.combi)
              categories.push({ id: i, optionId: product.combi[i] });

            const produit = {
              url,
              marque,
              id_variante: product.id,
            };

            let index = 1;
            categories.forEach((categorie) => {
              produit[`nom_attribue-${index}`] = getLabeAttribute(
                json.attributes,
                categorie.id
              );
              produit[`valeur_attribue-${index}`] = getLabelOption(
                json.attributes,
                categorie.id,
                categorie.optionId
              );
              index++;
            });

            for (let index2 = categories.length + 1; index2 < 15; index2++) {
              produit[`nom_attribue-${index2}`] = '';
              produit[`valeur_attribue-${index2}`] = '';
            }

            // produit[`valAttr${index}`] = option.label;
            products.push(produit);
          });

          products.forEach((produit, idx) => {
            products[idx].designation =
              json.dynamic.product_name[produit.id_variante].value;

            if (json.dynamic.code_mega)
              products[idx].reference =
                json.dynamic.code_mega[produit.id_variante].value;

            if (json.dynamic.sku)
              products[idx].sku = json.dynamic.sku[produit.id_variante].value;

            if (json.dynamic.code_strong)
              products[idx].code_strong =
                json.dynamic.code_strong[produit.id_variante].value;

            products[idx].code_article_fournisseur = '';

            if (json.dynamic.product_description)
              products[idx].descriptif = htmlToText(
                json.dynamic.product_description[produit.id_variante].value
              )
                .split('\n')
                .join('   ')
                .split(/\\\//g)
                .join("'");

            if (json.dynamic.dispo_medical)
              products[idx].dispositif_medical =
                json.dynamic.dispo_medical[produit.id_variante].value;

            const prices = json.optionPrices[produit.id_variante];

            if (prices.basePrice)
              products[idx].prix_reference = prices.basePrice.amount;

            if (prices.finalPrice)
              products[idx].prix_promotion =
                prices.basePrice.amount === prices.finalPrice.amount
                  ? ''
                  : prices.finalPrice.amount;

            let indexDegr = 1;
            prices.tierPrices.forEach((degr) => {
              products[idx][`quantite_degressif-${indexDegr}`] = degr.qty;
              products[idx][`prix_promotion_degressif-${indexDegr}`] =
                degr.price;
              indexDegr++;
            });

            for (
              let index2 = prices.tierPrices.length + 1;
              index2 < 12 - prices.tierPrices.length;
              index2++
            ) {
              produit[`quantite_degressif-${index2}`] = '';
              produit[`prix_promotion_degressif-${index2}`] = '';
            }

            // console.log(prices);
            // json.optionPrices[produit.id_variante].
          });

          // console.log(products);
        } else {
          // console.log(
          //   JSON.parse(
          //     $("script[type='text/x-magento-init']")['17'].children[0].data
          //   )['*']['Magento_Catalog/js/product/view/provider'].data.items[
          //     '30810'
          //   ]
          // );
          const designation = $(
            '#maincontent > div.columns > div > div.product-info-main > div.product-info-price > div.page-title-wrapper.product > h1 > span'
          )
            .text()
            .trim();
          const reference = $(
            '#maincontent > div.columns > div > div.product-info-main > div.product-info-price > div.product.attibute.code_mega.sku > div'
          )
            .text()
            .trim();
          const descriptif = $('#product-info-description-contenu > div > div')
            .text()
            .trim();

          let prix_reference = $(
            '#maincontent > div.columns > div > div.product-info-main > div.product-info-price > div.product-info-price-sku > div > span.price-container > meta:nth-child(2)'
          ).attr('content');

          let prix_promotion = '';
          if (prix_reference)
            prix_promotion = $(
              '#maincontent > div.columns > div > div.product-info-main > div.product-info-price > div.product-info-price-sku > div > span.besttiersprice-price > span > meta:nth-child(2)'
            ).attr('content');
          else
            prix_reference = $(
              '#maincontent > div.columns > div > div.product-info-main > div.product-info-price > div.product-info-price-sku > div > span > span > meta:nth-child(2)'
            ).attr('content');

          const quantite_degressif_1 = $(
            '#maincontent > div.columns > div > div.product-info-main > div.product-info-price > div.product-info-price-sku > ul > li:nth-child(1)'
          )
            .text()
            .trim()
            .split(' ')[1];
          const prix_promotion_degressif_1 = $(
            '#maincontent > div.columns > div > div.product-info-main > div.product-info-price > div.product-info-price-sku > ul > li:nth-child(1) > span > span'
          ).attr('data-price-amount');

          const quantite_degressif_2 = $(
            '#maincontent > div.columns > div > div.product-info-main > div.product-info-price > div.product-info-price-sku > ul > li:nth-child(2)'
          )
            .text()
            .trim()
            .split(' ')[1];
          const prix_promotion_degressif_2 = $(
            '#maincontent > div.columns > div > div.product-info-main > div.product-info-price > div.product-info-price-sku > ul > li:nth-child(2) > span > span'
          ).attr('data-price-amount');
          const quantite_degressif_3 = $(
            '#maincontent > div.columns > div > div.product-info-main > div.product-info-price > div.product-info-price-sku > ul > li:nth-child(3)'
          )
            .text()
            .trim()
            .split(' ')[1];
          const prix_promotion_degressif_3 = $(
            '#maincontent > div.columns > div > div.product-info-main > div.product-info-price > div.product-info-price-sku > ul > li:nth-child(3) > span > span'
          ).attr('data-price-amount');
          const quantite_degressif_4 = $(
            '#maincontent > div.columns > div > div.product-info-main > div.product-info-price > div.product-info-price-sku > ul > li:nth-child(4)'
          )
            .text()
            .trim()
            .split(' ')[1];
          const prix_promotion_degressif_4 = $(
            '#maincontent > div.columns > div > div.product-info-main > div.product-info-price > div.product-info-price-sku > ul > li:nth-child(4) > span > span'
          ).attr('data-price-amount');
          const quantite_degressif_5 = $(
            '#maincontent > div.columns > div > div.product-info-main > div.product-info-price > div.product-info-price-sku > ul > li:nth-child(5)'
          )
            .text()
            .trim()
            .split(' ')[1];
          const prix_promotion_degressif_5 = $(
            '#maincontent > div.columns > div > div.product-info-main > div.product-info-price > div.product-info-price-sku > ul > li:nth-child(5) > span > span'
          ).attr('data-price-amount');
          const quantite_degressif_6 = $(
            '#maincontent > div.columns > div > div.product-info-main > div.product-info-price > div.product-info-price-sku > ul > li:nth-child(6)'
          )
            .text()
            .trim()
            .split(' ')[1];
          const prix_promotion_degressif_6 = $(
            '#maincontent > div.columns > div > div.product-info-main > div.product-info-price > div.product-info-price-sku > ul > li:nth-child(6) > span > span'
          ).attr('data-price-amount');

          const product = {
            url,
            marque,
            id_variante: '',
            'nom_attribue-1': '',
            'valeur_attribue-1': '',
            'nom_attribue-2': '',
            'valeur_attribue-2': '',
            'nom_attribue-3': '',
            'valeur_attribue-3': '',
            'nom_attribue-4': '',
            'valeur_attribue-4': '',
            'nom_attribue-5': '',
            'valeur_attribue-5': '',
            'nom_attribue-6': '',
            'valeur_attribue-6': '',
            'nom_attribue-7': '',
            'valeur_attribue-7': '',
            'nom_attribue-8': '',
            'valeur_attribue-8': '',
            'nom_attribue-9': '',
            'valeur_attribue-9': '',
            'nom_attribue-10': '',
            'valeur_attribue-10': '',
            'nom_attribue-11': '',
            'valeur_attribue-11': '',
            'nom_attribue-12': '',
            'valeur_attribue-12': '',
            'nom_attribue-13': '',
            'valeur_attribue-13': '',
            'nom_attribue-14': '',
            'valeur_attribue-14': '',
            designation,
            reference,
            sku: '',
            code_strong: '',
            article__fournisseur: '',
            descriptif,
            dispositif_medical: '',
            prix_reference,
            prix_promotion,
            quantite_degressif_1,
            prix_promotion_degressif_1,
            quantite_degressif_2,
            prix_promotion_degressif_2,
            quantite_degressif_3,
            prix_promotion_degressif_3,
            quantite_degressif_4,
            prix_promotion_degressif_4,
            quantite_degressif_5,
            prix_promotion_degressif_5,
            quantite_degressif_6,
            prix_promotion_degressif_6,
            quantite_degressif_7: '',
            prix_promotion_degressif_7: '',
            quantite_degressif_8: '',
            prix_promotion_degressif_8: '',
            quantite_degressif_9: '',
            prix_promotion_degressif_9: '',
            quantite_degressif_10: '',
            prix_promotion_degressif_10: '',
          };

          products.push(product);
        }

        // console.log(products);
        await utils.convertToCSV(products, 'data/megadental/produits-data.csv');
        resolve();
      });
    };

    utils.scrapTemplate(url, fct, resolve);
  });
};

// Scrap data
exports.scrapProductsLinks = async () => {
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

// Scrap data
exports.scrapProductsData = async () => {
  const produits = await utils.readCSV('data/megadental/produits.csv', ',');

  let idx = 0;
  const startAt = `${new Date().getHours()}:${new Date().getMinutes()}`;
  for await (const produit of produits) {
    try {
      await getProductsdata(produit.link, produit.marque);
    } catch (error) {
      console.log(`ERROR : ${error.msg}`);
      utils.convertToCSV([error], 'data/megadental/ERR-produits-data.csv');
    }

    idx++;
    utils.logProgress(idx, produits.length, `${produit.id}`, startAt);
  }
  //   console.log(marques);
  //   await utils.convertToCSV(marques, 'data/megadental/marques.csv');

  return [];
};
