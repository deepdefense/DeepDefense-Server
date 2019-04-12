# node-docker-registry-client

A Docker Registry API client for node.js. For documentation, see the
[main repo](https://github.com/joyent/node-docker-registry-client).

This is forked because `npm audit` says docker-registry-client@3.3.0
is using a vulnerable version of `tough-cookie`, so we've bumped it to
2.3.0 so we can use it without failing our audits.

## Installation

```
$ npm i --save github:Sharecare/node-docker-registry-client#hash
```

## Inputs

NA

## Outputs

A version of docker-registry-client that passes `npm audit` :D

## Dependency or Notable Interaction

NA

## More Information

NA
