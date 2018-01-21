const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function defaultConfigPath() {
  const homeDir = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
  return path.join(homeDir, '.kube', 'config');
}

function fromKubeconfig({kubeconfig, context: current} = {}) {
  if (!kubeconfig) kubeconfig = loadKubeconfig();

  current = current || kubeconfig['current-context'];
  const context = kubeconfig.contexts
    .find((item) => item.name === current).context;
  const cluster = kubeconfig.clusters
    .find((item) => item.name === context.cluster).cluster;
  const userConfig = kubeconfig.users
    .find((user) => user.name === context.user);
  const user = userConfig ? userConfig.user : null;

  let ca;
  let insecureSkipTlsVerify = false;
  if (cluster) {
    if (cluster['certificate-authority']) {
      ca = fs.readFileSync(path.normalize(cluster['certificate-authority']));
    } else if (cluster['certificate-authority-data']) {
      ca = Buffer.from(cluster['certificate-authority-data'], 'base64').toString();
    }

    if (cluster['insecure-skip-tls-verify']) {
      insecureSkipTlsVerify = cluster['insecure-skip-tls-verify'];
    }
  }

  let cert;
  let key;
  const auth = {};
  if (user) {
    if (user['client-certificate']) {
      cert = fs.readFileSync(path.normalize(user['client-certificate']));
    } else if (user['client-certificate-data']) {
      cert = Buffer.from(user['client-certificate-data'], 'base64').toString();
    }

    if (user['client-key']) {
      key = fs.readFileSync(path.normalize(user['client-key']));
    } else if (user['client-key-data']) {
      key = Buffer.from(user['client-key-data'], 'base64').toString();
    }

    if (user.token) {
      auth.bearer = user.token;
    }

    if (user['auth-provider'] && user['auth-provider'].config && user['auth-provider'].config['access-token']) {
      auth.bearer = user['auth-provider'].config['access-token'];
    }

    if (user.username) auth.user = user.username;
    if (user.password) auth.pass = user.password;
  }

  return {
    url: cluster.server,
    auth: Object.keys(auth).length ? auth : null,
    ca: ca,
    insecureSkipTlsVerify: insecureSkipTlsVerify,
    key: key,
    cert: cert
  };
}

module.exports = fromKubeconfig;

function mapCertificates(cfgPath, config) {
  const configDir = path.dirname(cfgPath);

  config.clusters.filter((cluster) => cluster.cluster['certificate-authority']).forEach((cluster) => {
    cluster.cluster['certificate-authority'] = path.resolve(configDir, cluster.cluster['certificate-authority']);
  });

  config.users.filter((user) => user.user['client-certificate']).forEach((user) => {
    user.user['client-certificate'] = path.resolve(configDir, user.user['client-certificate']);
  });

  config.users.filter((user) => user.user['client-key']).forEach((user) => {
    user.user['client-key'] = path.resolve(configDir, user.user['client-key']);
  });

  return config;
}

function loadKubeconfig(cfgPath) {
  cfgPath = cfgPath || defaultConfigPath();

  const config = yaml.safeLoad(fs.readFileSync(cfgPath));

  return mapCertificates(cfgPath, config);
}
