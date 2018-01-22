const request = require('request');
const loadConfig = require('./config/load');
const JsonParseTransform = require('./streams/json-parse-transform');
const AsyncWritableStream = require('./streams/async-writable-stream');
const requestPromise = require('./request-promise');

class KubernetesApiClient {
  constructor(options = {}) {
    this.clusterConfig = loadConfig(options);
  }

  post(path, body = {}) {
    return requestPromise(requestOptions(this.clusterConfig, 'post', path, {body}));
  }

  put(path, body = {}) {
    return requestPromise(requestOptions(this.clusterConfig, 'put', path, {body}));
  }

  patch(path, body = {}) {
    return requestPromise(requestOptions(this.clusterConfig, 'patch', path, {body}));
  }

  delete(path) {
    return requestPromise(requestOptions(this.clusterConfig, 'delete', path));
  }

  get(path, qs = {}) {
    return requestPromise(requestOptions(this.clusterConfig, 'get', path, {qs}));
  }

  async watch(path, fn) {
    const watchOnce = this.watchOnce.bind(this, path, fn);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await watchOnce();
    }
  }

  watchOnce(path, fn) {
    const stream = request(requestOptions(this.clusterConfig, 'get', path, {
      qs: {
        watch: true
      }
    }));

    return new Promise(function(resolve, reject) {
      try {
        stream
          .pipe(new JsonParseTransform())
          .pipe(new AsyncWritableStream(fn))
          .on('error', function(err) {
            reject(err);
          })
          .on('finish', function() {
            resolve();
          });
      } catch (e) {
        reject(e);
      }
    });
  }
}

function requestOptions(clusterConfig, method, path, options = {}) {
  const uri = `${clusterConfig.url}/${path}`;

  return Object.assign({
    method: method,
    uri: uri,
    body: options.body,
    json: true,
    qs: options.qs,
    headers: options.headers
  }, clusterConfig);
}

module.exports = KubernetesApiClient;
