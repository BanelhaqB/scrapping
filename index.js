/* eslint-disable import/extensions */
import ttp from "./scripts/ttp.js";
import voscours from "./scripts/voscours.js";

const main = async () => {
  let data;
  console.log(process.env.site);
  switch (process.env.site) {
    case "ttp":
      data = await ttp.scrapper();
      break;
    case "voscours":
      data = await voscours.scrapper();
      break;
    default:
      data = [];
      console.log("command not supported yet");
      break;
  }

  console.log(`Done! ${data.length} items imported succefuly`);
};

main();
