FROM node:8.15.1-stretch
LABEL version="v2.0.3" \
  description="this is deepscanner server. listen on 4000"


RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/
COPY package.json /usr/src/app/
COPY . /usr/src/app
RUN npm audit fix --force && npm install && npm cache clean --force
EXPOSE 4000
EXPOSE 4001

CMD [ "node", "--max-old-space-size=1024", "--max-semi-space-size=1024", "app.js" ]