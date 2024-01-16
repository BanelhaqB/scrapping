/* eslint-disable no-restricted-syntax */
/* eslint-disable node/no-unsupported-features/es-syntax */
const _ = require('lodash');
const request = require('request');
const randomUA = require('random-fake-useragent');
const utils = require('../utils/utils');

const isTeacherProfile = async (id) => {
  return new Promise((resolve) => {
    request.post(
      {
        url: 'https://www.trouvetonprof.fr/api/',
        credentials: 'include',
        headers: {
          Referer: `https://www.trouvetonprof.fr/map`,
          'User-Agent': randomUA.getRandom(),
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'no-cors',
          'Sec-Fetch-Site': 'same-origin',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache',
          cookie:
            '__stripe_mid=8dc5fcb6-6b46-4811-86b9-027150f27987ddc65f; PHPSESSID=b858vta06funmfha671oci86a5; ttp_cookie_auth=fb4da9d49e16db49bad6660c9d291c28fa8243e52897e16dd46d715ed6d3; __stripe_sid=301547ad-1045-4d7a-9698-97129c8619c58541b9',
        },
        referrer: 'https://www.trouvetonprof.fr/map',
        body: `id=${id}&module=public&command=getprofile&key=457a2454-03fd-4f75-bc30-8ddefe73ed4b`,
        method: 'POST',
        mode: 'cors',
      },
      function (error, response) {
        if (!error) {
          const body = JSON.parse(response.body);
          if (body.code) resolve(null);
          else {
            const teacher = JSON.parse(body.result);
            resolve(teacher);
          }
        } else {
          console.log(error);
          resolve(null);
        }
      }
    );
  });
};

const sendMessageTo = async (id) => {
  const message =
    "Bonsoir, je recherche un professeur particulier et votre profil m'intéresse. Auriez-vous une adresse e-mail ou un numéro de téléphone afin que nous puissions échanger ? Merci à vous et très bonne fin de soirée.";
  return new Promise((resolve, reject) => {
    request.post(
      {
        url: 'https://www.trouvetonprof.fr/api/',
        credentials: 'include',
        headers: {
          'User-Agent': randomUA.getRandom(),
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'no-cors',
          'Sec-Fetch-Site': 'same-origin',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache',
          cookie:
            '__stripe_mid=8dc5fcb6-6b46-4811-86b9-027150f27987ddc65f; PHPSESSID=b858vta06funmfha671oci86a5; ttp_cookie_auth=fb4da9d49e16db49bad6660c9d291c28fa8243e52897e16dd46d715ed6d3; __stripe_sid=301547ad-1045-4d7a-9698-97129c8619c58541b9',
        },
        referrer: 'https://www.trouvetonprof.fr/map',
        body: `to=${id}&message=${message}&module=chat&command=sendmessage&key=457a2454-03fd-4f75-bc30-8ddefe73ed4b&uid=2039&uhash=%242y%2410%24XHg5Y2ZmMGUyMmQxOGM1YeFKoR2e.0jmNB1sebPfP1w5o.OCi.hdy`,
        method: 'POST',
        mode: 'cors',
      },
      function (error, response) {
        if (!error) {
          resolve();
        } else {
          console.log(error);
          reject();
        }
      }
    );
  });
};

const sendMessages = async () => {
  const teachers = await utils.readCSV('data/ttp/teachers.csv', ',');
  for await (const teacher of teachers) {
    await sendMessageTo(teacher.uid);
  }
  console.log(`${teachers.length} teachers contacted`);
};

const getTeacherIds = async () => {
  const teachersIds = _.range(100, 2060);
  const startAt = `${new Date().getHours()}:${new Date().getMinutes()}`;
  for await (const _id of teachersIds) {
    const teacher = await isTeacherProfile(_id);
    if (teacher) await utils.convertToCSV([teacher], 'data/ttp/teachers.csv');
    utils.logProgress(_id, 2040, `Profile`, startAt);
  }
  return [];
};

const getConversations = async () => {
  return new Promise((resolve, reject) => {
    request.post(
      {
        url: 'https://www.trouvetonprof.fr/api/',
        credentials: 'include',
        headers: {
          'User-Agent': randomUA.getRandom(),
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'no-cors',
          'Sec-Fetch-Site': 'same-origin',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache',
          cookie:
            '__stripe_mid=8dc5fcb6-6b46-4811-86b9-027150f27987ddc65f; PHPSESSID=b858vta06funmfha671oci86a5; ttp_cookie_auth=fb4da9d49e16db49bad6660c9d291c28fa8243e52897e16dd46d715ed6d3; __stripe_sid=301547ad-1045-4d7a-9698-97129c8619c58541b9',
        },
        referrer: 'https://www.trouvetonprof.fr/chat',
        body: `module=chat&command=getconversations&key=457a2454-03fd-4f75-bc30-8ddefe73ed4b&uid=2039&uhash=%242y%2410%24XHg5Y2ZmMGUyMmQxOGM1YeFKoR2e.0jmNB1sebPfP1w5o.OCi.hdy`,
        method: 'POST',
        mode: 'cors',
      },
      function (error, response) {
        if (!error) {
          const body = JSON.parse(response.body);
          const conversations = body.result.map((c) => {
            return { id: c.id, teacher: c.participants[2] };
          });
          resolve(conversations);
        } else {
          console.log(error);
          reject();
        }
      }
    );
  });
};

const getConversationData = async (id) => {
  return new Promise((resolve, reject) => {
    request.post(
      {
        url: 'https://www.trouvetonprof.fr/api/',
        credentials: 'include',
        headers: {
          'User-Agent': randomUA.getRandom(),
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'no-cors',
          'Sec-Fetch-Site': 'same-origin',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache',
          cookie:
            '__stripe_mid=8dc5fcb6-6b46-4811-86b9-027150f27987ddc65f; PHPSESSID=b858vta06funmfha671oci86a5; ttp_cookie_auth=fb4da9d49e16db49bad6660c9d291c28fa8243e52897e16dd46d715ed6d3; __stripe_sid=301547ad-1045-4d7a-9698-97129c8619c58541b9',
        },
        referrer: 'https://www.trouvetonprof.fr/chat',
        body: `id=${id}&module=chat&command=getmessages&key=457a2454-03fd-4f75-bc30-8ddefe73ed4b&uid=2039&uhash=%242y%2410%24XHg5Y2ZmMGUyMmQxOGM1YeFKoR2e.0jmNB1sebPfP1w5o.OCi.hdy`,
        method: 'POST',
        mode: 'cors',
      },
      function (error, response) {
        if (!error) {
          const body = JSON.parse(response.body);
          const messages = Object.values(body.result).filter(
            (m) => m.from !== '2039'
          );
          if (messages.length > 0) {
            const content = messages.map((m) => m.content).join(' -- ');
            const conv = {
              teacher: messages[0].from * 1,
              content,
              emails: [
                ...content.matchAll(
                  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/gm
                ),
              ].map((e) => e[0]),
              phones: [
                ...content.matchAll(/(?:\+33|0)[1-9](?:[\s.-]?[0-9]{2}){4}/gm),
              ].map((e) => e[0]),
            };
            resolve(conv);
          }
          resolve(null);
        } else {
          console.log(error);
          reject();
        }
      }
    );
  });
};

const scrapConversations = async () => {
  const teachers = await utils.readCSV('data/ttp/teachers.csv', ',');
  const teachersWithData = [];
  const conversations = await getConversations();
  console.log(`${conversations.length} conversations collected`);
  for await (const conv of conversations) {
    const data = await getConversationData(conv.id);

    if (data && (data.emails.length > 0 || data.phones.length > 0)) {
      const teacher = _.find(teachers, (t) => t.uid * 1 === data.teacher * 1);
      teachersWithData.push(
        _.assign(teacher, {
          email: _.last(data.emails),
          phone: _.last(data.phones),
          conversation: data.content,
        })
      );
    }
  }
  console.log(`${teachersWithData.length} contacts collected`);
  await utils.convertToCSV(teachersWithData, 'data/ttp/teachers-with-data.csv');
};

exports.scrap = async () => {
  const { action } = process.env;
  switch (action) {
    case 'get-teachers-list':
      await getTeacherIds();
      break;
    case 'send-messages':
      await sendMessages();
      break;
    case 'get-teachers-data':
      await scrapConversations();
      break;
    default:
      break;
  }
  return [];
};
