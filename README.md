# Kubernetes Api Client for Node js

## Install

```
npm install --save kubernetes-api-client
```

## Usage

``` js
const {KubernetesApiClient} = require('kubernetes-api-client');

const k8s = new KubernetesApiClient();

const pods = await k8s.get('/v1/pods/default');
```

<!-- toc -->
<!-- tocstop -->

## Getting Started

<!--START docs -->
<!--END docs -->
