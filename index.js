const fs = require('fs');
const Myrient = require("./sources/myrient");

const myrient = new Myrient();
myrient.scrape().then((e) => fs.writeFileSync('./out/sources.js', `export default JSON.parse(\`${JSON.stringify([e])}\`);`, 'utf8'));