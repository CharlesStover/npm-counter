# NPM Downloads API
Fetches download count of NPM packages.

## Use

To gather NPM download data from an online JSON source, use the following:

```
docker pull charlesstover/npm-downloads-api;
docker run \
  --detach \
  --env PACKAGES_URL=https://raw.githubusercontent.com/CharlesStover/charlesstover.com/master/src/assets/npm-downloads-api.json \
  --name npm-downloads-api \
  charlesstover/npm-downloads-api;
```

To gather NPM download data from a local JSON source, place the JSON source in
`./packages/` and use the following:

```
docker pull charlesstover/npm-downloads-api;
docker run \
  --detach \
  --name npm-downloads-api \
  --volume /path/to/local/packages:/var/www/packages \
  charlesstover/npm-downloads-api;
```

## Tech Stack
* Docker - containerizes the API
* JavaScript - Promises for fetching and parsing data
* Node - server and file system
