FROM keymetrics/pm2:6

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

EXPOSE 8080
CMD [ "pm2-docker", "process.prod.json"]