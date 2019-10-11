const fetch = require('node-fetch');

const PACKAGES_URL = process.env.PACKAGES_URL || process.argv[2];
const PACKAGES_PATH = './packages';

module.exports = async function getPackages() {
  if (PACKAGES_URL) {
    const response = await fetch(PACKAGES_URL);
    const json = await response.json();
    return json.packages;
  } else {
    const packages = require(PACKAGES_PATH);
    delete require.cache[require.resolve(PACKAGES_PATH)];
    return packages;
  }
}