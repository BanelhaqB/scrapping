/* eslint-disable no-plusplus */
// eslint-disable-next-line import/extensions
import cheerio from "cheerio";
import cheerioAdv from "cheerio-advanced-selectors";
import _ from "lodash";
// eslint-disable-next-line import/no-unresolved,node/no-missing-import
import * as fs from "node:fs/promises";
// eslint-disable-next-line import/extensions
import utils from "../utils/utils.js";

const cheerioWrapped = cheerioAdv.wrap(cheerio);

const NUMBER_OF_CHUNKS = 4;

const USER_ID = 6664700;
const USER_EMAIL = "n7ihkj5d6ncr@mozmail.com";
const COOKIE =
  'pp={"analiticas": {"All":true,"_ga":true,"source":true,"_gid":true,"_gat":true,"_hj":true,"optimizely":true,"npv":true,"nv":true}, "funcionales": {"All":true,"g_state":true,"lastsearch":true,"TCP_ms":true,"TCP_UI":true,"classgap_apt":true,"applus2":true}, "publicidad": {"All":true,"__gads":true,"datr_usida":true}, "fecha": 1705325802645}; _ga_TTK4WVFXY0=GS1.1.1732094398.17.1.1732096137.0.0.0; _ga=GA1.1.895837920.1705325803; g_state={"i_l":2,"i_p":1731775478659}; AWSALBTGCORS=BH+rEq0kNwpsVt/7anfR+Y9W76fFSeRZZfrngE3Mu8V2VuP9SR1ag49km9dIVmw9qzQagpT+y4pswtMaWoZ+6JdQrPErdDbB0zCcVxg0Cvu3F68lhBvacmHPU+VabTWQh3so10U9Ye46OWgZjzhwuvhboNePN1XtVXkfD2mOOCKz; UU=1124111517100814; ASP.NET_SessionId=3fhrlf2q4reu0da3jmpafzya; _fbp=fb.1.1731689303195.558389923543236991; TCP_UI=E=n7i5d6ncr@mozmail.com&N=Younes&P=06648055269&TO=1&U=6664733&CPI=9&TK=a8mX1ZQF3UjOrKydBuSTSYGlnivE6SMn0&CTS=1; TCP_ms=3CEDBFEBCA10A4CA; TCP_Auth=5407d764-f3ac-48e2-960e-0a940c65b7fc; ua=0';

// ------- SITEMAPS ---------
const ALL_SITEMAPS = [
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=Profesores",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresBouches-du-rhone",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresRhone",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresGironde",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresHaute-Garonne",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresHerault",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresNord",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresParis",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresVar",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresMarne",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresMarne",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresCote-d-Or",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresMaine-et-Loire",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresLoire",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresIndre-et-Loire",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresPyrenees-Atlantiques",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresMoselle",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresFinestere",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresGard",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresSomme",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresLoiret",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresVienne",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresHaute-Savoie",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresPyrenees-Orientales",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresDoubs",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresHaute-Vienne",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresVaucluse",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresSarthe",
  "https://www.voscours.fr/sitemap-anuncios.aspx?tipo=ProfesoresHaut-Rhin",
];

// Download sitemap
const downloadSitemap = async (id) => {
  return new Promise(async (resolve, reject) => {
    const fct = async ($, response, html, config, dataArr) => {
      await fs.writeFile(
        `data/voscours/sitemaps/sitemap-voscours-${id}.xml`,
        html,
        (err) => {
          if (err) throw err;
        }
      );

      console.log(`Voscours : sitemap ${id} -- is writted ✅`);
      resolve();
    };

    await utils.scrapTemplate(ALL_SITEMAPS[id], fct, resolve, reject);
  });
};

// Clean sitemap
const cleanSitemap = async (id) => {
  return new Promise(async (resolve) => {
    const data = await fs.readFile(
      `data/voscours/sitemaps/sitemap-voscours-${id}.xml`,
      "utf8"
    );

    let array = data
      .split("loc")
      .map((e) => e.trim().substring(1, e.trim().length - 2));

    array = _.filter(array, function (e) {
      return e[0] === "h";
    });

    array = _.map(array, (e) => {
      return { id: e.split("-")[e.split("-").length - 1], url: e };
    });

    array = _.uniqBy(array, "id");

    console.log(`Sitemap ${id} -> ${array.length} new links`);

    await utils.convertToCSV(
      array,
      `data/voscours/urls/urls-voscours.csv`,
      true
    );

    console.log(
      `voscours : sitemap ${id} -- is clean ✅ - (${array.length} unique url)`
    );

    resolve(array);
  });
};

// ---- Scrap all sitemap
const downloadAndCleanSitemap = async () => {
  console.log(`voscours : Update sitemaps starting... 🛠`);
  for await (const sitemapId of _.range(ALL_SITEMAPS.length)) {
    // await downloadSitemap(sitemapId);
    await cleanSitemap(sitemapId);
  }

  console.log(`voscours : All Sitemaps ${ALL_SITEMAPS.length} are clean 🎉`);
};

const getPhone = async (idAnnonce) => {
  const url = `https://www.voscours.fr//consultationok.aspx?A=${idAnnonce}&U=${USER_ID}&I=38645666&E=${USER_EMAIL}&ok=0`;

  const html = await (
    await fetch(url, {
      credentials: "include",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        Priority: "u=0, i",
        Cookie: COOKIE,
        Host: "www.voscours.com",
        Referer: url,
      },
      method: "GET",
      mode: "cors",
    })
  ).text();

  const $ = cheerioWrapped.load(html);
  const phoneNumber =
    _.last($("#telephoneTxt").text().split(" ")) === ""
      ? null
      : _.last($("#telephoneTxt").text().split(" "));

  return phoneNumber;
};

const fetchAllAnnonces = async (idxOfChunk) => {
  const annonces = await utils.readCSV("data/voscours/urls/urls-left.csv", ",");

  const chunks = _.chunk(
    annonces,
    Math.floor(annonces.length / NUMBER_OF_CHUNKS)
  );

  const chunk = chunks[idxOfChunk * 1];

  let i = 0;
  for await (const annonce of chunk) {
    i++;
    try {
      const phone = await getPhone(annonce.id);

      if (phone) {
        await utils.convertToCSV(
          [{ id: annonce.id, phone, url: annonce.url }],
          `data/voscours/data-${idxOfChunk}.csv`,
          true
        );
      }

      await utils.convertToCSV(
        [{ id: annonce.id, hasPhone: phone != null ? "true" : "false" }],
        `data/voscours/processed.csv`,
        true
      );

      console.log(
        `Chunk number : ${idxOfChunk}. Annonce ${annonce.id} ${i}/${
          chunk.length
        } [${Math.floor((i / chunk.length) * 100)}%] - ${
          phone ? `📞 ${phone}` : "no phone"
        }`
      );
    } catch (e) {
      await utils.convertToCSV(
        [{ id: annonce.id, error: e.message }],
        `data/voscours/errors.csv`,
        true
      );

      console.log(
        `Chunk number : ${idxOfChunk}. Annonce ${annonce.id} ${i}/${
          chunk.length
        } [${Math.floor((i / chunk.length) * 100)}%] - ❌  Error : ${e}`
      );
    }
  }
};

const voscours = {
  scrapper: async (action) => {
    switch (action) {
      case "download-sitemap":
        // await downloadAndCleanSitemap();
        break;
      case "get-phones":
        // eslint-disable-next-line no-case-declarations
        await fetchAllAnnonces(process.env.chunk);
        break;
      default:
        console.error(`unknown command ${action}`);
        break;
    }
    return [];
  },
};

export default voscours;
