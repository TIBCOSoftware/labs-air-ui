
'use strict';

const fs = require('fs');

const configFileNames = ['proxy.conf.prod.au.json','proxy.conf.prod.eu.json', 'proxy.conf.prod.us.json'];
const minikubeAPIURL = "http://localhost:8080/api/"
const edgeXRemoteGatewayURL = '/edgex/remotegateway/*';
const airEndpointURL = '/airEndpoint/*';

function setupAir() {
    var infraType = process.argv.slice(2);
    if (infraType ==='minikube'){
        setupAirMinikube();
    }
    
    
};

function setupAirMinikube() {
    // Setup files
    configFileNames.forEach(configFileName => {
        console.log("Updating config file: "+configFileName);
        let proxyrawdata = fs.readFileSync(configFileName);
        let proxyjson = JSON.parse(proxyrawdata);
        proxyjson[edgeXRemoteGatewayURL].target = "CHANGED!!!!!";
        let data = JSON.stringify(proxyjson, null, 2);
        fs.writeFileSync(configFileName, data);
    });
}

setupAir()