FROM node:latest
LABEL Author "Charles Stover <docker@charlesstover.com>"
WORKDIR /var/www
COPY package.json yarn.lock ./
RUN yarn
RUN mkdir cache
COPY src .
EXPOSE 8080
ENTRYPOINT [ "node", "index.js" ]
