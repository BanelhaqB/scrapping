/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-restricted-syntax */
const _ = require('lodash');
const request = require('request');
const randomUA = require('random-fake-useragent');
const csvParser = require('csv-parser');
const { htmlToText } = require('html-to-text');
const scrap = require('../scrap');
const utils = require('../utils/utils');

const scrapAllData = async (url, prenom, nom, tel, id) => {
  return new Promise((resolve, reject) => {
    const fct = async ($, response, html, config, dataArr) => {
      const prof = {
        id,
        url,
        prenom,
        nom,
        tel,
        age: $(
          '#profile-sitter-header > div > div > div.col-md-11.main.col-xs-16 > div > div > div > div.col-md-12.ad-applicant-profil-infos.col-xs-16 > ul.list-inline.list-unstyled.ad-applicant-experiences.row > li > p'
        )
          .text()
          .trim()
          .split(' ans')[0],
        experience: $(
          '#profile-sitter-header > div > div > div.col-md-11.main.col-xs-16 > div > div > div > div.col-md-12.ad-applicant-profil-infos.col-xs-16 > ul.list-inline.list-unstyled.ad-applicant-experiences.row > li > p'
        )
          .text()
          .trim()
          .split(', ')[1]
          ? $(
              '#profile-sitter-header > div > div > div.col-md-11.main.col-xs-16 > div > div > div > div.col-md-12.ad-applicant-profil-infos.col-xs-16 > ul.list-inline.list-unstyled.ad-applicant-experiences.row > li > p'
            )
              .text()
              .trim()
              .split(', ')[1]
              .split(' an')[0]
              .replace('Plus de ', '+')
          : 'none',
        description: `${$(
          '#profile-sitter-content > div > div:nth-child(1) > div > div > div > h3'
        )
          .text()
          .trim()} \n ${$(
          '#profile-sitter-content > div > div:nth-child(1) > div > div > div > p'
        )
          .text()
          .trim()}`,
        science:
          $(
            '#profile-sitter-header > div > div > div.col-md-11.main.col-xs-16 > div > div > div > div.col-md-12.ad-applicant-profil-infos.col-xs-16 > ul.list-inline.list-unstyled.ad-applicant-services > li:nth-child(1)'
          ).attr('class') === 'available ',
        langues:
          $(
            '#profile-sitter-header > div > div > div.col-md-11.main.col-xs-16 > div > div > div > div.col-md-12.ad-applicant-profil-infos.col-xs-16 > ul.list-inline.list-unstyled.ad-applicant-services > li:nth-child(2)'
          ).attr('class') === 'available ',
        info:
          $(
            '#profile-sitter-header > div > div > div.col-md-11.main.col-xs-16 > div > div > div > div.col-md-12.ad-applicant-profil-infos.col-xs-16 > ul.list-inline.list-unstyled.ad-applicant-services > li:nth-child(3)'
          ).attr('class') === 'available ',
        musique:
          $(
            '#profile-sitter-header > div > div > div.col-md-11.main.col-xs-16 > div > div > div > div.col-md-12.ad-applicant-profil-infos.col-xs-16 > ul.list-inline.list-unstyled.ad-applicant-services > li:nth-child(4)'
          ).attr('class') === 'available ',
        aidedevoirs:
          $(
            '#profile-sitter-header > div > div > div.col-md-11.main.col-xs-16 > div > div > div > div.col-md-12.ad-applicant-profil-infos.col-xs-16 > ul.list-inline.list-unstyled.ad-applicant-services > li:nth-child(5)'
          ).attr('class') === 'available ',
        lat: $(
          '#profile-map > div > div > div > section > div.col-md-10.main.col-xs-16 > div > google-map'
        ).attr(':latitude'),
        lgt: $(
          '#profile-map > div > div > div > section > div.col-md-10.main.col-xs-16 > div > google-map'
        ).attr(':longitude'),
        ville: $('#breadcrumb > li:nth-child(3) > a')
          .attr('href')
          .split('/')[4],
        disponible: $('#layout-applicant > div.yp-paused-ad > img').attr('src')
          ? false
          : true,
        verified: $(
          '#profile-sitter-header > div > div > div.col-md-11.main.col-xs-16 > div > div > div > div.col-md-4.col-xs-16 > figure > span'
        ).attr('data-toggle')
          ? true
          : false,
      };

      // console.log(prof);
      await utils.convertToCSV([prof], 'data/yp/data-prof.csv');
    };

    utils.scrapTemplate(url, fct, resolve);
  });
};

exports.scrapProductsData = async () => {
  let idx = 0;
  const startAt = `${new Date().getHours()}:${new Date().getMinutes()}`;

  const allProfs = await utils.readCSV('data/yp/url-profs.csv', ',');

  let idx2 = 0;
  for await (const p of allProfs) {
    if (idx === process.env.V * 1 + idx2 * 10) {
      try {
        await scrapAllData(p.url, p.prenom, p.nom, p.tel, p.id);
      } catch (error) {
        console.log('error');
      }

      idx2++;
      utils.logProgress(idx, allProfs.length, `Profs`, startAt);
    }
    idx++;
  }
  // await scrapAllData(
  //   'https://yoopies.fr/aide-devoir-domicile/noisy-le-grand/prof-polyvalent-toutes-matieres/3715962',
  //   'Frédéric',
  //   'B.',
  //   '+33628062048'
  // );

  //   await scrapAllData(
  //     'https://yoopies.fr/cours-chimie/paris/cours-mathematiques-chimie/1000304',
  //     'Léa',
  //     'N.',
  //     '+33622009193'
  //   );
  return [];
};
