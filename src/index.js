const http = require('http');
const fetchDownloads = require('./fetch-downloads');
const packages = require('./packages');

const headers = {
  'Access-Control-Allow-Methods': 'GET',
  'Access-Control-Allow-Origin': process.env.ACCESS_CONTROL_ALLOW_ORIGIN,
  'Content-Type': 'application/json; charset=utf-8'
};

http.createServer((_request, response) => {
  fetchDownloads(packages)
    .then(json => {
      response.writeHead(200, {
        ...headers,
        'Cache-Control': 'max-age=43200, public', // 12 hours
        'Expires': new Date(Date.now() + 43200000).toUTCString()
      });
      response.write(JSON.stringify(json));
      response.end();
    })
    .catch(err => {
      response.writeHead(400, {
        ...headers,
        'Cache-Control': 'max-age=60, public', // 1 minute
        'Expires': new Date(Date.now() + 60000).toUTCString()
      });
      response.write(JSON.stringify({
        message: err.message
      }));
      response.end();
    });
}).listen(8080, () => {
  console.log('Started successfully.');
});
