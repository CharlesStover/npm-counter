const http = require('http');
const fetchDownloads = require('./fetch-downloads');
const packages = require('./packages');

http.createServer((_request, response) => {
  fetchDownloads(packages)
    .then(json => {
      response.writeHead(200, {
        'Cache-Control': 'max-age=43200, public', // 12 hours
        'Content-Type': 'application/json; charset=utf-8',
        'Expires': new Date(Date.now() + 43200000).toUTCString()
      });
      response.write(JSON.stringify(json));
      response.end();
    })
    .catch(err => {
      response.writeHead(400, {
        'Cache-Control': 'max-age=60, public', // 1 minute
        'Content-Type': 'application/json; charset=utf-8',
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
