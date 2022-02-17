# Contributing

When contributing to this repository, please first discuss the change you wish to make via an
issue, email, or any other method with the owners of this repository before making the change.

## Tools

Useful tools for the project include, but are not limited to:

* [Visual Studio Code](https://code.visualstudio.com/)

The project is scanned for lint by a post commit action. Using these tools in an IDE will help
to keep the project lint free.

## Bug Reporting

If you find a bug, please use the project's GitHub issue tracker to log it.

## Setup Your Repository

After cloning the repository,

```bash
npm install
npm run prepare
```

### Start up

To start the project, run:

``` bash
npm run start
```

### Accessing the TIBCO LABS™ Project AIR™ UI

In a web browser, navigate to `localhost:4200` to access the UI.

## Getting Started with Commits

When checking out the repository, please run `npm prepare` in the root folder. This will install
the conventional commit tools that we use to automate changelog attributes. `git commit` will then
be directed to provide a commit template for guidance in structuring the commit message. If well
formatted, these will appear directly in the changelog.

## Pull Request Process

1. No sensitive information should be included in any commit. This includes passwords or secrets for any environment
2. Open a pull request and complete the template explaining the feature, the changes made, and the tests performed
3. Ensure that no lint is added to the project
4. Ensure that all unit tests pass
5. Update the README.md with details of changes to the interface, this includes new environment
   variables, exposed ports, useful file locations and container parameters.
6. You may merge the Pull Request in once you have the sign-off of other developers, or if you
   do not have permission to do that, you may request the second reviewer to merge it for you.

### Source Modifications

Modifications are primarily in `projects/common` project. This is a common library that is shared between the deployment
environments. The on-prem project is the default deployment environment and does not require any external modification to run.

If running the cloud deployment environment, a TIBCO Cloud Account will be needed to access UI.