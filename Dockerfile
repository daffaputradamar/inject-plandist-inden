FROM node:16 AS BUILD_IMAGE

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN npm install

CMD [ "npm", "run", "start" ]