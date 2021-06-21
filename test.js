const _ = require('lodash');
const utils = require('./utils/utils');

const main = async () => {
  const ps = await utils.readCSV('data/dpi/produits.csv', ',');

  const pf = _.uniq(ps.map((e) => e.link.split('=')[1] * 1));

  const psort = _.sortBy(pf, function (n) {
    return n;
  });

  for (let index = 2; index < 1277; index++)
    if (index !== psort[index - 2]) console.log(psort[index - 2], index);

  console.log(psort, `${ps.length} -> ${pf.length}`);

  console.log(psort.includes(107));
};

main();
