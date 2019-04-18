const http = require('http');
const fetchDownloads = require('./fetch-downloads');

const headers = {
  'Access-Control-Allow-Methods': 'GET',
  'Access-Control-Allow-Origin': process.env.ACCESS_CONTROL_ALLOW_ORIGIN,
  'Content-Type': 'application/json; charset=utf-8',
};

const ONE_MINUTE = 60000;
const PACKAGES_PATH = './packages';
const TWELVE_HOURS = 43200000;

http.createServer((_request, response) => {
  const packages = require(PACKAGES_PATH);
  delete require.cache[require.resolve(PACKAGES_PATH)];
  fetchDownloads(packages)
    .then(json => {
      response.writeHead(200, {
        ...headers,
        'Cache-Control': 'max-age=43200, public', // 12 hours
        'Expires': new Date(Date.now() + TWELVE_HOURS).toUTCString(),
      });
      response.write(JSON.stringify(json));
      response.end();
    })
    .catch(err => {
      console.error(err.message);
      response.writeHead(400, {
        ...headers,
        'Cache-Control': 'max-age=60, public', // 1 minute
        'Expires': new Date(Date.now() + ONE_MINUTE).toUTCString()
      });
      response.write(JSON.stringify({
        message: err.message,
      }));
      response.end();
    });
})
  .listen(8080, () => {
    console.log('Started successfully.');
  });
