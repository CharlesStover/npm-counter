FROM node:alpine
LABEL Author "Charles Stover <docker@charlesstover.com>"
WORKDIR /var/www
ENV ACCESS_CONTROL_ALLOW_ORIGIN https://charlesstover.com
COPY package.json yarn.lock ./
RUN yarn
RUN mkdir cache
COPY src .
EXPOSE 8080
ENTRYPOINT [ "node", "index.js" ]
