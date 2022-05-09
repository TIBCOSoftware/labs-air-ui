# TIBCO LABS™ Project AIR™ UI

![Logo](https://tibcosoftware.github.io/TIBCO-LABS/about/tibcolabs-brand.png "Labs Logo")

[![Project Air UI](https://github.com/TIBCOSoftware/labs-air-ui/actions/workflows/build.yaml/badge.svg)](https://github.com/TIBCOSoftware/labs-air-ui/actions/workflows/build.yaml)
[![Static Analysis](https://github.com/TIBCOSoftware/labs-air-ui/actions/workflows/lint.yaml/badge.svg)](https://github.com/TIBCOSoftware/labs-air-ui/actions/workflows/lint.yaml)

This repository contains the UI for the TIBCO LABS™ Project AIR™ project. It has several
components that allow the UI to be run in an On-Prem or Cloud format. The On-Prem format
is the initial starting point. Please explore this first. It is used in the released
versions of the project and may be the most easy to discover and utilize.

A "Cloud" version of the UI also exists. This builds upon the underlying interface and
augments a few services related to authentication and accessing a backend data store hosted
in the cloud. This is useful when more advanced authentication and data access scenarios are
required.

## Contributing

For information regarding participation in the project, please see our [contributing](./CONTRIBUTING.md)
document.

You will need the following tooling to interact and modify the project:

* [npm](https://www.npmjs.com/)

For setup instructions, please refer to the  [contributing](./CONTRIBUTING.md) doc.

### Connecting the Project AIR™ UI to Project AIR™ Infrastructure

To connect an instance of the UI to a dGraph instance modify
`labs-air-ui/projects/on-prem/assets/data/appConfig.json` or `projects/cloud/assets/data/appConfig.json`

```javascript
...
{
    dgraphUrl: 'http://localhost:8080',
    dgraphBasicAuthEnabled: false,
...
}
```

Change the `dgraphUrl` value to the infrastructure endpoint. You may run an instance of dGraph
in your local environment or else where. To get a basic backend started with the On-Prem UI,
please consider running the [startup tool](scripts/start-local-env.sh).

### Troubleshooting

If you have problems building the project, `ng build common` may fix compilation issues.
This will only occur if `npm run prepare` is not used to setup the project.

## Other Project AIR™ Repositories

To discover more, please visit the [Project AIR™](https://github.com/TIBCOSoftware/labs-air)
repository.
