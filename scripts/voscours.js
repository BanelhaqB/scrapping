import fetch from 'node-fetch';
import _ from 'lodash';

import * as fs from 'node:fs/promises';
import randomUA from 'random-fake-useragent';

import utils from '../utils/utils.js';
import scrap from '../scrap.js';

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
      'utf8'
    );

    let array = data
      .split('loc')
      .map((e) => e.trim().substring(1, e.trim().length - 2));

    array = _.filter(array, function (e) {
      return e[0] === 'h';
    });

    array = _.map(array, (e) => {
      return { id: e.split('-')[e.split('-').length - 1], url: e };
    });

    array = _.uniqBy(array, 'id');

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

const compte = {
  // Pauline
  // id: '6165e4072da5452890cab892',
  // upt: 'RdiuwreN2UgpQ40hsMRYSZJdY_TWYyC_0',
  // Camille
  // id: '62cebd712da5453a4c596710',
  // upt: 'oTR5_cxk2khmZ11lREegS6QjxO4SNuEJ0',
  // Younes
  id: '666300d72da5432810f5091c',
  upt: 'NsuKq--G3Egx9s1Y7kMxQY9nOG2HqHan0',
};

const message =
  '\nNous recherchons un professeur particulier à la rentrée prochaine, est-ce que cela pourrait vous intéresser ?\n' +
  'N’hésitez pas à m’envoyer votre email et/ou votre numéro de téléphone pour que je puisse vous contacter.\n' +
  'Bien cordialement,\n' +
  'Younes\n';

const checkInOneConv = async (
  headers,
  email,
  phone,
  data,
  name,
  title,
  conv
) => {
  const idConv = conv.Id;
  const conversationPromise = await fetch(
    `https://www.tusclases.com/api_common/api/messages/gdlg?ucid=${compte.id}&upt=${compte.upt}&gid=${idConv}&l=fr&tzo=-120&tcpcid=0&ch=369B5ABC50B45972F04FB6D9E973C2F2CEBBF282724D65191B305B63DD846D72826C5FFDA981778568E054B0F5ADE121F03B86999108FE36ED5CB2A653549859
        `,
    {
      headers,
    }
  );

  const conversation = await conversationPromise.json();

  // eslint-disable-next-line no-loop-func
  conversation.Messages.forEach((msg) => {
    // console.log(msg.Content);
    email = /\b([^\s]+@[^\s]+)\b/gi.exec(msg.Content);
    phone = /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/gim.exec(msg.Content);

    if (email || phone) {
      email = email ? email[0] : null;
      phone = phone ? phone[0] : null;

      data.push({ name, email, phone, title });
    }
  });
};

const runThroughPage = async (page, data) => {
  const headers = {
    'User-Agent': randomUA.getRandom(),
  };

  const conversationsPromise = await fetch(
    `https://www.tusclases.com/api_common/api/messages/glg?ucid=666300d72da5432810f5091c&upt=NsuKq--G3Egx9s1Y7kMxQY9nOG2HqHan0&l=fr&tzo=-120&ft=0&q=&tcpcid=0&ch=1134F8CB0AB42FFDD2B88B0A1DB0C04CF893F6B9DF6F77D2AE658D0BCEC0DE653A66F188650DAA042E24997E764EFDEAE69C0AB06971A4DF66F8FEE4D59FF668&pid=9&lpd=${page}&igi=`,
    {
      credentials: 'omit',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:126.0) Gecko/20100101 Firefox/126.0',
        Accept: '*/*',
        'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
      },
      referrer: 'https://www.voscours.fr/',
      method: 'GET',
      mode: 'cors',
    }
  );

  //

  const conversations = await conversationsPromise.json();

  // eslint-disable-next-line no-restricted-syntax, node/no-unsupported-features/es-syntax
  for await (const conv of conversations.Conversations) {
    let messages = [];
    let phone = null;

    const r = await (
      await fetch(
        `https://www.tusclases.com/api_common/api/messages/gdlg?ucid=${compte.id}&upt=${compte.upt}&gid=${conv.Id}&l=fr&tzo=-120&tcpcid=0&ch=1134F8CB0AB42FFDD2B88B0A1DB0C04CF893F6B9DF6F77D2AE658D0BCEC0DE653A66F188650DAA042E24997E764EFDEAE69C0AB06971A4DF66F8FEE4D59FF668`,
        {
          credentials: 'omit',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:126.0) Gecko/20100101 Firefox/126.0',
            Accept: '*/*',
            'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            Priority: 'u=1',
          },
          referrer: 'https://www.voscours.fr/',
          method: 'GET',
          mode: 'cors',
        }
      )
    ).text();

    messages = JSON.parse(r).Messages;

    const json = await (
      await fetch('https://www.voscours.fr/api/api/messaging/gcpp', {
        headers: {
          accept: 'application/json, text/javascript, */*; q=0.01',
          'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'sec-ch-ua':
            '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'x-requested-with': 'XMLHttpRequest',
        },
        referrer: `https://www.voscours.fr/account/messaging/${conv.Id}`,
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: `out=${conv.Participants[0].Id}&po=9&uid=3831641`,
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
      })
    ).text();

    phone = JSON.parse(json).PhoneNumber;

    const messagesText = _.map(messages, (m) => `${m.Content}`).join(' ');

    let email = /\b([^\s]+@[^\s]+)\b/gi.exec(messagesText);
    phone = /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/gim.exec(messagesText)
      ? /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/gim.exec(messagesText)[0]
      : phone;

    const name = conv.Participants[0].Name;
    const title = conv.AnuncioTitle;

    if (email || phone) {
      const idTeacher = conv.Participants[0].Id;
      const idAn = messages[1].RefAdId;

      email = email
        ? email[0].replace('mail:', '').replace(`${phone}.`, '')
        : null;
      data.push({
        name,
        email,
        phone,
        title,
        idAn,
        idTeacher,
      });
    } else {
      const nbUnreadMessage = conv.NUnreadMessages;
      if (nbUnreadMessage > 1) {
        console.log(`nb unreadmsg = ${nbUnreadMessage}`);

        await checkInOneConv(headers, email, phone, data, name, title, conv);
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
  await utils.convertToCSV(data, `data/voscours/new/new-data.csv`);
  await utils.convertToCSV(data, `data/voscours/data-voscours-1.csv`);

  console.log(data, data.length);
};

const contactAllTeacher = async () => {
  const allT = await utils.readCSV('data/voscours/urls/urls-voscours.csv', ',');

  let idx = 0;
  let dI = 0;
  for await (const t of allT) {
    try {
      await SendMessageTo(t);
      dI++;
      utils.logProgress(dI, allT.length / process.env.T, 'Success', '');
    } catch (e) {
      console.log(e);
      dI++;
      utils.logProgress(dI, allT.length / process.env.T, 'Erreur', '');
    }
    idx++;
  }
};

const SendMessageTo = async (annonce) => {
  return new Promise((res, rej) => {
    scrap.get({
      url: annonce.url,
      headers: {},
      onSuccess: async ($, response, html, config) => {
        const name = $($('.username')[0]).text();
        const userId = $($("input[name='ctl00$m$ctl00$iduser']")[0]).val();
        console.log(`Sending message to ${name} id ${userId} 🛠`);
        await fetch('https://www.voscours.fr/api/api/contact/student-pass', {
          headers: {
            accept: '*/*',
            'accept-language': 'fr-FR,fr;q=0.9',
            'content-type': 'application/json',
            priority: 'u=1, i',
            'sec-ch-ua':
              '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            cookie:
              'UU=112406071511218; ua=0; ASP.NET_SessionId=5mjw1qwqsw5h3aq3rdbk3o5k; cfg2=20; pp={"analiticas": {"All":true,"_ga":true,"source":true,"_gid":true,"_gat":true,"_hj":true,"optimizely":true,"npv":true,"nv":true,"tf":true}, "funcionales": {"All":true,"g_state":true,"lastsearch":true,"TCP_ms":true,"TCP_UI":true,"classgap_apt":true,"applus2":true}, "publicidad": {"All":true,"__gads":true,"datr_usida":true}, "fecha": 1717767188597, "version": 2}; _gcl_au=1.1.356894273.1717767189; _ga=GA1.1.184333753.1717767177; TCP_UI=E=youness.dpl@gmail.com&N=Youness&P=0664805771&TO=1&U=6059510&CPI=9&TK=NsuKq--G3Egx9s1Y7kMxQY9nOG2HqHan0&CTS=1; TCP_ms=4C28ACD2006246D8; TCP_Auth=e88c7c14-6c2c-4130-8edb-0a93a5b5cf21; lastsearch={"FechaUltimaActividad":"\\/Date(-62135596800000)\\/","LastSearchDate":"\\/Date(1717767518557)\\/","origenLocalidad":0,"QualityType":null,"MaxNDelayedMultiLeadScore":0,"CheckMultileadPermission":false,"IsNotInternalOffer":false,"MultiSubcatIds":"","MultiSubcatName":"","SinContactos":false,"TipoOfertanteId":0,"RegionId":0,"ProvinciaId":0,"CategoriaId":0,"SubCategoriaId":295,"Texto":"","HiddenQuery":"","Localidad":"","NumPagina":1,"ClienteId":0,"Foto":0,"Online":0,"ADomicilio":0,"InCompany":0,"Presenciales":0,"Primaria":0,"Preescolar":0,"ESO":0,"Bachillerato":0,"Universidad":0,"Adultos":0,"NivelIdiomaIniciacion":0,"NivelIdiomaBajo":0,"NivelIdiomaMedio":0,"NivelIdiomaAlto":0,"isSemantic":false,"OrdenCampo":"FechaParrilla","OrdenSentido":"desc","CustomOrden":false,"NumFilters":1,"ConTelefono":0,"ExternalPage":false,"NumResults":25,"NumFacets":50,"Categoria":"","SubCategoria":"","Provincia":"","CategoriaURL":"","SubCategoriaURL":"","ProvinciaURL":"","TotalResultsFound":0,"MustInFTI":false,"Suggested":false,"FiltrarFecha":false,"FechaMinima":"\\/Date(1402148318557)\\/","FechaMaxima":"\\/Date(1749303518557)\\/","Destacado":false,"TopTutor":false,"IdiomaConoce":0,"IdiomaNecesita":0,"Recomendaciones":0,"X":0,"Y":0,"Km":0,"Pais":0,"PaisOriginal":0,"Ids":null,"IdsExclude":null,"IdsClienteExclude":null,"IdsUsersInclude":null,"IdsUsersExclude":null,"LocalidadId":0,"OnlyUsersWithProfile":false,"NotUserIds":null,"KeywordId":0,"Keyword":"","KeywordURL":"","PuntoInteresId":"","PuntoInteres":"","PuntoInteresRewrite":"","GeoPoints":null,"GeoPointsIntersect":null,"Classgap":false,"CategoriaIds":null,"SubCategoriaIds":null,"LocalidadesIds":null,"LocalidadesPublicacionIds":null,"NotIds":null,"LocalidadIdDesp":0,"SearchAllSubcategories":false,"SearchLocalidadById":false,"Skip":0,"SearchId":0,"PriceFrom":0,"PriceMin":0,"PriceMax":0,"NoSecondQueryIfNotNeeded":false,"TextSearch":"","IdPortal":-1,"ProfesorPlusStatusMin":-1,"OnlyTutors":false,"OnlyClientesPago":false,"FechaParrillaCualitativaMinima":"\\/Date(-62135596800000)\\/"}; TC_OR={"a":19,"adgroupid":"","o":0}; AWSALBTG=TFHSEWgPOuVq0QpdBhqEpFS9IazfanWo3WXic5igjVleFkGdE3v6N4dvkYXXIf1kWZ00HXbaVtEB4mgsCQjHAV5gNnjV5dQJNBhsRzCTma42rRPEGyWkXwW5cLDIg3IX5umHcw2NoJIdcKbcnQwmIdEtcPfvCArS5fsuy+oM8TM1; AWSALBTGCORS=TFHSEWgPOuVq0QpdBhqEpFS9IazfanWo3WXic5igjVleFkGdE3v6N4dvkYXXIf1kWZ00HXbaVtEB4mgsCQjHAV5gNnjV5dQJNBhsRzCTma42rRPEGyWkXwW5cLDIg3IX5umHcw2NoJIdcKbcnQwmIdEtcPfvCArS5fsuy+oM8TM1; _ga_TTK4WVFXY0=GS1.1.1717767177.1.1.1717769934.0.0.0',
            Referer: annonce.url,
            'Referrer-Policy': 'strict-origin-when-cross-origin',
          },
          body: `{\"uId\":\"${userId}\",\"Name\":\"Youness\",\"Mail\":\"youness.dpl@gmail.com\",\"Text\":\"Bonjour ${name}, ${message}.\",\"Phone\":\"0664805771\",\"IdAnuncio\":\"${annonce.id}\"}`,
          method: 'POST',
        });
        console.log(`${name} contacted ✓`);
      },
    });
  });
};

const voscours = {
  scrapper: async () => {
    const { action } = process.env;
    switch (action) {
      case 'download-sitemap':
        await downloadAndCleanSitemap();
        break;
      case 'contact-teachers':
        await contactAllTeacher();
        break;
      case 'get-emails':
        await getEmails();
        break;
      default:
        console.error(`unknown command ${action}`);
        break;
    }
    return [];
  },
};

export default voscours;
