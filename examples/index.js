const KubernetesApiClient = require('../lib');

const k8s = new KubernetesApiClient();

async function main() {
  const {items} = await k8s.get('api/v1/namespaces');

  console.info('Available namespaces:');

  for (const ns of items) {
    console.info('-', ns.metadata.name);
  }

  console.info('Waiting for namespace events:');

  const nsId = `test-ns-${Date.now()}`;
  setTimeout(function() {
    k8s.post('api/v1/namespaces', {
      metadata: {
        name: nsId
      }
    });
  }, 3000);

  setTimeout(function() {
    k8s.delete(`api/v1/namespaces/${nsId}`);
  }, 6000);

  await k8s.watch('api/v1/namespaces', function({type, object: ns}) {
    if (type === 'ADDED') {
      console.info('Namespace added:', ns.metadata.name);
    }

    if (type === 'MODIFIED') {
      console.info('Namespace modified:', ns.metadata.name);
    }

    if (type === 'DELETED') {
      console.info('Namespace deleted:', ns.metadata.name);
    }
  });

}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
