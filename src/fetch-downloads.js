const fs = require('fs');
const request = require('request');

const CATCH_ALL_PACKAGE = {
  downloads: [ { downloads: 0 } ],
  package: '@',
};

const ONE_DAY = 1000 * 60 * 60 * 24;

const log = (message, type = 'log') => {
  console[type](`[${new Date().toISOString()}] ${message}.`);
};

const error = message => {
  log(message, 'error');
};

const requestNodeModule = (nodeModule, nodeModuleFilename) => {
  return new Promise((resolve, reject) => {
    request(
      'https://api.npmjs.org/downloads/range/2017-02-25:9999-12-31/' + nodeModule,
      (err, _response, body) => {
        if (err) {
          error(`Error fetching ${nodeModule}: ${err.message}`);
          reject(err);
          return;
        }
        fs.writeFile('cache/' + nodeModuleFilename + '.json', body, err => {
          if (err) {
            error(
              `Error saving cache file ${nodeModuleFilename}: ${err.message}`,
            );
          }
        });
        resolve(JSON.parse(body));
      }
    );
  });
};

const fetchDownloads = packages =>
  Promise.all(
    packages.map(package =>
      Promise.all(
        package.map(nodeModule =>
          nodeModule === null ?
            Promise.resolve(CATCH_ALL_PACKAGE) :
            new Promise((resolve, reject) => {
              const nodeModuleFilename =
                nodeModule.replace(/@/g, '__AT__').replace(/\//g, '__SCOPE__');
              fs.stat(
                'cache/' + nodeModuleFilename + '.json',
                (err, stats) => {
                  if (
                    err ||
                    stats.mtimeMs < Date.now() - ONE_DAY
                  ) {
                    if (err) {
                      error(
                        `Error reading cache file ${nodeModuleFilename}: ` +
                        err.message,
                      );
                    }
                    else {
                      log(`Fetching ${nodeModule}.`);
                    }
                    requestNodeModule(nodeModule, nodeModuleFilename)
                      .then(resolve)
                      .catch(reject);
                  }
                  else {
                    fs.readFile(
                      'cache/' + nodeModuleFilename + '.json',
                      (err, data) => {
                        if (err) {
                          error(
                            `Refecthing due to error reading package cache ` +
                            ` for ${nodeModuleFilename}: ${err.message}`,
                          );
                          requestNodeModule(nodeModule, nodeModuleFilename)
                            .then(resolve)
                            .catch(reject);
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
          stats[package] = [];
          for (const packageStat of packageStats) {
            if (Array.isArray(packageStat.downloads)) {
              for (const download of packageStat.downloads) {
                if (download.downloads > 0) {
                  const DAYS_AGO = Math.floor(
                    (Date.now() - new Date(download.day).getTime()) /
                    ONE_DAY,
                  );
                  stats[package][DAYS_AGO] = download.downloads;
                }
              }
            }
          }

          // Replace null with 0.
          for (let day = 0; day < stats[package].length; day++) {
            if (!stats[package][day]) {
              stats[package][day] = 0;
            }
          }
        }
        return stats;
      }
    );

module.exports = fetchDownloads;
