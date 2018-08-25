const fs = require('fs');
const request = require('request');

const YESTERDAY = Date.now() - 1000 * 60 * 60 * 24;

const requestNodeModule = (resolve, reject, nodeModule, nodeModuleFilename) => {
  request(
    'https://api.npmjs.org/downloads/range/2017-02-25:9999-12-31/' + nodeModule,
    (err, _response, body) => {
      if (err) {
        reject(err);
        return false;
      }
      fs.writeFile('cache/' + nodeModuleFilename + '.json', body, err => {
        if (err) {
          console.error(err);
        }
      });
      resolve(JSON.parse(body));
      return true;
    }
  );
};

const fetchDownloads = (packages) =>
  Promise.all(
    packages.map(package =>
      Promise.all(
        package.map(nodeModule =>
          nodeModule === null ?
            Promise.resolve({ downloads: [ { downloads: 0 } ], package: '@' }) :
            new Promise((resolve, reject) => {
              const nodeModuleFilename = nodeModule.replace(/@/g, '__AT__').replace(/\//g, '__SCOPE__');
              fs.stat(
                'cache/' + nodeModuleFilename + '.json',
                (err, stats) => {
                  if (
                    err ||
                    stats.mtimeMs < YESTERDAY
                  ) {
                    requestNodeModule(resolve, reject, nodeModule, nodeModuleFilename);
                  }
                  else {
                    fs.readFile(
                      'cache/' + nodeModuleFilename + '.json',
                      (err, data) => {
                        if (err) {
                          requestNodeModule(resolve, reject, nodeModule, nodeModuleFilename);
                        }
                        else {
                          resolve(JSON.parse(data));
                        }
                      }
                    );
                  }
                }
              );
            })
        )
      )
    )
  )
    .then(
      packagesStats => {
        const stats = Object.create(null);
        for (const packageStats of packagesStats) {
          const package = packageStats[0].package;
          let downloads = 0;
          for (const packageStat of packageStats) {
            for (const download of packageStat.downloads) {
              downloads += download.downloads;
            }
          }
          stats[package] = downloads;
        }
        return stats;
      }
    );

module.exports = fetchDownloads;
