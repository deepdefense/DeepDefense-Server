FROM node:10.15.3-stretch
LABEL version="2.0.3" \
  description="this is deepscanner server. listen on 4000"

WORKDIR /usr/src/app/
COPY . /usr/src/app
RUN npm audit fix --force && npm install && npm cache clean --force
EXPOSE 4000
EXPOSE 4001

CMD [ "npm", "run", "start" ]