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

const obj =
  {"product": [     {"attributes": [         {"ItemCode":"956-0428","UOM":"UN","ProductSEOUrl":"https://www.henryschein.fr/fr-fr/dental/p/vetements-accessoires/calots-et-sabots/calot-selekto-blanc/956-0428"         }],"ENDECCA_5":"Blanc"     },     {"attributes": [         {"ItemCode":"956-0429","UOM":"UN","ProductSEOUrl":"https://www.henryschein.fr/fr-fr/dental/p/vetements-accessoires/calots-et-sabots/calot-selekto-gris-fonce/956-0429"         }],"ENDECCA_5":"Gris foncé"     },     {"attributes": [         {"ItemCode":"956-0430","UOM":"UN","ProductSEOUrl":"https://www.henryschein.fr/fr-fr/dental/p/vetements-accessoires/calots-et-sabots/calot-selekto-fuchsia/956-0430"         }],"ENDECCA_5":"Fuchsia"     },     {"attributes": [         {"ItemCode":"956-0431","UOM":"UN","ProductSEOUrl":"https://www.henryschein.fr/fr-fr/dental/p/vetements-accessoires/calots-et-sabots/calot-selekto-turquoise/956-0431"         }],"ENDECCA_5":"Turquoise"     },     {"attributes": [         {"ItemCode":"956-0432","UOM":"UN","ProductSEOUrl":"https://www.henryschein.fr/fr-fr/dental/p/vetements-accessoires/calots-et-sabots/calot-selekto-vert-fonce/956-0432"         }],"ENDECCA_5":"Vert foncé"     },     {"attributes": [         {"ItemCode":"956-0433","UOM":"UN","ProductSEOUrl":"https://www.henryschein.fr/fr-fr/dental/p/vetements-accessoires/calots-et-sabots/calot-selekto-anis/956-0433"         }],"ENDECCA_5":"Anis"     },     {"attributes": [         {"ItemCode":"956-0434","UOM":"UN","ProductSEOUrl":"https://www.henryschein.fr/fr-fr/dental/p/vetements-accessoires/calots-et-sabots/calot-selekto-bleu-fonce/956-0434"         }],"ENDECCA_5":"Bleu foncé"     },     {"attributes": [         {"ItemCode":"956-0435","UOM":"UN","ProductSEOUrl":"https://www.henryschein.fr/fr-fr/dental/p/vetements-accessoires/calots-et-sabots/calot-selekto-parme/956-0435"         }],"ENDECCA_5":"Parme"     },     {"attributes": [         {"ItemCode":"956-0436","UOM":"UN","ProductSEOUrl":"https://www.henryschein.fr/fr-fr/dental/p/vetements-accessoires/calots-et-sabots/calot-selekto-jaune/956-0436"         }],"ENDECCA_5":"Jaune"     },     {"attributes": [         {"ItemCode":"956-0437","UOM":"UN","ProductSEOUrl":"https://www.henryschein.fr/fr-fr/dental/p/vetements-accessoires/calots-et-sabots/calot-selekto-violet/956-0437"         }],"ENDECCA_5":"Violet"     },     {"attributes": [         {"ItemCode":"956-0438","UOM":"UN","ProductSEOUrl":"https://www.henryschein.fr/fr-fr/dental/p/vetements-accessoires/calots-et-sabots/calot-selekto-bleu-clair/956-0438"         }],"ENDECCA_5":"Bleu clair"     },     {"attributes": [         {"ItemCode":"956-0439","UOM":"UN","ProductSEOUrl":"https://www.henryschein.fr/fr-fr/dental/p/vetements-accessoires/calots-et-sabots/calot-selekto-anthracite/956-0439"         }],"ENDECCA_5":"Anthracite"     }],"dimension": [{"name":"ENDECCA_5","displayName":"Couleur","SortedValues": ["Blanc","Gris foncé","Fuchsia","Turquoise","Vert foncé","Anis","Bleu foncé","Parme","Jaune","Violet","Bleu clair","Anthracite"]}]}\;
