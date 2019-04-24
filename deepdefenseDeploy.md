###  Loclhost Prework
####  path:
- confPath: /etc/deepdefense/
- logPath: /var/deepdefense/...
  - scanner: scannerLog/
  - portal: portalLog/
```shell
sudo mkdir /etc/deepdefense
sudo mkdir -p /var/deepdefense/scannerLog /var/deepdefense/portalLog
sudo mkdir -p $SRC/clair/clair_config
```
####  set docker /etc/docker/daemon.json
```json
{
  "registry-mirrors":  [ "https://registry.docker-cn.com" ],
  "insecure-registries": [
    "localhost:4003"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100M",
    "max-file": "3"
  }
}
```
####  get source code && image
- scanner(source code)
- portal(source code)
- mongo(image)
- registy(image)
- node(image)
- clair(image)
- postgres(image)
```shell
sudo docker image pull node:8.15.1-stretch
sudo docker image pull mongo
sudo docker image pull postgres:9.6
sudo docker image pull quay.io/coreos/clair:v2.0.8
sudo docker image pull registry
sudo docker tag quay.io/coreos/clair:v2.0.8 deepdefense-scanner:v2.0.8
sudo docker tag mongo deepfense-db:latest
zcurl -L https://raw.githubusercontent.com/coreos/clair/master/config.yaml.sample -o $SRC/clair/clair_config/config.yaml
sudo git clone http://192.168.3.2/xCloud/DeepDefence-web.git (feat/tabs)
sudo git clone http://192.168.3.2/DeepDefense/scanner.git (master)
```
####  init && build docker image
- scanner
```shell
cd $SRC/scanner && sudo docker build -t scanner:1.2.0 .
```
```dockerfile
# Nodejs
#
# VERSION  1.2.0
# WORKDIR /usr/src/app
# MOUNT /etc/deepdefense /etc/deepdefense

FROM node:8.15.1-stretch
LABEL version="1.2.0" \
      description="this is deepscanner server. listen on 4000-4001"


RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/
COPY . /usr/src/app
RUN npm install && npm cache clean --force
EXPOSE 4000
EXPOSE 4001

#CMD [ "node", "app.js" ]
```
- porttal
```shell
cd $SRC/portal && npm run build
sudo docker build -t deepdefense-portal:1.2.0 .
```
```dockerfile
# Nodejs
#
# VERSION  1.2.0

FROM node:8.15.1-stretch
LABEL version="1.2.0" \
    description="this is deepscanner server. listen on 5001"


RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/
COPY . /usr/src/app
RUN npm install && npm cache clean --force
EXPOSE 5001

#CMD [ "node", "app.js" ]
```
- registry
```shell
# $SRC/registry: image location
sudo mkdir -p $SRC/registry/auth && sudo mkdir $SRC/registry/config
sudo docker run --entrypoint htpasswd registry -Bbn {user} {passwd}  >> $SRC/registry/auth/htpasswd
sudo vim $SRC/registry/config/config.yml
```
```yml
version: 0.1
log:
  fields:
    service: registry
storage:
  delete:
    enabled: true
  cache:
    blobdescriptor: inmemory
  filesystem:
    rootdirectory: /var/lib/registry
http:
  addr: :5000
  headers:
    X-Content-Type-Options: [nosniff]
health:
  storagedriver:
    enabled: true
    interval: 10s
threshold: 3
```
###  start container
```shell
# sudo docker run -d -p 5000:5000 --restart=always -v $SRC/registry/config/:/etc/docker/registry/ -v $SRC/registry/auth/:/auth/ -e "REGISTRY_AUTH=htpasswd" -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry  Realm" -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd -v $SRC/registry/:/var/lib/registry/ registry
sudo docker run --restart=always -d -p 5000:5000 -v $SRC/registry/:/var/lib/registry/ registry
sudo docker run --restart=always --name deepdefense-db -d -p 27017:27017 deepfense-db:latest
sudo docker run --restart=always --name deepdefense-cve -d -e POSTRES_PASSWD="" -p 5432:5432 deepdefense-cve:9.6
#SRC must be Absolute path
sudo docker run --restart=always --name deepdefense-scanner --net=host -d -p 6060-6061:6060-6061 -v $SRC/clair/clair_config:/config deepdefense-scanner:v2.0.8 -config=/config/config.yaml
#init db
sudo docker run -it deepscanner:1.2.0 /bin/bash
> node scripts/init.js
> exit
sudo docker run --restart=always --name scanner -d -p 4000-4001:4000-4001 --mount type=bind,source=/etc/deepdefense,target=/etc/deepdefense scanner:1.2.0 node --max-old-space-size=1024 --max-semi-space-size=1024 app.js
sudo docker run --restart=always --name deepdefense-portal -d -p 4002:5001 deepdefense-portal:1.2.0 node --max-old-space-size=1024 --max-semi-space-size=1024 app.js
```