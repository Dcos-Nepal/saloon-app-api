### Orange Cleaning (AU) API Server

#### This project will contain all necessary APIs required for mobile Apps and WEb App.

For Developers:

1. Clone the Project Repo:
`git clone git@bitbucket.org:bmnepali/orange-cleaning-api-server.git`

2. Go to the project forlder:
`cd orange-cleaning-api-server`

3. Copy contents form `env.example` to the `.env` file.

4. Add mail credentials for Email Configuration

5. Make sure you have docker installed. Then run following command form your terminal within the project root.
`docker-compose up dev`

This will run all required insfastructure to start the API server in the devlopment mode.
Once all is working, you can access the api in `http://localhost:4000` or in the port you have assigned in `.env` file.


Note: For api calls, make sure to include API Version in each request:
Format: `https://<host>:<port>/api/<API Version>/resources?query=value`
Example:
- 1. `http:localhost:4000/api/v1.0.0/auth/login`
- 2. `http:localhost:4000/api/v1.0.0/job-requests?clientId=8fue83n29rdks...`

For APIs that are versioned. We will improve this as we progress.

Cheers!!!


### ====================================================  Framework Readme  =================================================
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
## Deployment to AWS lambda

It is super simple to deploy your application. These are the following requirements:
- Git
- Docker

Below are the steps:

1. Create environment override file based on `env/Makefile.override.example`. For instance, if you want to deploy to dev environment, you will need to create a environment override file called `Makefile.override.dev`.

2. Have all those variables in place.

3. Initialize tools.

```bash
$ make tools
```

4. Deploy app to lambda. NOTE: You only need to run this everytime you have a new commit. Above steps are simply one time setup.
```bash
$ make deploy
```

NOTE: You only need to run `make tools` once to initialize toolings. Basically, it creates a docker image with required tools and you are good to go.


## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
