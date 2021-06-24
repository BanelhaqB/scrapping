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

const getAttrOf = async (id, fct) => {
  return new Promise((resolve) => {
    request.post(
      {
        url: 'https://www.henryschein.fr/webservices/JSONRequestHandler.ashx',
        headers: {
          Referer: `https://www.henryschein.fr/fr-fr/dental/p/vetements-accessoires/calots-et-sabots/calot-selekto-blanc/${id}`,
          'User-Agent': randomUA.getRandom(),
          'Content-Type': `application/x-www-form-urlencoded; charset=UTF-8`,
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'Cache-Control': 'no-cache',
          n: '53tyts7RCwUhiyJjZqoEF7vZWmBL5q9WpkKSSB3pEQo=',
          cookie:
            'Commerce_TestPersistentCookie=TestCookie; Commerce_TestSessionCookie=TestCookie; OneWeb=DivisionId=dental&sid=JXy4OeORddGlv2MGyXXxwnshYFapdqIyqmWo8rev8D8%3d&theme=Harmony; ASP.NET_SessionId=5t2l05e1w1haubnwzg0m4jni; HSCSProfileNonHttpOnly=PreferredCultureId=fr-FR; TestCookie=ok; ak_bmsc=CDBD33938561C4EC5AAE213586A1433F~000000000000000000000000000000~YAAQFLcQAhTAQxh6AQAACmi0LQwR2a/UVVlbyc74nizjt687mBm9oXGiKlgDdadxwtfNnVfG6K89M7XbxpuTbXBrrqRmnMxICBHUg1JCumLMe1hoS/9uDHxUYymAnx2hgHoOEqa56iGVci67OsMLTo8L5qYI9GmB/hWEyxUOaJfgDBDn5jbtAlIV+R0nyGF5jfNjIi4OdlTCYqDtQN+o6edAi3H/73ZNMR7Z5157NTduDrHmJPteQcbxD2q+7kq4Gz2q2PcfFeM3HGKPI/2J/b5PL9kOfY69fzdO2Mp/AmWh4IfPrYm5+rwHzb1M3Eg0i+NGcuHUNzctQihq2D1N1ljQFTJj0qRv3OttWH1C8G5ld1JsDbbBdgJMATVqWIDo; HSCSProfile=HSCSProfile=%7bae8e70e7-7f2b-4a5e-9078-94337ee8202d%7d&ExchangeMessage=; CampaignHistory=; OneWebSessionCookie=GetNextCounter=160&AccordianMenuActiveIndex=0; bm_mi=98E34CEFEBA68BBB7FED0A098EFA0288~C1pDnnjPQUfzBB2psW3k2PwjOuRpN8qDbylYMAOWpYbIf9zskhKvxVShbt+ECZ460KdPSS6hAgb4ENCCJVYs6BM6rnqa6l5q9VaZA5cGfxInQyVeOOdvS4U34nUq891d1bzB+dIBDQFP6TYudGZcq4bH22k7PIjyuRwjyMmZH7f6Al5UvoDp5qFnO2UOzmQC96tlMEFXs2erql1/hkyBhOpl1K5aTnslDeHZty3PgAaJJcYsDuPUnmSxnyb2nwcxsQUswTNBazJEEzj0LzVFkQ==; bm_sv=F24A3B8929B20DB343BDFE66EE39DAF0~wTGcTeF/6PM2TUisnEa1S3CPfcCAeXNi1h/wWDD/dk/sbt1ceVETRCsuyVls9YIePYquxY4s9T6rw4F3LOupRdnePA7U2KJJBF4TV/xZ07kJCUjkRI0+vCoBOkVc/GjF8hOyOMWzqPr0FvxfbwVE9o5BlxCGWIhHFZE/3oy5gnA=',
        },
        form: {
          searchType: 7,
          did: 'dental',
          catalogName: 'GENCABI',
          endecaCatalogName: 'GENCABI',
          ProductId: id,
          culture: 'fr-fr',
        },
      },
      function (error, response, html) {
        if (!error) {
          fct(response, resolve);
          // resolve(true);
        } else {
          console.log(error);
        }
      }
    );
  });
};

const scrapDataOf = async (url) => {
  return new Promise(async (resolve) => {
    const isVariantes = await getAttrOf(
      url.split('/')[9],
      function (res, resolve2) {
        // console.log(res.body);
        resolve2(
          res.body.length === 0
            ? -1
            : JSON.parse(JSON.parse(res.body.split('\\r\\n').join('')))
        );
      }
    );

    if (isVariantes !== -1) {
      const varientes = [];
      for (let k = 0; k < isVariantes.product.length; k++) {
        const variante = {
          url: isVariantes.product[k].attributes[0].ProductSEOUrl,
        };

        let endNamesAttr = 0;
        for (let g = 1; g < Object.values(isVariantes.product[k]).length; g++) {
          variante[`nom_attr_${g}`] =
            isVariantes.dimension[
              _.findIndex(isVariantes.dimension, function (o) {
                return o.name == Object.keys(isVariantes.product[k])[g];
              })
            ].displayName;
          variante[`val_attr_${g}`] = Object.values(isVariantes.product[k])[g];
          endNamesAttr++;
        }

        for (let l = endNamesAttr + 1; l < 8; l++) {
          variante[`nom_attr_${l}`] = undefined;
          variante[`val_attr_${l}`] = undefined;
        }
        varientes.push(variante);
      }
      resolve();
      await utils.convertToCSV(varientes, 'data/hs/produits-url-varientes.csv');
    } else {
      const fct = async ($, response, html, config, dataArr) => {
        const purl = url;
        const pmarque = $(
          '#ctl00_cphMainContentHarmony_ucProductSummary_ulProductSummary > li:nth-child(1) > h2 > small'
        )
          .text()
          .split('|')[1]
          .split('-')[0]
          .trim();

        const pid = url.split('/')[9];
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
          '#ctl00_cphMainContentHarmony_ucProductSummary_ulProductSummary > li:nth-child(1) > h2'
        )
          .text()
          .split(pid)[0]
          .trim();
        const pref = pid;
        const tmp = $(
          '#ctl00_cphMainContentHarmony_ucProductSummary_ulProductSummary > li:nth-child(1) > h2 > small'
        )
          .text()
          .split('|')[1]
          .split('-')
          .map((e) => e.trim());

        tmp.shift();
        const psku = tmp.join('-');
        const pcodef = psku;
        const pdesc = $(
          '#ctl00_cphMainContentHarmony_ucProductSummary_ulProductSummary > li.customer-notes > div.value'
        )
          .text()
          .trim();

        const promo =
          $(
            '#ctl00_cphMainContentHarmony_ucProductSummary_ucPackagingOptions_rptProductList_ctl00_liProductAction > div:nth-child(1) > div:nth-child(1) > span:nth-child(3)'
          )
            .text()
            .trim() === 'Promotion';

        let isDeg = false;
        if (promo) {
          isDeg = $(
            '#ctl00_cphMainContentHarmony_ucProductSummary_ucPackagingOptions_rptProductList_ctl00_liProductAction > div:nth-child(1) > div:nth-child(1) > span:nth-child(2) > span'
          )
            .text()
            .trim()
            .includes('x');
        } else {
          isDeg = $(
            '#ctl00_cphMainContentHarmony_ucProductSummary_ucPackagingOptions_rptProductList_ctl00_liProductAction > div:nth-child(1) > div:nth-child(1) > span:nth-child(1) > span:nth-child(2)'
          )
            .text()
            .trim()
            .includes('x');
        }

        // console.log(promo, isDeg);

        const pprixref =
          $(
            '#ctl00_cphMainContentHarmony_ucProductSummary_ucPackagingOptions_rptProductList_ctl00_liProductAction > div:nth-child(1) > div:nth-child(1) > span:nth-child(1)'
          )
            .text()
            .trim()
            .split(' ')[0]
            .replace(',', '.') * 1;

        let ppromouni = undefined;
        let pquantdeg1 = undefined;
        let pprixdeg1 = undefined;

        if (isDeg) {
          if (promo) {
            ppromouni =
              $(
                '#ctl00_cphMainContentHarmony_ucProductSummary_ucPackagingOptions_rptProductList_ctl00_liProductAction > div:nth-child(1) > div:nth-child(1) > span:nth-child(2)'
              )
                .text()
                .trim()
                .replace(',', '.')
                .split(' ')[0] * 1;

            pquantdeg1 =
              $(
                '#ctl00_cphMainContentHarmony_ucProductSummary_ucPackagingOptions_rptProductList_ctl00_liProductAction > div:nth-child(1) > div:nth-child(1) > span:nth-child(2) > span'
              )
                .text()
                .trim()
                .replace(',', '.')
                .split(' ')[0]
                .split('x')[1] * 1;
            pprixdeg1 =
              $(
                '#ctl00_cphMainContentHarmony_ucProductSummary_ucPackagingOptions_rptProductList_ctl00_liProductAction > div:nth-child(1) > div:nth-child(1) > span:nth-child(2) > span'
              )
                .text()
                .trim()
                .replace(',', '.')
                .split(' ')[1] * 1;
          } else {
            pquantdeg1 =
              $(
                '#ctl00_cphMainContentHarmony_ucProductSummary_ucPackagingOptions_rptProductList_ctl00_liProductAction > div:nth-child(1) > div:nth-child(1) > span:nth-child(1) > span'
              )
                .text()
                .trim()
                .replace(',', '.')
                .split(' ')[0]
                .split('x')[1] * 1;
            pprixdeg1 =
              $(
                '#ctl00_cphMainContentHarmony_ucProductSummary_ucPackagingOptions_rptProductList_ctl00_liProductAction > div:nth-child(1) > div:nth-child(1) > span:nth-child(1) > span'
              )
                .text()
                .trim()
                .replace(',', '.')
                .split(' ')[1] * 1;
          }
        }

        if (!isDeg) {
          if (promo) {
            ppromouni =
              $(
                '#ctl00_cphMainContentHarmony_ucProductSummary_ucPackagingOptions_rptProductList_ctl00_liProductAction > div:nth-child(1) > div:nth-child(1) > span:nth-child(2) > span:nth-child(1)'
              )
                .text()
                .trim()
                .replace(',', '.')
                .split(' ')[0] * 1;
          }
        }

        // let isVar = undefined;
        // const isVar = $(
        //   '#ctl00_cphMainContentHarmony_ucProductSummary_ulProductSummary > li:nth-child(5) > ul'
        // )['0'];

        // console.log(promo, isDeg, isVar);

        // const pquantdeg2 = undefined;
        // const pprixdeg2 = undefined;
        // const pquantdeg3 = undefined;
        // const pprixdeg3 = undefined;
        // const pquantdeg4 = undefined;
        // const pprixdeg4 = undefined;

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
          // quantite_degressif_2: pquantdeg2,
          // prix_promo_degressif_2: pprixdeg2,
          // quantite_degressif_3: pquantdeg3,
          // prix_promo_degressif_3: pprixdeg3,
          // quantite_degressif_4: pquantdeg4,
          // prix_promo_degressif_4: pprixdeg4,
        };

        // console.log(p);
        await utils.convertToCSV([p], 'data/hs/produits-data.csv');
        resolve(p);
      };

      utils.scrapTemplate(url, fct, resolve);
    }
  });
};

const getAllProductsUrl = async () => {
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
};

const scrapAllData = async (url) => {};

// Scrap data
exports.scrapProductsData = async () => {
  let idx = 0;
  const startAt = `${new Date().getHours()}:${new Date().getMinutes()}`;

  const allProducts = await utils.readCSV('data/hs/produits-url.csv', ',');
  for await (const p of allProducts) {
    await scrapDataOf(p.url);
    idx++;
    utils.logProgress(idx, allProducts.length, `Produit`, startAt);
  }

  // //  Promo + degresif
  // console.log(1, 'Promo + degresif');
  // await scrapDataOf(
  //   'https://www.henryschein.fr/fr-fr/dental/p/nouveautes/nouveautes/alkacide-concentre-alkapharm-flacon-de-1l/950-1072'
  // );
  // console.log('--------------------------------------------');

  // // Pas promo - degressif
  // console.log(2, 'Pas promo - degressif');
  // await scrapDataOf(
  //   'https://www.henryschein.fr/fr-fr/dental/p/anesthesie-pharmacie/sprays-de-refroidissement/bluefreeze-steriblue-gout-neutre-spray-de-200ml/882-5609'
  // );
  // console.log('--------------------------------------------');

  // // Promo - pas degressif
  // console.log(3, 'Promo - pas degressif');
  // await scrapDataOf(
  //   'https://www.henryschein.fr/fr-fr/dental/p/cfao/ceramique-hybride/vita-implant-solutions-vita-emanic-is-4m2t-is-14l-boite-de-5/892-8579'
  // );
  // console.log('--------------------------------------------');

  // // pas degressif - pas promo
  // console.log(4, 'pas degressif - pas promo');
  // await scrapDataOf(
  //   'https://www.henryschein.fr/fr-fr/dental/p/anesthesie-pharmacie/aiguilles/aiguilles-carpule-free-flow-kulzer-27g-25-mm-boite-de-100/890-4332'
  // );
  // console.log('--------------------------------------------');
  // // // pas degressif - pas promo - variantes
  // // console.log(5, 'pas degressif - promo - variantes');
  // // await scrapDataOf(
  // //   'https://www.henryschein.fr/fr-fr/dental/p/cfao/ceramique-hybride/vita-implant-solutions-vita-emanic-is-4m2t-is-14l-boite-de-5/892-8579'
  // // );
  // // console.log('--------------------------------------------');

  // await scrapAllData(
  //   'https://www.henryschein.fr/fr-fr/dental/p/vetements-accessoires/calots-et-sabots/calot-selekto-blanc/956-0428'
  // );

  return [];
};
