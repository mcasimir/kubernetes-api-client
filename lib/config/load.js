const inCluster = require('./load-in-cluster');
const fromKubeconfig = require('./load-from-kubeconfig');

const {KUBERNETES_SERVICE_HOST, KUBERNETES_SERVICE_PORT} = process.env;

const DEFAULT_STRATEGY = KUBERNETES_SERVICE_HOST && KUBERNETES_SERVICE_PORT ?
  'cluster' :
  'kubeconfig';

module.exports = function({strategy = DEFAULT_STRATEGY, options = {}} = {}) {
  const loader = strategy === 'cluster' ? inCluster : fromKubeconfig;
  return loader(options);
};
