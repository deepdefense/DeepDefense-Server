###  Loclhost Prework
####  path:
- confPath: /etc/deepdefense/
- logPath: /var/deepdefense/...
  - scanner: scannerLog/
  - portal: portalLog/

```shell
sudo mkdir /etc/deepdefense
sudo mkdir -p /var/deepdefense/scannerLog /var/deepdefense/portalLog
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
- clair(source code)
- postgres(image)

```shell
cd $SRC
##get registry image
sudo docker image pull registry:2.7.1
##get deepdefense image
sudo docker image pull node:10.15.3-stretch
sudo docker image pull mongo:4.0.9
sudo docker image pull postgres:9.6
sudo docker tag mongo:4.0.9 deepdefense-db:4.0.9 && sudo docker image rm mongo:4.0.9
sudo docker tag postgres:9.6 deepdefense-cve:9.6 && sudo docker image rm postgres:9.6
##build clair image(deepdefense-scanner)
git clone -b release-2.0 https://github.com/coreos/clair.git
##get clair config file
curl -L https://raw.githubusercontent.com/coreos/clair/master/config.yaml.sample -o /etc/deepdefense/deepdefense-scanner-config.yaml
##get portal and scanner-api source code
sudo git clone http://192.168.3.2/xCloud/DeepDefence-web.git (feat/tabs)
sudo git clone http://192.168.3.2/DeepDefense/scanner.git (master)
sudo git clone http://192.168.3.2/DeepDefense/portal.git (master)
```
####  init && build docker image
- scanner
```shell
cd $SRC/scanner && sudo docker build -t scanner-api-server:1.2.0 .
```
- porttal
```shell
cd $SRC/DeepDefence-web && npm run build
mv dist/* $SRC/portal/
cd $SRC/portal
sudo docker build -t deepdefense-portal:v2.1 .
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
#registry with auth
# sudo docker run -d -p 5000:5000 --restart=always -v $SRC/registry/config/:/etc/docker/registry/ -v $SRC/registry/auth/:/auth/ -e "REGISTRY_AUTH=htpasswd" -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry  Realm" -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd -v $SRC/registry/:/var/lib/registry/ registry
#registry
sudo docker run --restart=always -d -p 5000:5000 -v $SRC/registry/:/var/lib/registry/ registry

#SRC must be Absolute path
#mongodb local test
#sudo docker run --restart=always --name deepdefense-db -d -p 27018:27017 deepfense-db:4.0.9
#mongodb
sudo docker run --restart=always --name deepdefense-db -d -p 27017:27017 deepfense-db:4.0.9

#postgres
sudo docker run --restart=always --name deepdefense-cve -d -e POSTRES_PASSWD="" -p 5432:5432 deepdefense-cve:9.6

#clair
sudo docker run --restart=always --name deepdefense-scanner -d -p 6060-6061:6060-6061 -v /etc/deepdefense:/config deepdefense-scanner:2.0 -config=/config/deepdefense-scanner-config.yaml

#scanner-api-server
sudo docker run --restart=always --name scanner -d -p 4000-4001:4000-4001 --mount type=bind,source=/etc/deepdefense,target=/etc/deepdefense scanner:1.2.0 node --max-old-space-size=1024 --max-semi-space-size=1024 app.js

#portal
sudo docker run --restart=always --name deepdefense-portal -d -p 4002:5001 deepdefense-portal:1.2.2
```