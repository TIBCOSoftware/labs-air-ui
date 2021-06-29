const PROXY_CONFIG = {
    "/edgex/localgateway/*": {
    "target": "https://localhost:8443",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "info",
    "pathRewrite":{"^/edgex/localgateway" : ""}
  },
  "/edgex/remotegateway/*": {
    "target": "http://localhost:8043",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "info",
    "pathRewrite":{"^/edgex/remotegateway" : ""}
  },
  "/airEndpoint/*": {
    "target": "http://a77d5e583ea66440bb0e26be76aec6bf-1483924641.us-west-2.elb.amazonaws.com",
    "secure": "false",
    "changeOrigin": true,
    "logLevel": "info",
    "pathRewrite":{"^/airEndpoint" : ""}
  },
  "/f1Endpoint/*": {
    "target": "http://54.81.13.248:5408",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "pathRewrite":{"^/f1Endpoint" : ""}
  }
}

// Add the authorization header to request using the value from the TCSTKSESSION cookie
function addOauthHeader(proxyReq, req) {
  // check for existing auth header
  let authHeaderExists = false;
  Object.keys(req.headers).forEach(function (key) {
    if (key.toLowerCase() === 'authorization') {
      authHeaderExists = true;
    }
  });
  if (authHeaderExists === false) {
    Object.keys(req.headers).forEach(function (key) {
      if (key === 'cookie') {
        log('DEBUG', req.headers[key]);
        cookies = req.headers[key].split('; ');
        cookies.forEach((cook => {
          if (cook.startsWith('TCSTKSESSION=')) {
            const authKey = cook.replace('TCSTKSESSION=', '');
            proxyReq.setHeader('Authorization', 'Bearer ' + authKey);
            // log('DEBUG', 'Added auth header');
          }
        }))
      }
    });
  }
}

// Function for logging
const debug = false;
function log(level, message){
  if((debug && level == 'DEBUG') || level != 'DEBUG') {
    console.log('[PROXY INTERCEPTOR] (' + level + '): ' + message);
  }
}

try {
  const propReader = require('properties-reader');
  if (propReader) {
    const tcProp = propReader('tibco-cloud.properties');
    if (tcProp) {
      const cloudProps = tcProp.path();
      if (cloudProps.CloudLogin && cloudProps.CloudLogin.OAUTH_Token && cloudProps.CloudLogin.OAUTH_Token.trim() != '') {
        for (let endpoint in PROXY_CONFIG) {
          //console.log('ENDPOINT: ' , endpoint);
          //console.log(PROXY_CONFIG[endpoint]['headers']);
          let token = cloudProps.CloudLogin.OAUTH_Token;
          const key = 'Token:';
          if (token.indexOf(key) > 0) {
            token = token.substring(token.indexOf(key) + key.length);
          }
          if (PROXY_CONFIG[endpoint] && PROXY_CONFIG[endpoint]['headers']) {
            PROXY_CONFIG[endpoint]['headers']['Authorization'] = "Bearer " + token;
            console.log('Added OAUTH to: ' + endpoint);
          }
        }
      }
    }
  }
} catch (err) {
  console.warn('No oauth token found in tibco-cloud.properties');
}

module.exports = PROXY_CONFIG;
