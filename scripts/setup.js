
'use strict';

const fs = require('fs');
const k8s = require('@kubernetes/client-node');

const configFileNames = ['proxy.conf.prod.au.json','proxy.conf.prod.eu.json', 'proxy.conf.prod.us.json'];
const edgeXRemoteGatewayURL = '/edgex/remotegateway/*';
const airEndpointURL = '/airEndpoint/*';

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

function setupAir() {
    var infraType = process.argv.slice(2);
    if (infraType == 'minikube'){
        setupAirMinikube();
    }
    
    
};

function setupAirMinikube() {
    /*k8sApi.listEndpointsForAllNamespaces().then((res) => {
        console.log(res);
    });
    k8sApi.listServiceForAllNamespaces().then((res) => {
        var items = res.body.items;
        items.forEach(serviceItem => {
                if (serviceItem.metadata.name == 'core-air-cors-anywhere-service'){
                    console.log(serviceItem.status.loadBalance);
                } else if (serviceItem.metadata.name == 'ingress-nginx-controller-admission'){
                    console.log(serviceItem.status.loadBalancer);
                }   
            }
        );
    });

    // Setup files
    configFileNames.forEach(configFileName => {
        console.log("Updating config file: "+configFileName);
        let proxyrawdata = fs.readFileSync(configFileName);
        let proxyjson = JSON.parse(proxyrawdata);
        proxyjson[edgeXRemoteGatewayURL].target = "CHANGED!!!!!";
        let data = JSON.stringify(proxyjson, null, 2);
        fs.writeFileSync(configFileName, data);
    });*/
}

setupAir()