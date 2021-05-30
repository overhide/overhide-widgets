<p align="center"><a href="https://overhide.io"><img src="./.github/logo.png" width="200px"/></a></p>

<p align="center"><a href="https://overhide.io">overhide.io</a></p><p style="width: 500px; margin: auto">A free and open-sourced (mostly) ecosystem of widgets, a front-end library, and back-end services &mdash; to make addition of "logins" and "in-app-purchases" (IAP) to your app as banal as possible.</p>

<hr/>

# overhide widgets

## Quick Start

## Distributable

> **⚠ Why is it so big?** 
>
> We depend on [web3.js](https://github.com/ethereum/web3.js/) which has bloat issues:
>
> https://github.com/ChainSafe/web3.js/issues/1178
>
> As soon as that gets resolved, this distro will be smaller.

The *overhide-widgets* 'dist' folder contains the distributable artifact.

You'll likely want to [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) the library along with its dependencies ([ledgers.js](https://www.npmjs.com/package/ledgers.js), [web3.js](https://github.com/ethereum/web3.js/)).

Within your front-end projects; using *npm* simply:  `npm install overhide-widgets --save-prod`.

#### Enabling with Token

APIs abstracted by *overhide-widgets* require a bearer-token.  The `token` (above) is passed in to `enable` the rest of the library's functionality.  `oh$.enable(..)` can be called every so often with a refreshed token.

A token can be retrieved with a `GET /token` call (see https://token.overhide.io/swagger.html).

To retrieve tokens please first register for your own API key at https://token.overhide.io/register.

## CDN

You can include *overhide-widgets* via CDN:

* `https://cdn.jsdelivr.net/npm/overhide-widgets/dist/overhide-widgets.js`

For a specific version, e.g. version *2.1.4*: `https://cdn.jsdelivr.net/npm/overhide-widgets@1.0.0/dist/overhide-widgets.js`

The widgets can then be used in your DOM and via your framework JavaScript.

### Local Development

#### Back-End

The [./demo-back-end](./demo-back-end) folder has all the code for the back-end, whether it runs using node locally on your development machin or as an [Azure Function](https://azure.microsoft.com/en-us/services/functions/) (how the demos are hosted).

To start running the back-end on your local development machine:

1. prerequesites:
   - node
1. open a console to the [./demo-back-end](./demo-back-end) subfolder of this repo
1. `npm install`
1. `npm run dev`

The backend is now running.

You can try hitting it with http://localhost:8100/GetSchedule -- this is the demo's fees schedule.

Alternativelly, if you want to leverage the [Azure Function](https://azure.microsoft.com/en-us/services/functions/) core tooling:

1. prerequesites:
   - node
   - Azure Functions core tools:  `npm install -g azure-functions-core-tools@3 --unsafe-perm true`
1. open a console to the [./demo-back-end](./demo-back-end) subfolder of this repo
1. `npm install`
1. `func start`


> ASIDE: deploying to [Azure Function](https://azure.microsoft.com/en-us/services/functions/):
>
> if you followed the latter, just deploy using:
>
> ```
> az login
> func azure functionapp publish <function name>
> ```
>
> Then you can hit the functions in Azure, for example, for my name of `demo-back-end` we have:  https://demo-back-end.azurewebsites.net/api/getschedule.