# Nodejs
#
# VERSION  1.2.0

FROM node:8.15.1-stretch
LABEL version="1.2.0" \
    description="this is deepscanner server. listen on 4000"


RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/
COPY package.json /usr/src/app/
COPY . /usr/src/app
RUN npm audit fix --force && npm install && npm cache clean --force
EXPOSE 4000
EXPOSE 4001

#CMD [ "node", "app.js" ]