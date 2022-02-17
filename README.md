# TIBCO LABS™ Project AIR™ UI

Link to full documentation Site: https://tibcosoftware.github.io/labs-air/

![Logo](https://tibcosoftware.github.io/TIBCO-LABS/about/tibcolabs-brand.png "Labs Logo")

## Other Project AIR™ Repositories

* [Project AIR™ Infrastructure](https://github.com/TIBCOSoftware/labs-air-infra)

The infrastructure is the backend to running the UI. Without the infrastructure, the UI will appear
blank and will not function properly.

## Contributing

For information regarding participation in the project, please see our [contributing](./CONTRIBUTING.md)
document.

## Required Tools

You will need the following tooling to interact and modify the project:

* [npm](https://www.npmjs.com/)

For setup instructions, please refer to the  [contributing](./CONTRIBUTING.md) doc.

### Connecting the Project AIR™ UI to Project AIR™ Infrastructure

To connect an instance of the UI to a Project AIR™ Infrastructure instance, modify
`/labs-air-ui/projects/common/src/lib/environments/environment.ts`

```javascript
...
export const environment = {
    production: false,
    dgraphUrl: 'http://localhost:8080',
    dgraphBasicAuthEnabled: false,
...
```

Change the `dGraphUrl` value to the infrastructure endpoint.

### Troubleshooting

If you have problems building the project, `ng build common` may fix compilation issues.
This will only occur if `npm run prepare` is not used to setup the project.
