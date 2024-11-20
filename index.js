/* eslint-disable import/extensions */
import ttp from "./scripts/ttp.js";
import voscours2 from "./scripts/voscours.v2.js";

const main = async () => {
  console.log(process.env.site, " --> ", process.env.action);

  switch (process.env.site) {
    case "ttp":
      await ttp.scrapper();
      break;
    case "voscours":
      await voscours2.scrapper(process.env.action);
      break;
    default:
      console.log("command not supported yet");
      break;
  }

  console.log(`Done!`);
};

main();
