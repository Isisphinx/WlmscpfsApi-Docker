FROM keymetrics/pm2:8

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .

RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++
RUN npm install \
    && apk del .gyp

# Bundle app source
COPY . .

RUN ["chmod", "+x", "dump2dcm/dump2dcm"]

EXPOSE 8080
CMD [ "pm2-docker", "process.prod.json",]