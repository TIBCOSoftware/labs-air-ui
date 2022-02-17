// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  dgraphUrl: ' http://localhost:8080',
  dgraphBasicAuthEnabled: false,
  dgraphBasicAuth: 'Basic YWRtaW46YWRtaW4=',
  f1EndpointUrl: 'http://localhost:8043/http://localhost:5408',
  // f1EndpointUrl: 'http://localhost:8043/http://3.228.65.62:5408',
  // f1EndpointUrl: 'http://localhost:8043/http://52.22.89.56:5408',
  airEndpointUrl: 'http://afcffd879f5dc46239e1284afe8bc4a1-1911133281.us-west-2.elb.amazonaws.com',
  lightcraneEndpointUrl: 'http://localhost:8043/http://localhost:5408',
  // lightcraneEndpointUrl: 'http://localhost:8043/http://3.228.65.62:5408',
  // lightcraneEndpointUrl: 'http://localhost:8043/http://52.22.89.56:5408',
  storeSimulatorEndpoingUrl: 'http://localhost:8043/http://54.197.145.102:9090',
  textileSimulatorEndpoint1Url: 'http://localhost:8043/http://52.7.96.87:8090',
  textileSimulatorEndpoint2Url: 'http://localhost:8043/http://52.7.96.87:9090',
  remoteGatewayUrl: 'http://localhost:8043',
  localGatewayUrl: 'https://localhost:8443'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
