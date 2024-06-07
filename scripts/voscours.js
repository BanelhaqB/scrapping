import fetch from "node-fetch";
import _ from "lodash";

import csv from "csv-parser";
import dotenv from "dotenv";

import * as fs from "node:fs/promises";
import randomUA from "random-fake-useragent";
import { exec } from "child_process";

import utils from "../utils/utils.js";
import scrap from "../scrap.js";

// ------- SITEMAPS ---------

// Download sitemap
const downloadSitemap = async () => {
  return new Promise(async (resolve, reject) => {
    const fct = async ($, response, html, config, dataArr) => {
      await fs.writeFile(
        `data/voscours/sitemaps/sitemap-voscours.xml`,
        html,
        (err) => {
          if (err) throw err;
        }
      );

      console.log(`Voscours : sitemap -- is writted ✅`);
      resolve();
    };

    await utils.scrapTemplate(
      `https://www.voscours.fr/sitemap-anuncios.aspx?tipo=Profesores`,
      fct,
      resolve,
      reject
    );
  });
};

// Clean sitemap
const cleanSitemap = async () => {
  return new Promise(async (resolve) => {
    const data = await fs.readFile(
      `data/voscours/sitemaps/sitemap-voscours.xml`,
      "utf8"
    );

    let array = data
      .split("loc")
      .map((e) => e.trim().substring(1, e.trim().length - 2));

    array = _.filter(array, function(e) {
      return e[0] === "h";
    });

    array = _.map(array, (e) => {
      return { id: e.split("-")[e.split("-").length - 1], url: e };
    });

    array = _.uniqBy(array, "id");

    await utils.convertToCSV(
      array,
      `data/voscours/urls/urls-voscours.csv`,
      true
    );

    console.log(
      `voscours : sitemap -- is clean ✅ - (${array.length} unique url)`
    );

    resolve(array);
  });
};

// ---- Scrap all sitemap
const downloadAndCleanSitemap = async () => {
  console.log(`voscours : Update sitemaps starting... 🛠`);
  await downloadSitemap();
  await cleanSitemap();

  console.log(`voscours : Sitemap is clean 🎉`);
};

// -------- DATA -----------

// Get new urls
const getNew = async () => {
  console.log(`voscours : Counting new accounts... 🛠`);

  const urls = await utils.readCSV(`data/voscours/urls/urls-voscours.csv`, ",");
  let oldURLS = await utils.readCSV(
    `data/voscours/urls/old-urls-voscours.csv`,
    ","
  );
  // let errorURLS = await utils.readCSV(`data/voscours/errors-voscours.csv`, ',');

  oldURLS = oldURLS.map((e) => {
    return { url: e.url, id: e.id };
  });

  // errorURLS = errorURLS.map((e) => {
  //   return { url: e.url, id: e.id };
  // });

  // const newURLS = _.filter(urls, (e) => {
  //   return (
  //     !oldURLS.map((u) => u.id).includes(e.id) ||
  //     !errorURLS.map((u) => u.id).includes(e.id)
  //   );
  // });

  console.log(oldURLS.length, urls.length);
  const newURLS = _.filter(urls, (e) => {
    return !oldURLS.map((u) => u.id).includes(e.id);
  });

  await utils.convertToCSV(
    newURLS,
    `data/voscours/new/new-urls-${utils.getDayToday()}.csv`,
    true
  );

  await utils.convertToCSV(newURLS, `data/voscours/urls-voscours.csv`);

  console.log(`voscours : ${newURLS.length} new accounts 📥`);
};

// Scrap messagerie
// dotenv.config({ path: './config.env' });

const compte = {
  // Pauline
  // id: '6165e4072da5452890cab892',
  // upt: 'RdiuwreN2UgpQ40hsMRYSZJdY_TWYyC_0',
  // Camille
  // id: '62cebd712da5453a4c596710',
  // upt: 'oTR5_cxk2khmZ11lREegS6QjxO4SNuEJ0',
  // Younes
  id: "666300d72da5432810f5091c",
  upt: "oTR5_cxk2khmZ11lREegS6QjxO4SNuEJ0"
};

const checkInOneConv = async (headers, email, phone, data, name, title) => {
  const idConv = conv.Id;
  const conversationPromise = await fetch(
    `https://www.tusclases.com/api_common/api/messages/gdlg?ucid=${compte.id}&upt=${compte.upt}&gid=${idConv}&l=fr&tzo=-120&tcpcid=0&ch=369B5ABC50B45972F04FB6D9E973C2F2CEBBF282724D65191B305B63DD846D72826C5FFDA981778568E054B0F5ADE121F03B86999108FE36ED5CB2A653549859
        `,
    {
      headers
    }
  );

  const conversation = await conversationPromise.json();

  console.log("----------------------------------");
  // eslint-disable-next-line no-loop-func
  conversation.Messages.forEach((msg) => {
    // console.log(msg.Content);
    email = /\b([^\s]+@[^\s]+)\b/gi.exec(msg.Content);
    phone = /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/gim.exec(msg.Content);

    if (email || phone) {
      email = email ? email[0] : null;
      phone = phone ? phone[0] : null;

      // console.log({ name, email, phon });
      data.push({ name, email, phone, title });
    }
  });
};

const getURL = async (idTeacher) => {
  return new Promise(async (resolve) => {
    scrap.get({
      url: `https://www.tusclases.com/api_common/api/messages/gdgci?ucid=${compte.id}&gid=${idTeacher}&tcpcid=0&ch=369B5ABC50B45972F04FB6D9E973C2F2CEBBF282724D65191B305B63DD846D72826C5FFDA981778568E054B0F5ADE121F03B86999108FE36ED5CB2A653549859&hp=false&spd=&sp=true`,
      body: ``,
      headers: {
        "User-Agent": randomUA.getRandom()
      },
      referer: "https://www.voscours.fr/account/messaging",
      onSuccess: async ($, response, html, config) => {
        if (response.statusCode !== 200) {
          console.error(
            `loading of ${config.url} failed, response code= ${response.statusCode} ${response}`
          );
          console.log(response.error, response.stack);
          resolve();
          return;
        }

        // console.log(html);
        const obj = JSON.parse(html);

        resolve(obj ? obj.OtherUser.ProfileUrl : "");
      },
      onError: (error) => {
        console.log("error:", error);
        resolve();
      }
    });
  });
};

const runThroughPage = async (page, data) => {
  const headers = {
    "User-Agent": randomUA.getRandom()
  };

  const conversationsPromise = await fetch(`https://www.tusclases.com/api_common/api/messages/glg?ucid=666300d72da5432810f5091c&upt=NsuKq--G3Egx9s1Y7kMxQY9nOG2HqHan0&l=fr&tzo=-120&ft=0&q=&tcpcid=0&ch=1134F8CB0AB42FFDD2B88B0A1DB0C04CF893F6B9DF6F77D2AE658D0BCEC0DE653A66F188650DAA042E24997E764EFDEAE69C0AB06971A4DF66F8FEE4D59FF668&pid=9&lpd=${page}&igi=`, {
    credentials: "omit",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:126.0) Gecko/20100101 Firefox/126.0",
      Accept: "*/*",
      "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "cross-site"
    },
    referrer: "https://www.voscours.fr/",
    method: "GET",
    mode: "cors"
  });

  //

  const conversations = await conversationsPromise.json();

  // eslint-disable-next-line no-restricted-syntax, node/no-unsupported-features/es-syntax
  for await (const conv of conversations.Conversations) {
    console.log(conv);
    let messages = [];
    let phone = null;

    fetch(`https://www.tusclases.com/api_common/api/messages/gdlg?ucid=666300d72da5432810f5091c&upt=NsuKq--G3Egx9s1Y7kMxQY9nOG2HqHan0&gid=${conv.Id}&l=fr&tzo=-120&tcpcid=0&ch=1134F8CB0AB42FFDD2B88B0A1DB0C04CF893F6B9DF6F77D2AE658D0BCEC0DE653A66F188650DAA042E24997E764EFDEAE69C0AB06971A4DF66F8FEE4D59FF668`, {
      "credentials": "omit",
      "headers": {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:126.0) Gecko/20100101 Firefox/126.0",
        "Accept": "*/*",
        "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "Priority": "u=1"
      },
      "referrer": "https://www.voscours.fr/",
      "method": "GET",
      "mode": "cors"
    }).then((response) => response.text())
      .then(async (json) => {
        console.log(JSON.parse(json));
        messages = JSON.parse(json).Messages;
      });

    await fetch("https://www.voscours.fr/api/api/messaging/gcpp", {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua":
          "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
      },
      referrer: `https://www.voscours.fr/account/messaging/${conv.Id}`,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: `out=${conv.Participants[0].Id}&po=9&uid=3831641`,
      method: "POST",
      mode: "cors",
      credentials: "include"
    })
      .then((response) => response.text())
      .then(async (json) => {
        phone = JSON.parse(json).PhoneNumber;
      });

    const messagesText = _.map(messages, (m) => `${m.Content}`).join(" ");

    let email = /\b([^\s]+@[^\s]+)\b/gi.exec(messagesText);
    phone = /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/gim.exec(messagesText)
      ? /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/gim.exec(messagesText)[0]
      : phone;

    if (email || phone) {
      const name = conv.Participants[0].Name;
      const title = conv.AnuncioTitle;
      const idTeacher = conv.Participants[0].Id;
      const idAn = messages[1].RefAdId;

      email = email
        ? email[0].replace("mail:", "").replace(`${phone}.`, "")
        : null;
      data.push({
        name,
        email,
        phone,
        title,
        idAn,
        idTeacher
      });
    } else {
      const nbUnreadMessage = conv.NUnreadMessages;
      if (nbUnreadMessage > 1) {
        console.log(`nb unreadmsg = ${nbUnreadMessage}`);

        await checkInOneConv(headers, email, phone, data, name, title);
      }
    }
  }

  const hasNextConv = conversations.Conversations.length > 1;
  return hasNextConv;
};

const runThroughAllPages = async (page, data) => {
  const hasNextConv = await runThroughPage(page, data);
  if (hasNextConv) {
    page++;
    data = await runThroughAllPages(page, data);
  }
  return data;
};

const getEmails = async () => {
  let data = [];
  data = await runThroughAllPages(0, data);
  console.log(data);
  await utils.convertToCSV(
    data,
    `data/voscours/new/new-data.csv`
  );
  await utils.convertToCSV(data, `data/voscours/data-voscours-1.csv`);

  console.log(data, data.length);
};

const sendMsg = async (referer) => {
  return new Promise((resolve, reject) => {
    scrap.get({
      url: referer,
      headers: {},
      onSuccess: async ($, response, html, config) => {
        if (response.statusCode != 200) {
          console.error(
            "loading of " +
            config.url +
            " failed, response code=" +
            response.statusCode
          );
          prof = {
            url: referer,
            code: response.statusCode
          };
          await utils.convertToCSV(
            [prof],
            `data/voscours/errors/errors-voscours.csv`,
            false
          );
          resolve();
          return;
        }
        let name = $($(".username")[0]).text();
        // console.log(name);
        let inputs = $("input[name='ctl00$m$ctl00$idad']");
        if (inputs.length == 1) {
          let input = $(inputs[0]);
          if (input != undefined) {
            let id = input.val();
            if (id == undefined || id == "") {
              prof = {
                url: referer,
                code: response.statusCode
              };
              await utils.convertToCSV(
                [prof],
                `data/voscours/errors/errors-voscours.csv`,
                false
              );
              resolve();
            } else {
              console.log(`Sending message to ${name} 🛠`);
              // console.log(
              //   `curl 'https://www.voscours.fr/contact-user.aspx?an=${id}' -X POST -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:102.0) Gecko/20100101 Firefox/102.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' -H 'Accept-Language: fr-FR,en-US;q=0.7,en;q=0.3' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Origin: https://www.voscours.fr' -H 'Connection: keep-alive' -H 'Referer: https://www.voscours.fr/contact-user.aspx?an=3058021' -H 'Cookie: UU=11220504151323; pp={"analiticas": {"All":true,"_ga":true,"source":true,"_gid":true,"_gat":true}, "funcionales": {"All":true,"g_state":true,"lastsearch":true,"TCP_ms":true,"TCP_UI":true,"classgap_apt":true,"applus2":true}, "publicidad": {"All":true,"__gads":true,"datr_usida":true}, "fecha": 1651672122029}; g_state={"i_p":1651686127455,"i_l":1}; G_ENABLED_IDPS=google; cfg2=21; AWSALBTG=6LJB4xCgMemznY8M1p+TahJ25ILjAmqyuGC2lg/3LUN0iZstvDaWoIfceb4J6WTxA4KvOtxqAFmLRhDqAXoPB/eNHPAF6Fyaw5xYIDPBj+yGo0HMAozKPpB2+IecUBfEvQgGDqj5xv7NANtFeGl5AC0zljFvU0RDmyFWPs+WdW/3; AWSALBTGCORS=6LJB4xCgMemznY8M1p+TahJ25ILjAmqyuGC2lg/3LUN0iZstvDaWoIfceb4J6WTxA4KvOtxqAFmLRhDqAXoPB/eNHPAF6Fyaw5xYIDPBj+yGo0HMAozKPpB2+IecUBfEvQgGDqj5xv7NANtFeGl5AC0zljFvU0RDmyFWPs+WdW/3; ua=0; ASP.NET_SessionId=quq4cllqp0y3rawetvbhyrbj; lastsearch={"ADomicilio":0,"Adultos":0,"Bachillerato":0,"CategoriaId":0,"ClienteId":0,"ESO":0,"InCompany":0,"KeywordId":0,"LastSearchDate":"\/Date(1657734540111)\/","LocalidadId":0,"NivelIdiomaAlto":0,"NivelIdiomaBajo":0,"NivelIdiomaIniciacion":0,"NivelIdiomaMedio":0,"NumPagina":1,"Online":0,"Preescolar":0,"Presenciales":0,"Primaria":0,"ProvinciaId":0,"RegionId":0,"SubCategoriaId":0,"Universidad":0,"origenLocalidad":0}; G_AUTHUSER_H=0; TC_OR={"a":19,"o":0}; Co_Merchant_Order=0; TCP_UI=E=camillebouyerm@gmail.com&N=Camille&P=065654728&U=3831641&CPI=9&TK=oTR5_cxk2khmZ11lREegS6QjxO4SNuEJ0&CTS=1; TCP_Auth=09f2f740-d57a-4b33-8fe7-cc391efd1217' -H 'Upgrade-Insecure-Requests: 1' -H 'Sec-Fetch-Dest: document' -H 'Sec-Fetch-Mode: navigate' -H 'Sec-Fetch-Site: same-origin' -H 'Sec-Fetch-User: ?1' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' -H 'TE: trailers' --data-raw '__EVENTTARGET=ctl00%24m%24link_siguiente&__EVENTARGUMENT=&__VIEWSTATE=%2FwEPDwUJNDgyODgwODYzD2QWAmYPZBYEZg9kFhQCAw8WAh4EVGV4dAUuPG1ldGEgbmFtZT0icm9ib3RzIiBjb250ZW50PSJub2luZGV4LGZvbGxvdyIvPmQCBA8WAh8AZWQCBQ8WAh8ABVQ8bWV0YSBuYW1lPSJmYWNlYm9vay1kb21haW4tdmVyaWZpY2F0aW9uIiBjb250ZW50PSI4MTF4eGFvZnFwbnF4cDFrMjlzaG10dno2bG5qb3IiLz5kAgYPFgIfAGVkAgcPFgIfAGVkAggPFgIfAGVkAgkPFgIfAGVkAgwPFgIfAAVnPG1ldGEgcHJvcGVydHk9Im9nOkltYWdlIiBjb250ZW50PSJodHRwczovL2QxcmVhbmE0ODUxNjF2LmNsb3VkZnJvbnQubmV0L2kvdm9zY291cnNfMTIwMHg2MzBfZmZmLnBuZyIvPmQCDg8WAh8ABXE8bGluayByZWw9InN0eWxlc2hlZXQiIHR5cGU9InRleHQvY3NzIiBocmVmPSJodHRwczovL2QxcmVhbmE0ODUxNjF2LmNsb3VkZnJvbnQubmV0L2Nzcy9jb250YWN0LXVzZXIuY3NzP3Y9MTIzNSIvPmQCEw8WAh8ABV08bGluayByZWw9Imljb24iIHR5cGU9ImltYWdlL3BuZyIgaHJlZj0iaHR0cHM6Ly9kMXJlYW5hNDg1MTYxdi5jbG91ZGZyb250Lm5ldC9pL2Zhdmljb24ucG5nIj5kAgEPFgIeBWNsYXNzBRdkZXNrIGZvb3RlcjIgY291bnRyeV9mchYSAgIPZBYCZg8WAh4HVmlzaWJsZWhkAgMPFgIfAmhkAgQPZBYOAgEPFgIeBGhyZWYFRC9wcm9mLXBhcnRpY3VsaWVyLW5hbmN5L2luZ2VuaWV1ci1maW5hbmNpZXItcG9seXZhbGVudC1uYW5jeS0zMDU4MDIxZAIDDxYCHwAFJkZhaXRlcyB2b3RyZSBkZW1hbmRlIGRlIGNvdXJzIMOgIE1vcnNpZAIEDxYCHgNzcmMFbWh0dHBzOi8vZDEzMW9lanJ5eXdoajcuY2xvdWRmcm9udC5uZXQvcC9hcGkvdXN1YXJpby9kdXAvU2RPRXh0bjIyVWo0WklTX3lJcHhUS1praG1mUFJ1WUwwLmpwZy8xOTB4MTkwY3V0Lz9zPWxkAgYPFgIfAAUFTW9yc2lkAgcPFgIfAAUePHN0cm9uZz48Yj45PC9iPuKCrDwvc3Ryb25nPi9oZAIKD2QWAmYPFgIfAAUaUsOpcG9uZCBlbiBxdWVscXVlcyBoZXVyZXNkAgwPZBYIAgEPFgIfAAUpRXhwbGlxdWV6IGNlIHF1ZSB2b3VzIHNvdWhhaXRleiBhcHByZW5kcmVkAgMPFgQeC3BsYWNlaG9sZGVyBdsBQm9uam91ciBNb3JzaSwgIEplIHJlY2hlcmNoZSB1biBwcm9mZXNzZXVyIGRlIE1hdGjDqW1hdGlxdWVzIGV0IGRpcmVjdGlvbiBmaW5hbmNpw6hyZSBldCBqJ2FpIHJlbWFycXXDqSB2b3RyZSBwcm9maWwuIEplIHNvdWhhaXRlcmFpcyBjb21tZW5jZXIgYXUgcGx1cyB0w7R0LiBQb3V2ZXotdm91cyBwcmVuZHJlIGNvbnRhY3QgYXZlYyBtb2kgYWZpbiBxdWUgbCdvbiBlbiBwYXJsZSA%2FHglpbm5lcmh0bWwF8wFCb25qb3VyIE1vcnNpLCAgSmUgcmVjaGVyY2hlIHVuIHByb2Zlc3NldXIgZGUgTWF0aCYjMjMzO21hdGlxdWVzIGV0IGRpcmVjdGlvbiBmaW5hbmNpJiMyMzI7cmUgZXQgaiYjMzk7YWkgcmVtYXJxdSYjMjMzOyB2b3RyZSBwcm9maWwuIEplIHNvdWhhaXRlcmFpcyBjb21tZW5jZXIgYXUgcGx1cyB0JiMyNDQ7dC4gUG91dmV6LXZvdXMgcHJlbmRyZSBjb250YWN0IGF2ZWMgbW9pIGFmaW4gcXVlIGwmIzM5O29uIGVuIHBhcmxlID9kAgUPFgIfAmgWBmYPFgIfAmgWBGYPFgIfBQUHUHLDqW5vbWQCAQ8WAh8FBQZFLW1haWxkAgEPFgIfAmgWAmYPFgIfBQUNMDY3OCA5MSAyMyA0NWQCAg8WAh8CaGQCCQ9kFgICAQ8WAh8ABQlDb250YWN0ZXJkAgYPDxYCHwJoZBYEAgEPFgIfAAU4PGEgY2xhc3M9J2xhdW5jaGNvb2tpZXBhbmVsJz5QYXJhbcOodHJlcyBkZXMgY29va2llczwvYT5kAgIPZBYCZg8WAh8ABQg0NTHCoDcyN2QCCw8WAh8AZWQCDA8WAh8AZWQCEA8PFgIfAmhkZAISDxYCHwBkZAIUD2QWAmYPFgIfAAWeBA0KICAgICAgICAgICAgPHNjcmlwdD4NCiAgICAgICAgICAgICAgICAoZnVuY3Rpb24oaCxvLHQsaixhLHIpew0KICAgICAgICAgICAgICAgICAgICBoLmhqPWguaGp8fGZ1bmN0aW9uKCl7KGguaGoucT1oLmhqLnF8fFtdKS5wdXNoKGFyZ3VtZW50cyl9Ow0KICAgICAgICAgICAgICAgICAgICBoLl9oalNldHRpbmdzPXtoamlkOjI4ODU0MTIsaGpzdjo2fTsNCiAgICAgICAgICAgICAgICAgICAgYT1vLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07DQogICAgICAgICAgICAgICAgICAgIHI9by5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtyLmFzeW5jPTE7DQogICAgICAgICAgICAgICAgICAgIHIuc3JjPXQraC5faGpTZXR0aW5ncy5oamlkK2oraC5faGpTZXR0aW5ncy5oanN2Ow0KICAgICAgICAgICAgICAgICAgICBhLmFwcGVuZENoaWxkKHIpOw0KICAgICAgICAgICAgICAgIH0pKHdpbmRvdyxkb2N1bWVudCwnaHR0cHM6Ly9zdGF0aWMuaG90amFyLmNvbS9jL2hvdGphci0nLCcuanM%2Fc3Y9Jyk7DQogICAgICAgICAgICA8L3NjcmlwdD4NCgkJZGRYUm5Z4s0bQJDf6NG%2FlEG5EOSBQstwWAD6cYa%2BJjRDCw%3D%3D&__VIEWSTATEGENERATOR=4A8FAB36&__EVENTVALIDATION=%2FwEdAAOAwqiWhGWxaMVpXrGkDetBU3hu%2BZOOwuE4ovy7z6O0nIREhGOMBBp550vJKwzWFGcrE%2B8a8v8hbBCApf0DdWpFAwGyb5%2Fvh67Z7RsL376Ftw%3D%3D&ctl00%24m%24input_textarea=Bonjour+${name}%2C++Je+recherche+un+professeur+de+Math%C3%A9matiques+et+direction+financi%C3%A8re+et+j%27ai+remarqu%C3%A9+votre+profil.+Je+souhaiterais+commencer+au+plus+t%C3%B4t.+Pouvez-vous+prendre+contact+avec+moi+afin+que+l%27on+en+parle+%3F'`
              // );
              // for (let index = 0; index < 2; index++) {
              //   exec(
              //     `curl 'https://www.voscours.fr/contact-user.aspx?an=${id}' -X POST -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:102.0) Gecko/20100101 Firefox/102.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' -H 'Accept-Language: fr-FR,en-US;q=0.7,en;q=0.3' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Origin: https://www.voscours.fr' -H 'Connection: keep-alive' -H 'Referer: https://www.voscours.fr/contact-user.aspx?an=${id}' -H 'Cookie: UU=11220504151323; pp={"analiticas": {"All":true,"_ga":true,"source":true,"_gid":true,"_gat":true}, "funcionales": {"All":true,"g_state":true,"lastsearch":true,"TCP_ms":true,"TCP_UI":true,"classgap_apt":true,"applus2":true}, "publicidad": {"All":true,"__gads":true,"datr_usida":true}, "fecha": 1651672122029}; g_state={"i_p":1651686127455,"i_l":1}; G_ENABLED_IDPS=google; cfg2=21; AWSALBTG=ExdoFw58bYv5hWzSBeNCzE4YslHpnxQlcpq7x5sERRSL1CAX7NQ1ISsbpIP71/KxI3f7j5yn/KzMdiCoRXEZH3B0v0bUWGYnRBoI/ni+WhE7rA+OyOqWJ8O9bIKefY/GwS8aIyVewVWf7Mh1RyBHzQNT3LCNu0WYFnxfwfA+U6jZ; AWSALBTGCORS=ExdoFw58bYv5hWzSBeNCzE4YslHpnxQlcpq7x5sERRSL1CAX7NQ1ISsbpIP71/KxI3f7j5yn/KzMdiCoRXEZH3B0v0bUWGYnRBoI/ni+WhE7rA+OyOqWJ8O9bIKefY/GwS8aIyVewVWf7Mh1RyBHzQNT3LCNu0WYFnxfwfA+U6jZ; ua=0; ASP.NET_SessionId=quq4cllqp0y3rawetvbhyrbj; lastsearch={"ADomicilio":0,"Adultos":0,"Bachillerato":0,"CategoriaId":0,"ClienteId":0,"ESO":0,"InCompany":0,"KeywordId":0,"LastSearchDate":"\/Date(1657736901404)\/","LocalidadId":0,"NivelIdiomaAlto":0,"NivelIdiomaBajo":0,"NivelIdiomaIniciacion":0,"NivelIdiomaMedio":0,"NumPagina":1,"Online":0,"Preescolar":0,"Presenciales":0,"Primaria":0,"ProvinciaId":0,"RegionId":0,"SubCategoriaId":0,"Universidad":0,"origenLocalidad":1}; G_AUTHUSER_H=0; TC_OR={"a":19,"o":0}; Co_Merchant_Order=0; TCP_UI=E=camillebouyerm@gmail.com&N=Camille&P=065654728&U=3831641&CPI=9&TK=oTR5_cxk2khmZ11lREegS6QjxO4SNuEJ0&CTS=1; TCP_Auth=09f2f740-d57a-4b33-8fe7-cc391efd1217' -H 'Upgrade-Insecure-Requests: 1' -H 'Sec-Fetch-Dest: document' -H 'Sec-Fetch-Mode: navigate' -H 'Sec-Fetch-Site: same-origin' -H 'Sec-Fetch-User: ?1' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' -H 'TE: trailers' --data-raw '__EVENTTARGET=ctl00%24m%24link_siguiente&__EVENTARGUMENT=&__VIEWSTATE=%2FwEPDwUJNDgyODgwODYzD2QWAmYPZBYEZg9kFhQCAw8WAh4EVGV4dAUuPG1ldGEgbmFtZT0icm9ib3RzIiBjb250ZW50PSJub2luZGV4LGZvbGxvdyIvPmQCBA8WAh8AZWQCBQ8WAh8ABVQ8bWV0YSBuYW1lPSJmYWNlYm9vay1kb21haW4tdmVyaWZpY2F0aW9uIiBjb250ZW50PSI4MTF4eGFvZnFwbnF4cDFrMjlzaG10dno2bG5qb3IiLz5kAgYPFgIfAGVkAgcPFgIfAGVkAggPFgIfAGVkAgkPFgIfAGVkAgwPFgIfAAVnPG1ldGEgcHJvcGVydHk9Im9nOkltYWdlIiBjb250ZW50PSJodHRwczovL2QxcmVhbmE0ODUxNjF2LmNsb3VkZnJvbnQubmV0L2kvdm9zY291cnNfMTIwMHg2MzBfZmZmLnBuZyIvPmQCDg8WAh8ABXE8bGluayByZWw9InN0eWxlc2hlZXQiIHR5cGU9InRleHQvY3NzIiBocmVmPSJodHRwczovL2QxcmVhbmE0ODUxNjF2LmNsb3VkZnJvbnQubmV0L2Nzcy9jb250YWN0LXVzZXIuY3NzP3Y9MTIzNSIvPmQCEw8WAh8ABV08bGluayByZWw9Imljb24iIHR5cGU9ImltYWdlL3BuZyIgaHJlZj0iaHR0cHM6Ly9kMXJlYW5hNDg1MTYxdi5jbG91ZGZyb250Lm5ldC9pL2Zhdmljb24ucG5nIj5kAgEPFgIeBWNsYXNzBRdkZXNrIGZvb3RlcjIgY291bnRyeV9mchYSAgIPZBYCZg8WAh4HVmlzaWJsZWhkAgMPFgIfAmhkAgQPZBYQAgEPFgIeBGhyZWYFkAEvcHJvZi1wYXJ0aWN1bGllci1wYXJpcy1ib3Vsb2duZS1iaWxsYW5jb3VydC1jb3VyYmV2b2llLWxldmFsbG9pcy1wZXJyZXQtbmV1aWxseS1zdXItc2VpbmUvZXR1ZGlhbnRzLXNjaWVuY2VzLXByb3Bvc2VudC1zb3V0aWVuLXNjb2xhaXJlLTI5MzQ0ODFkAgMPFgIfAAUvRmFpdGVzIHZvdHJlIGRlbWFuZGUgZGUgY291cnMgw6AgU2NpZW5jZXNQaXN0ZXNkAgQPFgIeA3NyYwU%2FaHR0cHM6Ly9kMXJlYW5hNDg1MTYxdi5jbG91ZGZyb250Lm5ldC9pbWcvY29tbW9uL2F2YXRhcl8wXzEuc3ZnZAIGDxYCHwAFDlNjaWVuY2VzUGlzdGVzZAIHDxYCHwAFHzxzdHJvbmc%2BPGI%2BMjA8L2I%2B4oKsPC9zdHJvbmc%2BL2hkAgoPZBYCZg8WAh8ABRRSw6lwb25kIGVuIDI0IGhldXJlc2QCCw8WAh8CZxYCZg8WAh8ABUJQbHVzIGRlIDQgw6lsw6h2ZXMgb250IGNvbnRhY3TDqSBTY2llbmNlc1Bpc3RlcyBsZXMgZGVybmllcnMgam91cnNkAgwPZBYIAgEPFgIfAAUpRXhwbGlxdWV6IGNlIHF1ZSB2b3VzIHNvdWhhaXRleiBhcHByZW5kcmVkAgMPFgQeC3BsYWNlaG9sZGVyBcQBQm9uam91ciBTY2llbmNlc1Bpc3RlcywgIEplIHJlY2hlcmNoZSB1biBwcm9mZXNzZXVyIGRlIEFuZ2xhaXMgZXQgaidhaSByZW1hcnF1w6kgdm90cmUgcHJvZmlsLiBKZSBzb3VoYWl0ZXJhaXMgY29tbWVuY2VyIGF1IHBsdXMgdMO0dC4gUG91dmV6LXZvdXMgcHJlbmRyZSBjb250YWN0IGF2ZWMgbW9pIGFmaW4gcXVlIGwnb24gZW4gcGFybGUgPx4JaW5uZXJodG1sBdQBQm9uam91ciBTY2llbmNlc1Bpc3RlcywgIEplIHJlY2hlcmNoZSB1biBwcm9mZXNzZXVyIGRlIEFuZ2xhaXMgZXQgaiYjMzk7YWkgcmVtYXJxdSYjMjMzOyB2b3RyZSBwcm9maWwuIEplIHNvdWhhaXRlcmFpcyBjb21tZW5jZXIgYXUgcGx1cyB0JiMyNDQ7dC4gUG91dmV6LXZvdXMgcHJlbmRyZSBjb250YWN0IGF2ZWMgbW9pIGFmaW4gcXVlIGwmIzM5O29uIGVuIHBhcmxlID9kAgUPFgIfAmgWBmYPFgIfAmgWBGYPFgIfBQUHUHLDqW5vbWQCAQ8WAh8FBQZFLW1haWxkAgEPFgIfAmgWAmYPFgIfBQUNMDY3OCA5MSAyMyA0NWQCAg8WAh8CaGQCCQ9kFgICAQ8WAh8ABQlDb250YWN0ZXJkAgYPDxYCHwJoZBYEAgEPFgIfAAU4PGEgY2xhc3M9J2xhdW5jaGNvb2tpZXBhbmVsJz5QYXJhbcOodHJlcyBkZXMgY29va2llczwvYT5kAgIPZBYCZg8WAh8ABQg0NTHCoDcyN2QCCw8WAh8AZWQCDA8WAh8AZWQCEA8PFgIfAmhkZAISDxYCHwBkZAIUD2QWAmYPFgIfAAWeBA0KICAgICAgICAgICAgPHNjcmlwdD4NCiAgICAgICAgICAgICAgICAoZnVuY3Rpb24oaCxvLHQsaixhLHIpew0KICAgICAgICAgICAgICAgICAgICBoLmhqPWguaGp8fGZ1bmN0aW9uKCl7KGguaGoucT1oLmhqLnF8fFtdKS5wdXNoKGFyZ3VtZW50cyl9Ow0KICAgICAgICAgICAgICAgICAgICBoLl9oalNldHRpbmdzPXtoamlkOjI4ODU0MTIsaGpzdjo2fTsNCiAgICAgICAgICAgICAgICAgICAgYT1vLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07DQogICAgICAgICAgICAgICAgICAgIHI9by5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtyLmFzeW5jPTE7DQogICAgICAgICAgICAgICAgICAgIHIuc3JjPXQraC5faGpTZXR0aW5ncy5oamlkK2oraC5faGpTZXR0aW5ncy5oanN2Ow0KICAgICAgICAgICAgICAgICAgICBhLmFwcGVuZENoaWxkKHIpOw0KICAgICAgICAgICAgICAgIH0pKHdpbmRvdyxkb2N1bWVudCwnaHR0cHM6Ly9zdGF0aWMuaG90amFyLmNvbS9jL2hvdGphci0nLCcuanM%2Fc3Y9Jyk7DQogICAgICAgICAgICA8L3NjcmlwdD4NCgkJZGSHRRxDkC2eVJb0zTRK3U%2BWHE6%2FDI4G9zIh%2F9mq2GEQ%2Bg%3D%3D&__VIEWSTATEGENERATOR=4A8FAB36&__EVENTVALIDATION=%2FwEdAAOvrF5jpudNCVh7ZhLheP2OU3hu%2BZOOwuE4ovy7z6O0nIREhGOMBBp550vJKwzWFGftymlV9eH9qWU%2BMqJaShT9HEep1j%2B0guWdK%2FExrcDGxQ%3D%3D&ctl00%24m%24input_textarea=Bonjour+${name}%2C++je+recherche+un+professeur+pour+la+rentr%C3%A9e+2024+pour+donner+cours+en+petit+groupe.+Seriez-vous+disponible+pour+discuter+%3F+%0D%0A%0D%0AN%27h%C3%A9sitez+pas+%C3%A0+me+communiquer+vos+coordonn%C3%A9es+%28emails%2C+tel+par+exemple%29+pour+que+nous+puissions+en+discuter+de+vive+voix.+%0D%0A%0D%0AEn+vous+souhaitant+une+bonne+soir%C3%A9e+%21%0D%0AYouness'`,
              //     async (error, stdout, stderr) => {
              //       // console.log(error, stdout, stderr);
              //       // if (error) {
              //       //   console.error(e);
              //       //   prof = {
              //       //     url: referer,
              //       //     code: 'jsonMalForme',
              //       //   };
              //       //   await utils.convertToCSV(
              //       //     [prof],
              //       //     `data/voscours/errors/errors-voscours-2.csv`,
              //       //     false
              //       //   );
              //       //   // logError(config.url, 'jsonMalForme');
              //       //   return;
              //       // }
              //       // if (stderr) {
              //       //   console.log(`stderr: ${stderr}`);
              //       // }
              //       console.log(`voscours : Teacher ${name} is contacted ✅ `);
              //       if (index === 1) resolve();
              //     }
              //   );
              // }

              await fetch("https://www.voscours.fr/api/api/contact/student-pass", {
                "headers": {
                  "accept": "*/*",
                  "accept-language": "fr-FR,fr;q=0.9",
                  "content-type": "application/json",
                  "priority": "u=1, i",
                  "sec-ch-ua": "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
                  "sec-ch-ua-mobile": "?0",
                  "sec-ch-ua-platform": "\"macOS\"",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "cookie": "UU=112406071511218; ua=0; ASP.NET_SessionId=5mjw1qwqsw5h3aq3rdbk3o5k; cfg2=20; pp={\"analiticas\": {\"All\":true,\"_ga\":true,\"source\":true,\"_gid\":true,\"_gat\":true,\"_hj\":true,\"optimizely\":true,\"npv\":true,\"nv\":true,\"tf\":true}, \"funcionales\": {\"All\":true,\"g_state\":true,\"lastsearch\":true,\"TCP_ms\":true,\"TCP_UI\":true,\"classgap_apt\":true,\"applus2\":true}, \"publicidad\": {\"All\":true,\"__gads\":true,\"datr_usida\":true}, \"fecha\": 1717767188597, \"version\": 2}; _gcl_au=1.1.356894273.1717767189; _ga=GA1.1.184333753.1717767177; TCP_UI=E=youness.dpl@gmail.com&N=Youness&P=0664805771&TO=1&U=6059510&CPI=9&TK=NsuKq--G3Egx9s1Y7kMxQY9nOG2HqHan0&CTS=1; TCP_ms=4C28ACD2006246D8; TCP_Auth=e88c7c14-6c2c-4130-8edb-0a93a5b5cf21; lastsearch={\"FechaUltimaActividad\":\"\\/Date(-62135596800000)\\/\",\"LastSearchDate\":\"\\/Date(1717767518557)\\/\",\"origenLocalidad\":0,\"QualityType\":null,\"MaxNDelayedMultiLeadScore\":0,\"CheckMultileadPermission\":false,\"IsNotInternalOffer\":false,\"MultiSubcatIds\":\"\",\"MultiSubcatName\":\"\",\"SinContactos\":false,\"TipoOfertanteId\":0,\"RegionId\":0,\"ProvinciaId\":0,\"CategoriaId\":0,\"SubCategoriaId\":295,\"Texto\":\"\",\"HiddenQuery\":\"\",\"Localidad\":\"\",\"NumPagina\":1,\"ClienteId\":0,\"Foto\":0,\"Online\":0,\"ADomicilio\":0,\"InCompany\":0,\"Presenciales\":0,\"Primaria\":0,\"Preescolar\":0,\"ESO\":0,\"Bachillerato\":0,\"Universidad\":0,\"Adultos\":0,\"NivelIdiomaIniciacion\":0,\"NivelIdiomaBajo\":0,\"NivelIdiomaMedio\":0,\"NivelIdiomaAlto\":0,\"isSemantic\":false,\"OrdenCampo\":\"FechaParrilla\",\"OrdenSentido\":\"desc\",\"CustomOrden\":false,\"NumFilters\":1,\"ConTelefono\":0,\"ExternalPage\":false,\"NumResults\":25,\"NumFacets\":50,\"Categoria\":\"\",\"SubCategoria\":\"\",\"Provincia\":\"\",\"CategoriaURL\":\"\",\"SubCategoriaURL\":\"\",\"ProvinciaURL\":\"\",\"TotalResultsFound\":0,\"MustInFTI\":false,\"Suggested\":false,\"FiltrarFecha\":false,\"FechaMinima\":\"\\/Date(1402148318557)\\/\",\"FechaMaxima\":\"\\/Date(1749303518557)\\/\",\"Destacado\":false,\"TopTutor\":false,\"IdiomaConoce\":0,\"IdiomaNecesita\":0,\"Recomendaciones\":0,\"X\":0,\"Y\":0,\"Km\":0,\"Pais\":0,\"PaisOriginal\":0,\"Ids\":null,\"IdsExclude\":null,\"IdsClienteExclude\":null,\"IdsUsersInclude\":null,\"IdsUsersExclude\":null,\"LocalidadId\":0,\"OnlyUsersWithProfile\":false,\"NotUserIds\":null,\"KeywordId\":0,\"Keyword\":\"\",\"KeywordURL\":\"\",\"PuntoInteresId\":\"\",\"PuntoInteres\":\"\",\"PuntoInteresRewrite\":\"\",\"GeoPoints\":null,\"GeoPointsIntersect\":null,\"Classgap\":false,\"CategoriaIds\":null,\"SubCategoriaIds\":null,\"LocalidadesIds\":null,\"LocalidadesPublicacionIds\":null,\"NotIds\":null,\"LocalidadIdDesp\":0,\"SearchAllSubcategories\":false,\"SearchLocalidadById\":false,\"Skip\":0,\"SearchId\":0,\"PriceFrom\":0,\"PriceMin\":0,\"PriceMax\":0,\"NoSecondQueryIfNotNeeded\":false,\"TextSearch\":\"\",\"IdPortal\":-1,\"ProfesorPlusStatusMin\":-1,\"OnlyTutors\":false,\"OnlyClientesPago\":false,\"FechaParrillaCualitativaMinima\":\"\\/Date(-62135596800000)\\/\"}; TC_OR={\"a\":19,\"adgroupid\":\"\",\"o\":0}; AWSALBTG=HpUCUMRqr2rCuxmfXeW4R8fHECPUkF1hzttqBGXx8100Gx0LAwrqoplDQXYWq+4H82A6AdwhqHkuXxVNFayqEK2Y3eZZFPrF1lli4IO8OnmlMzoqBOFNatN5QNDZTnJD7GcAjDbhZKmvfh0D8sfM046PSDbnEwUBq8whN5gIRrMb; AWSALBTGCORS=HpUCUMRqr2rCuxmfXeW4R8fHECPUkF1hzttqBGXx8100Gx0LAwrqoplDQXYWq+4H82A6AdwhqHkuXxVNFayqEK2Y3eZZFPrF1lli4IO8OnmlMzoqBOFNatN5QNDZTnJD7GcAjDbhZKmvfh0D8sfM046PSDbnEwUBq8whN5gIRrMb; _ga_TTK4WVFXY0=GS1.1.1717767177.1.1.1717768009.0.0.0",
                  "Referer": referer,
                  "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": "{\"uId\":\"2028975\",\"Name\":\"Youness\",\"Mail\":\"youness.dpl@gmail.com\",\"Text\":\"Bonjour ! J'aimerais en savoir plus sur vos disponibilités et vos tarifs. Merci d'avance.\",\"Phone\":\"0664805771\",\"IdAnuncio\":\"1806422\"}",
                "method": "POST"
              });
              // await fetch(
              //   `https://www.voscours.fr/contact-user.aspx?an=${id}`,
              //   {
              //     headers: {
              //       accept:
              //         'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
              //       'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,fr;q=0.7',
              //       'cache-control': 'max-age=0',
              //       'content-type': 'application/x-www-form-urlencoded',
              //       'sec-ch-ua':
              //         '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
              //       'sec-ch-ua-mobile': '?0',
              //       'sec-fetch-dest': 'document',
              //       'sec-fetch-mode': 'navigate',
              //       'sec-fetch-site': 'same-origin',
              //       'sec-fetch-user': '?1',
              //       'upgrade-insecure-requests': '1',
              //       Cookie:
              //         'UU=1121090217860; pp=1; G_ENABLED_IDPS=google; _fbp=fb.1.1636038159049.1856644300; _ga_TTK4WVFXY0=GS1.1.1636037949.14.1.1636038708.36; _ga=GA1.2.205134897.1630596478; cfg2=20; ASP.NET_SessionId=ig1mhlypgxp5rue4zx30umj0; _gid=GA1.2.1034530324.1637935046; ua=0; G_AUTHUSER_H=1; g_state={"i_l":0}; TCP_UI=E=pauline.perinp@gmail.com&N=Pauline&U=3391642&CPI=9&TK=RdiuwreN2UgpQ40hsMRYSZJdY_TWYyC_0; TCP_ms=5A6D3E99254634CE; TCP_Auth=120088fe-aec3-477e-8668-26791717d223; TCP_got=true; Co_Merchant_Order=0; _gat=1; AWSALBTG=Aofo1tkC2ce0GXRovNUQq1frN/NIdR+X+AznpznWdL+MS//mDYEMrO9ySQYavHNkwo9zyrwbUWUAmcIW6+P31xHrDQPiTrgPv4Bscmf4NSzUVTuB8MJRzBxqzcvLjjssLU6giczYu8Qua8wHn1RuEzoG6qVUZ8d0PsLm1cU6VUYj; AWSALBTGCORS=Aofo1tkC2ce0GXRovNUQq1frN/NIdR+X+AznpznWdL+MS//mDYEMrO9ySQYavHNkwo9zyrwbUWUAmcIW6+P31xHrDQPiTrgPv4Bscmf4NSzUVTuB8MJRzBxqzcvLjjssLU6giczYu8Qua8wHn1RuEzoG6qVUZ8d0PsLm1cU6VUYj',
              //     },
              //     referrer: `https://www.voscours.fr/contact-user.aspx?an=${id}`,
              //     referrerPolicy: 'strict-origin-when-cross-origin',
              //     body:
              //       '__EVENTTARGET=ctl00%24m%24link_siguiente&__EVENTARGUMENT=&__VIEWSTATE=%2FwEPDwUJNDgyODgwODYzD2QWAmYPZBYEZg9kFhACAw8WAh4EVGV4dAUuPG1ldGEgbmFtZT0icm9ib3RzIiBjb250ZW50PSJub2luZGV4LGZvbGxvdyIvPmQCBA8WAh8AZWQCBQ8WAh8AZWQCBg8WAh8AZWQCBw8WAh8AZWQCCA8WAh8AZWQCCw8WAh8ABWg8bWV0YSBwcm9wZXJ0eT0ib2c6SW1hZ2UiIGNvbnRlbnQ9Imh0dHBzOi8vZDFyZWFuYTQ4NTE2MXYuY2xvdWRmcm9udC5uZXQvL2kvdm9zY291cnNfMTIwMHg2MzBfZmZmLnBuZyIvPmQCDQ8WAh8ABXE8bGluayByZWw9InN0eWxlc2hlZXQiIHR5cGU9InRleHQvY3NzIiBocmVmPSJodHRwczovL2QxcmVhbmE0ODUxNjF2LmNsb3VkZnJvbnQubmV0L2Nzcy9jb250YWN0LXVzZXIuY3NzP3Y9MTExNiIvPmQCAQ9kFhACAg9kFgJmDxYCHgdWaXNpYmxlaGQCAw8WAh8BaGQCBA9kFhICAQ8WAh4EaHJlZgVZL3Byb2YtcGFydGljdWxpZXItdHJvbmNlbnMvZW5zZWlnbmFudGUtaGF0aGEteW9nYS1mZWRlcmF0aW9uLWZyYW5jYWlzZS1oYXRoYS15b2dhLTI5MzkxMTJkAgIPFgIfAWdkAgMPFgIfAAUzRmFpdGVzIHZvdHJlIGRlbWFuZGUgZGUgY291cnMgw6AgVnVpbGxpb21lbmV0IFNvbmlhZAIEDxYCHgNzcmMFbWh0dHBzOi8vZDEzMW9lanJ5eXdoajcuY2xvdWRmcm9udC5uZXQvcC9hcGkvdXN1YXJpby9kdXAvNGJtUmtLbXcyVWcyNm0wSUZGaVFUb2tGSVJ2VkcxY2YwLmpwZy8xOTB4MTkwY3V0Lz9zPWxkAgUPFgIfAWdkAgYPFgIfAAUSVnVpbGxpb21lbmV0IFNvbmlhZAIHDxYCHwFoZAIKD2QWAmYPFgIfAAUbUsOpcG9uZCBlbiBxdWVscXVlcyBtaW51dGVzZAIMD2QWCAIBDxYCHwAFKUV4cGxpcXVleiBjZSBxdWUgdm91cyBzb3VoYWl0ZXogYXBwcmVuZHJlZAIDDxYEHgtwbGFjZWhvbGRlcgXFAUJvbmpvdXIgVnVpbGxpb21lbmV0IFNvbmlhLCAgSmUgcmVjaGVyY2hlIHVuIHByb2Zlc3NldXIgZGUgWW9nYSBldCBqJ2FpIHJlbWFycXXDqSB2b3RyZSBwcm9maWwuIEplIHNvdWhhaXRlcmFpcyBjb21tZW5jZXIgYXUgcGx1cyB0w7R0LiBQb3V2ZXotdm91cyBwcmVuZHJlIGNvbnRhY3QgYXZlYyBtb2kgYWZpbiBxdWUgbCdvbiBlbiBwYXJsZSA%2FHglpbm5lcmh0bWwF1QFCb25qb3VyIFZ1aWxsaW9tZW5ldCBTb25pYSwgIEplIHJlY2hlcmNoZSB1biBwcm9mZXNzZXVyIGRlIFlvZ2EgZXQgaiYjMzk7YWkgcmVtYXJxdSYjMjMzOyB2b3RyZSBwcm9maWwuIEplIHNvdWhhaXRlcmFpcyBjb21tZW5jZXIgYXUgcGx1cyB0JiMyNDQ7dC4gUG91dmV6LXZvdXMgcHJlbmRyZSBjb250YWN0IGF2ZWMgbW9pIGFmaW4gcXVlIGwmIzM5O29uIGVuIHBhcmxlID9kAgUPZBYGZg8WAh8BaBYEZg8WAh8EBQdQcsOpbm9tZAIBDxYCHwQFBkUtbWFpbGQCAQ9kFgJmDxYCHwQFDTA2NzggOTEgMjMgNDVkAgIPFgIfAWhkAgkPZBYCAgEPFgIfAAUJQ29udGFjdGVyZAIGDw8WAh8BaGQWAmYPFgIfAAUINDA1wqA5MTVkAgsPFgIfAGVkAgwPFgIfAGVkAhAPDxYCHwFoZGQCEQ8WAh8AZGRkH%2FLOfXYFNTae0fpVUiS2olyo7Zour5LygDGRpbACWL4%3D&__VIEWSTATEGENERATOR=4A8FAB36&__EVENTVALIDATION=%2FwEdAATJx32MoI980uu8S7P%2FsVMVU3hu%2BZOOwuE4ovy7z6O0nHk4io3nhNS4%2BibOR41B5giERIRjjAQaeedLySsM1hRn9%2FUw8lA0NHXDYdaClLVGiJK9JMbQDOsyQoSlbtKjJjc%3D&ctl00%24m%24input_textarea=Bonjour+' +
              //       name +
              //       '%2C%0D%0A%0D%0ANous+recherchons+un+professeur+particulier+pour+donner+cours+en+petit+groupe.+Seriez-vous+disponible+pour+en+discuter+%3F+N%27h%C3%A9sitez+pas+%C3%A0+me+communiquer+votre+email+pour+que+je+puisse+vous+envoyer+la+brochure+ainsi+que+votre+num%C3%A9ro+de+t%C3%A9l%C3%A9phone+afin+d%27en+discuter+de+vive-voix.+J%27esp%C3%A8re+pouvoir+%C3%A9changer+avec+vous+tr%C3%A8s+prochainement+%21%0D%0A%0D%0AEn+vous+souhaitant+une+bonne+journ%C3%A9e%2C%0D%0ABien+%C3%A0+vous.%0D%0APauline&ctl00%24m%24input_telefono=',
              //     method: 'POST',
              //     mode: 'cors',
              //     credentials: 'include',
              //   }
              // )
              //   .then((response) => response.text())
              //   .then(async (text) => {
              //     try {
              //       console.log(`voscours : Teacher ${id} is contacted ✅ `);
              //       resolve();
              //     } catch (e) {
              //       // console.error(e);
              //       prof = {
              //         url: referer,
              //         code: 'jsonMalForme',
              //       };
              //       await utils.convertToCSV(
              //         [prof],
              //         `data/voscours/errors/errors-voscours.csv`,
              //         false
              //       );
              //       // logError(config.url, 'jsonMalForme');
              //       resolve();
              //     }
              //   });
            }
          } else {
            prof = {
              url: referer,
              code: "trouvePasInput2"
            };
            await utils.convertToCSV(
              [prof],
              `data/voscours/errors/errors-voscours.csv`,
              false
            );
            // logError(config.url, 'trouvePasInput2');
            resolve();
          }
        } else {
          prof = {
            url: referer,
            code: "trouvePasInput1"
          };
          await utils.convertToCSV(
            [prof],
            `data/voscours/errors/errors-voscours.csv`,
            false
          );
          // logError(config.url, 'trouvePasInput1');
          resolve();
        }
      },
      onError: async (error, response, html, config) => {
        console.error("error::" + error);
        prof = {
          url: referer,
          code: "onError"
        };
        await utils.convertToCSV(
          [prof],
          `data/voscours/errors/errors-voscours.csv`,
          false
        );
        // logError(config.url, 'onError');
        resolve();
      }
    });
  });
};

const contactNew = async () => {
  const newUrls = await utils.readCSV(
    `data/voscours/new/new-urls-${utils.getDayToday()}.csv`,
    ","
  );

  for await (const url of newUrls) await sendMsg(url.url);

  console.log(`voscours : All new profils are contacted 🎉`);
};

const getUserId = async (an) => {
  return new Promise((resolve, reject) => {
    const fct = async ($, response, html, config, dataArr) => {
      const annonce = {
        idAn: an.idAn,
        url: an.url,
        img: $(
          "#cph > section > div.profile.tc-stickybar-toggler > div.tc-wrapper.tc-grid > div.tc-col.d-2.ds-3.t-4.m-0.img > img"
        )[0].attribs["data-iurl"].split("/")[7]
          ? $(
            "#cph > section > div.profile.tc-stickybar-toggler > div.tc-wrapper.tc-grid > div.tc-col.d-2.ds-3.t-4.m-0.img > img"
          )[0]
            .attribs["data-iurl"].split("/")[7]
            .split(".")[0]
          : -1,
        anTitle: $("#card_ad_title > h1").text(),
        idUser: $("#iduser").attr("value") * 1,
        city:
          $("#line_location > span").text() === "En ligne"
            ? "online"
            : $("#item_places > div.txt > div:nth-child(2)").text(),
        prenom: $(
          "#cph > section > div.profile.tc-stickybar-toggler > div.tc-wrapper.tc-grid > div.tc-col.d-8.ds-9.t-8.m-12 > div.info > div.line1 > span"
        ).text()
      };

      // console.log(annonce);
      await utils.convertToCSV([annonce], "data/voscours/urls-user-img.csv");
    };

    utils.scrapTemplate(an.url, fct, resolve, reject);
  });
};

const contact = async (annonce) => {
  await sendMsg(annonce.url);
};

const contactAllTeacher = async () => {
  const allT = await utils.readCSV("data/voscours/urls-user-img.csv", ",");

  let idx = 0;
  let dI = 0;
  for await (const t of allT) {
    if (utils.instances(idx, process.env.I * 1, process.env.T * 1, allT.length))
      try {
        await contact(t);
        dI++;
        utils.logProgress(dI, allT.length / process.env.T, "Success", "");
      } catch (e) {
        console.log(e);
        dI++;
        utils.logProgress(dI, allT.length / process.env.T, "Erreur", "");
      }
    idx++;
  }

  for await (const t of [allT[0]]) {
    await contact(t);
  }
};

const getAllUsersIds = async () => {
  const urls = await utils.readCSV("data/voscours/urls-uniq-user-id.csv", ",");

  let idx = 0;
  let dI = 0;
  for await (const an of urls) {
    if (utils.instances(idx, process.env.I * 1, process.env.T * 1, urls.length))
      try {
        await getUserId(an);
        dI++;
        utils.logProgress(dI, urls.length / process.env.T, "Success", "");
      } catch (e) {
        console.log(e);
        dI++;
        utils.logProgress(dI, urls.length / process.env.T, "Erreur", "");
      }
    idx++;
  }
};

const getUniqUser = async () => {
  const users = await utils.readCSV("data/voscours/urls-user-id.csv", ",");
  const usersFiltred = _.unionBy(users, "idUser");

  await utils.convertToCSV(usersFiltred, "data/voscours/urls-uniq-user-id.csv");

  console.log(users.length, "-->", usersFiltred.length);
};

//await fetch("https://www.voscours.fr/api/api/contact/student-pass", {
//  "credentials": "include",
//  "headers": {
//    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:126.0) Gecko/20100101 Firefox/126.0",
//    "Accept": "*/*",
//    "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
//    "Content-Type": "application/json",
//    "Sec-Fetch-Dest": "empty",
//    "Sec-Fetch-Mode": "cors",
//    "Sec-Fetch-Site": "same-origin",
//    "Priority": "u=1"
//  },
//  "referrer": "https://www.voscours.fr/prof-particulier-prevessin-moens/cours-technique-vocale-chant-lyrique-1806492",
//  "body": "{\"uId\":\"2029059\",\"Name\":\"Youness\",\"Mail\":\"youness.dpl@gmail.com\",\"Text\":\"Bonjour ! J'aimerais en savoir plus sur vos disponibilités et vos tarifs. Merci d'avance.\",\"Phone\":\"0664805771\",\"IdAnuncio\":\"1806492\"}",
//  "method": "POST",
//  "mode": "cors"
//});


const SendMessageTo = async (annonce) => {
  return new Promise((res, rej) => {
    scrap.get({
      url: annonce.url,
      headers: {},
      onSuccess: async ($, response, html, config) => {
        const name = $($(".username")[0]).text();
        const userId = $($("input[name='ctl00$m$ctl00$iduser']")[0]).val();
        console.log(`Sending message to ${name} id ${userId} 🛠`);
        await fetch("https://www.voscours.fr/api/api/contact/student-pass", {
          "headers": {
            "accept": "*/*",
            "accept-language": "fr-FR,fr;q=0.9",
            "content-type": "application/json",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "cookie": "UU=112406071511218; ua=0; ASP.NET_SessionId=5mjw1qwqsw5h3aq3rdbk3o5k; cfg2=20; pp={\"analiticas\": {\"All\":true,\"_ga\":true,\"source\":true,\"_gid\":true,\"_gat\":true,\"_hj\":true,\"optimizely\":true,\"npv\":true,\"nv\":true,\"tf\":true}, \"funcionales\": {\"All\":true,\"g_state\":true,\"lastsearch\":true,\"TCP_ms\":true,\"TCP_UI\":true,\"classgap_apt\":true,\"applus2\":true}, \"publicidad\": {\"All\":true,\"__gads\":true,\"datr_usida\":true}, \"fecha\": 1717767188597, \"version\": 2}; _gcl_au=1.1.356894273.1717767189; _ga=GA1.1.184333753.1717767177; TCP_UI=E=youness.dpl@gmail.com&N=Youness&P=0664805771&TO=1&U=6059510&CPI=9&TK=NsuKq--G3Egx9s1Y7kMxQY9nOG2HqHan0&CTS=1; TCP_ms=4C28ACD2006246D8; TCP_Auth=e88c7c14-6c2c-4130-8edb-0a93a5b5cf21; lastsearch={\"FechaUltimaActividad\":\"\\/Date(-62135596800000)\\/\",\"LastSearchDate\":\"\\/Date(1717767518557)\\/\",\"origenLocalidad\":0,\"QualityType\":null,\"MaxNDelayedMultiLeadScore\":0,\"CheckMultileadPermission\":false,\"IsNotInternalOffer\":false,\"MultiSubcatIds\":\"\",\"MultiSubcatName\":\"\",\"SinContactos\":false,\"TipoOfertanteId\":0,\"RegionId\":0,\"ProvinciaId\":0,\"CategoriaId\":0,\"SubCategoriaId\":295,\"Texto\":\"\",\"HiddenQuery\":\"\",\"Localidad\":\"\",\"NumPagina\":1,\"ClienteId\":0,\"Foto\":0,\"Online\":0,\"ADomicilio\":0,\"InCompany\":0,\"Presenciales\":0,\"Primaria\":0,\"Preescolar\":0,\"ESO\":0,\"Bachillerato\":0,\"Universidad\":0,\"Adultos\":0,\"NivelIdiomaIniciacion\":0,\"NivelIdiomaBajo\":0,\"NivelIdiomaMedio\":0,\"NivelIdiomaAlto\":0,\"isSemantic\":false,\"OrdenCampo\":\"FechaParrilla\",\"OrdenSentido\":\"desc\",\"CustomOrden\":false,\"NumFilters\":1,\"ConTelefono\":0,\"ExternalPage\":false,\"NumResults\":25,\"NumFacets\":50,\"Categoria\":\"\",\"SubCategoria\":\"\",\"Provincia\":\"\",\"CategoriaURL\":\"\",\"SubCategoriaURL\":\"\",\"ProvinciaURL\":\"\",\"TotalResultsFound\":0,\"MustInFTI\":false,\"Suggested\":false,\"FiltrarFecha\":false,\"FechaMinima\":\"\\/Date(1402148318557)\\/\",\"FechaMaxima\":\"\\/Date(1749303518557)\\/\",\"Destacado\":false,\"TopTutor\":false,\"IdiomaConoce\":0,\"IdiomaNecesita\":0,\"Recomendaciones\":0,\"X\":0,\"Y\":0,\"Km\":0,\"Pais\":0,\"PaisOriginal\":0,\"Ids\":null,\"IdsExclude\":null,\"IdsClienteExclude\":null,\"IdsUsersInclude\":null,\"IdsUsersExclude\":null,\"LocalidadId\":0,\"OnlyUsersWithProfile\":false,\"NotUserIds\":null,\"KeywordId\":0,\"Keyword\":\"\",\"KeywordURL\":\"\",\"PuntoInteresId\":\"\",\"PuntoInteres\":\"\",\"PuntoInteresRewrite\":\"\",\"GeoPoints\":null,\"GeoPointsIntersect\":null,\"Classgap\":false,\"CategoriaIds\":null,\"SubCategoriaIds\":null,\"LocalidadesIds\":null,\"LocalidadesPublicacionIds\":null,\"NotIds\":null,\"LocalidadIdDesp\":0,\"SearchAllSubcategories\":false,\"SearchLocalidadById\":false,\"Skip\":0,\"SearchId\":0,\"PriceFrom\":0,\"PriceMin\":0,\"PriceMax\":0,\"NoSecondQueryIfNotNeeded\":false,\"TextSearch\":\"\",\"IdPortal\":-1,\"ProfesorPlusStatusMin\":-1,\"OnlyTutors\":false,\"OnlyClientesPago\":false,\"FechaParrillaCualitativaMinima\":\"\\/Date(-62135596800000)\\/\"}; TC_OR={\"a\":19,\"adgroupid\":\"\",\"o\":0}; AWSALBTG=TFHSEWgPOuVq0QpdBhqEpFS9IazfanWo3WXic5igjVleFkGdE3v6N4dvkYXXIf1kWZ00HXbaVtEB4mgsCQjHAV5gNnjV5dQJNBhsRzCTma42rRPEGyWkXwW5cLDIg3IX5umHcw2NoJIdcKbcnQwmIdEtcPfvCArS5fsuy+oM8TM1; AWSALBTGCORS=TFHSEWgPOuVq0QpdBhqEpFS9IazfanWo3WXic5igjVleFkGdE3v6N4dvkYXXIf1kWZ00HXbaVtEB4mgsCQjHAV5gNnjV5dQJNBhsRzCTma42rRPEGyWkXwW5cLDIg3IX5umHcw2NoJIdcKbcnQwmIdEtcPfvCArS5fsuy+oM8TM1; _ga_TTK4WVFXY0=GS1.1.1717767177.1.1.1717769934.0.0.0",
            "Referer": annonce.url,
            "Referrer-Policy": "strict-origin-when-cross-origin"
          },
          "body": `{\"uId\":\"${userId}\",\"Name\":\"Youness\",\"Mail\":\"youness.dpl@gmail.com\",\"Text\":\"Bonjour ${name}, Nous recherchons un professeur particulier pour l'année prochaine. Êtes-vous disponible et intéressé ? Si oui, je serez ravi d'échanger avec vous à ce sujet. N'hésitez pas à me communiquer votre email ou numéro de téléphone je reviendrai vers vous. Merci d'avance .\",\"Phone\":\"0664805771\",\"IdAnuncio\":\"${annonce.id}\"}`,
          "method": "POST"
        });
        console.log(`${name} contacted ✓`);
      }
    });
  });
};

const voscours = {
  scrapper: async () => {
    const { action } = process.env;
    switch (action) {
      case "download-sitemap":
        await downloadAndCleanSitemap();
        break;
      case "test":
        await SendMessageTo({
          id: 1813797,
          url: "https://www.voscours.fr/prof-particulier-cahors/cours-particuliers-portugais-cahors-1813797"
        });
        break;
      case "get-emails":
        await getEmails();
        break;
      default:
        console.error(`unknown command ${action}`);
        break;
    }
    return [];
  }
};

export default voscours;
