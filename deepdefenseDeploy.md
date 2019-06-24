### Loclhost Prework

#### path:

- confPath: /etc/deepdefense/
- logPath: /var/deepdefense/...
  - scanner: scannerLog/
  - portal: portalLog/

```shell
sudo mkdir /etc/deepdefense
sudo mkdir -p /var/deepdefense/scannerLog /var/deepdefense/portalLog
```

#### set docker /etc/docker/daemon.json

```json
{
  "registry-mirrors": ["https://registry.docker-cn.com"],
  "insecure-registries": ["localhost:4003"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100M",
    "max-file": "3"
  }
}
```

#### get source code && image

- scanner(source code)
- portal(source code)
- mongo(image)
- registy(image)
- node(image)
- clair(source code)
- postgres(image)
- falco(image)

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
##get clair source code(deepdefense-scanner)
git clone -b release-2.0 https://github.com/coreos/clair.git
##get clair config file
curl -L https://raw.githubusercontent.com/coreos/clair/master/config.yaml.sample -o /etc/deepdefense/deepdefense-scanner-config.yaml
##get portal and scanner-api source code
sudo git clone http://192.168.3.2/xCloud/DeepDefence-web.git (feat/tabs)
sudo git clone http://192.168.3.2/DeepDefense/scanner.git (master)
sudo git clone http://192.168.3.2/DeepDefense/portal.git (master)
```

#### init && build docker image

- claire
- vim Dockerfile

```dockerfile
FROM golang:1.10-alpine

VOLUME /config
EXPOSE 6060 6061

ADD .   /go/src/github.com/coreos/clair/
WORKDIR /go/src/github.com/coreos/clair/

RUN apk add --no-cache git rpm xz && \
    export CLAIR_VERSION=$(git describe --always --tags --dirty) && \
    go install -ldflags "-X github.com/coreos/clair/pkg/version.Version=$CLAIR_VERSION" -v github.com/coreos/clair/cmd/clair && \
    mv /go/bin/clair /deepdefense-scanner && \
    rm -rf /go /usr/local/go

ENTRYPOINT ["/deepdefense-scanner"]
```

sudo docker build -t deepdefense-scanner:v2.0

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

### start container

```shell
#set network
sudo docker network create deepdefense
#add such params running container, allow config file use hostname instand ip
--net deepdefense --hostname XXX

#registry with auth
# sudo docker run -d -p 5000:5000 --restart=always -v $SRC/registry/config/:/etc/docker/registry/ -v $SRC/registry/auth/:/auth/ -e "REGISTRY_AUTH=htpasswd" -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry  Realm" -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd -v $SRC/registry/:/var/lib/registry/ registry
#registry
sudo docker run --restart=always -d -p 5000:5000 -v $SRC/registry/:/var/lib/registry/ -e REGISTRY_STORAGE_DELETE_ENABLED="true" registry

#SRC must be Absolute path
#mongodb local test
#sudo docker run --restart=always --name deepdefense-db -d -p 27018:27017 deepfense-db:4.0.9
#mongodb
sudo docker run --restart=always --name deepdefense-db -d -p 27017:27017 -v /var/mongo/db:/data/db deepfense-db:4.0.9
#postgres
sudo docker run --restart=always --name deepdefense-cve -d -e POSTRES_PASSWD="" -p 5432:5432 deepdefense-cve:9.6

#clair
sudo docker run --restart=always --name deepdefense-scanner -d -p 6060-6061:6060-6061 -v /etc/deepdefense:/config deepdefense-scanner:2.0 -config=/config/deepdefense-scanner-config.yaml

#scanner-api-server
sudo docker run --restart=always --name scanner-api-server -d -p 4000-4001:4000-4001 -v /etc/deepdefense:/etc/deepdefense scanner-api-server:2.1.X

#portal
sudo docker run --restart=always --name deepdefense-portal -d -p 4002:5001 deepdefense-portal:v2.1.1

#falco
sudo docker run  --privileged --restart=always --name deepdefense-monitor -d -v /var/run/docker.sock:/host/var/run/docker.sock -v /dev:/host/dev -v /proc:/host/proc:ro -v /boot:/host/boot:ro -v /lib/modules:/host/lib/modules:ro -v /usr:/host/usr:ro -v /etc/deepdefense/deepdefense-monitor-config.yaml:/etc/falco/falco.yaml -v /etc/deepdefense/deepdefense-monitor-rules.yaml:/etc/falco/falco_rules.local.yaml -v /etc/deepdefense/deepdefense-monitor-rules.default.yaml:/etc/falco/falco_rules.yaml deepdefense-monitor:0.15.0
```
