<p align="center"><a href="https://overhide.io"><img src="./.github/logo.png" width="200px"/></a></p>

<p align="center"><a href="https://overhide.io">overhide.io</a></p><p style="width: 500px; margin: auto">A free and open-sourced (mostly) ecosystem of widgets, a front-end library, and back-end services &mdash; to make addition of "logins" and "in-app-purchases" (IAP) to your app as banal as possible.</p>

<hr/>

# overhide widgets

Customizable web-components to enable login and paid up-sells / in-app purchases (IAP) for any Web application.

## Quick Start

Quick-study the demos with reference to the steps below, it's all pretty simple.

To use the widgets follow these steps:

1. 

## Demos

We have several component demo files in [/demo-front-end](/demo-front-end):

- basic:  [demo](https://overhide.github.io/overhide-widgets/demo-front-end/basic.html) | [code](/demo-front-end/basic.html)
- no back-end: [demo](https://overhide.github.io/overhide-widgets/demo-front-end/no-back-end.html) | [code](/demo-front-end/no-back-end.html)
- custom buttons: [demo](https://overhide.github.io/overhide-widgets/demo-front-end/custom.html) | [code](/demo-front-end/custom.html) (see "Customizing" section below)
- [/demo-react-app/react-app.html](/demo-react-app/react-app.html)



Each demo shows:

- a nav-bar at the top with an `<overhide-status ..>` web-component flush to the right.
- a login button
- 3 feature buttons:
  - free
  - $2 up-sell
  - $3 subscription for 30 minutes

Everything is optional except for the non-visible `<overhide-hub ..>` web-component that can be wired via DOM or JavaScript (see the [react-app demo](/demo-ract-app/react-app.html) for JS wiring).

You could just have a single up-sell / in-app purchase button, no status, no explicit login, and it will allow all the functionality.



The [/demo-front-end/no-back-end.html](/demo-front-end/no-back-end.html) shows the use of these widgets without any back-end &mdash; shows use of widgets with just an API key, the back-end setup can be ignored for this one.  This is OK for some projects, but is less bad-actor proof.  All other demos leverage a back-end.



The [/demo-back-end](/demo-back-end) code runs both as stand-alone *node.js* as well as on  [Azure Functions](https://azure.microsoft.com/en-us/services/functions/) (instructions below in "Local Development").  

All of the above demos &mdash; with the exception of the *no-back-end* demo &mdash; hit this back-end code as it is stood up at https://demo-back-end.azurewebsites.net/api on Azure; but, it's easy enough to stand-up locally and play around (again, see "Local Development" below).

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

APIs abstracted by *overhide-widgets* require a bearer-token.  The `token` is passed in to the `<overhide-hub token="..">` component (see "The *overhide-hub* Component" section below for details).

The component either takes a `token=".."` retrieved from a back-end (optional) or an `apiKey=".."` provided statically &mdash; less bad-actor proof, but OK for some projects.

Retrieve an API key from https://token.overhide.io/register.

After that, a token can be retrieved with a `GET /token` call (see https://token.overhide.io/swagger.html).

All demos below show one or the other.

## CDN

You can include *overhide-widgets* via CDN:

* `https://cdn.jsdelivr.net/npm/overhide-widgets/dist/overhide-widgets.js`

You can see all the [/demo-front-end/*.html](/demo-front-end) demos load it this way:

```
<script src="https://cdn.jsdelivr.net/npm/overhide-widgets/dist/overhide-widgets.js"></script>
```

For a specific version, e.g. version *2.1.4*: `https://cdn.jsdelivr.net/npm/overhide-widgets@1.0.0/dist/overhide-widgets.js`

The widgets can then be used in your DOM and via your framework JavaScript.



In [npm](https://www.npmjs.com/) based app projects, include the components and TypeScript definitions with your `package.json`:

```
"dependencies": {
  ..
  "overhide-widgets": "1.0.0",
  ..
}
```

See [/demo-react-app](/demo-react-app).

### Local Development

#### Front-End

We have several component demo files in [/demo-front-end](/demo-front-end):

- basic:  [demo](https://overhide.github.io/overhide-widgets/demo-front-end/basic.html) | [code](/demo-front-end/basic.html)
- no back-end: [demo](https://overhide.github.io/overhide-widgets/demo-front-end/no-back-end.html) | [code](/demo-front-end/no-back-end.html)
- [/demo-front-end/custom.html](/demo-front-end/custom.html)
- [/demo-react-app/react-app.html](/demo-react-app/react-app.html)

The [/demo-front-end/no-back-end.html](/demo-front-end/no-back-end.html) shows the use of these widgets without any back-end &mdash; shows use of widgets without a back-end, the back-end setup can be ignored for this one.

Each HTML file has a script constant `BACKEND_CONNECTION_STRING` which points at one of the back-end instances, either:

- https://demo-back-end.azurewebsites.net/api (default)
- http://localhost:8100 (local node.js server)
- http://localhost:7071/api (local AZ function server)

Modify this constant as needed.

#### Back-End

> ⚠ The [/demo-front-end/no-back-end.html](/demo-front-end/no-back-end.html) doesn't use a back-end &mdash; shows use of widgets without a back-end, the back-end setup can be ignored for this one.

The [./demo-back-end](./demo-back-end) folder has all the code for the back-end, whether it runs using node locally on your development machin or as an [Azure Function](https://azure.microsoft.com/en-us/services/functions/) (how the demos are hosted).

To start running the back-end on your local development machine:

1. prerequesites:
   - node
1. open a console to the [./demo-back-end](./demo-back-end) subfolder of this repo
1. `npm install`
1. `npm run dev`

The backend is now running.

You can try hitting it with:

- http://localhost:8100/GetSchedule -- this is the demo's fees schedule.
- http://localhost:8100/GetToken -- provides the [overhide token](https://token.overhide.io/swagger.html) for use with `<overhide-hub ..>` component.
- There is also the main `http://localhost:8100/RunFeature` endpoint is used by the demo front-ends (see [/demo-front-end/index.js](/demo-front-end/index.js)).

Alternativelly, if you want to leverage the [Azure Function](https://azure.microsoft.com/en-us/services/functions/) core tooling:

1. prerequesites:
   - node
   - Azure Functions core tools:  `npm install -g azure-functions-core-tools@3 --unsafe-perm true`
1. open a console to the [./demo-back-end](./demo-back-end) subfolder of this repo
1. `npm install`
1. `func start`

The you can try hitting the local AZ functions with:

- http://localhost:7071/api/GetSchedule -- this is the demo's fees schedule.
- http://localhost:7071/api/GetToken -- provides the [overhide token](https://token.overhide.io/swagger.html) for use with `<overhide-hub ..>` component.
- There is also the main `http://localhost:7071/api/RunFeature` endpoint is used by the demo front-ends (see [/demo-front-end/index.js](/demo-front-end/index.js)).


> ASIDE: deploying to [Azure Functions](https://azure.microsoft.com/en-us/services/functions/): 
>
> if you followed the latter, just deploy using:
>
> ```
> az login
> func azure functionapp publish <function name>
> ```
>
> Then you can hit the functions in Azure, for example, for this demo's name of `demo-back-end` we have:  
>
> - https://demo-back-end.azurewebsites.net/api/getschedule -- this is the demo's fees schedule.
> - https://demo-back-end.azurewebsites.net/api/gettoken -- provides the [overhide token](https://token.overhide.io/swagger.html) for use with `<overhide-hub ..>` component.
> - There is also the main `https://demo-back-end.azurewebsites.net/api/RunFeature` endpoint is used by the demo front-ends (see [/demo-front-end/index.js](/demo-front-end/index.js)).

### Demo Back-End Server

Serves three purposes on behalf of our demo front-ends:

- retrieves [an overhide token](https://token.overhide.io/swagger.html) for use with *overhide* API -- browser can call to get the token and provide to `<overhide-hub ..>`  component.
- retrieves the fees-schedule
- runs the features on the back-end when clicked in the front-end (`/RunFeature` endpoints)
  - has mandatory `query` parameters to authenticate and authorize
  - feature will not run if bad authentication or insufficient funds on ledger for feature (as per parameters): will result in "Unauthorized by Ledger-Based AuthZ-" response.

The endpoints for these are listed in the "Local Development &mdash; Back-End" section above.

### The *overhide-hub* Component

The *overhide-hub* comopnent is the main glue component of the whole subsystem.  

There can be only one *overhide-hub* shared by all the other components.

Each other component must be provided with an *overhide-hub* either via the DOM or programatically.

#### Setting the *overhide-hub* via DOM

Simply set an ID on the *overhide-hub* component and pass it into the other components as the `hubId` attribute:

```
<overhide-hub id="demo-hub" ...></overhide-hub> 

<overhide-appsell 
  hubId="demo-hub" 
  ...
</overhide-appsell>
```

#### Setting the *overhide-hub* Programatically

Get an instance of the *overhide-hub* component by instantiating in JavaScript (`document.createElement('overhide-hub')`) or grabbing from the *document* (`document.querySelector(..)`).

Provide it into each component using the `setHub(..)` setter via ES6 / TypeScript class.

Take a look at the [javascript-hub demo code](/demo-front-end/javascript-hub.html) ([demo](https://overhide.github.io/overhide-widgets/demo-front-end/javascript-hub.html)).

Here, the components wired into the DOM do not have a `hubId=..` attribute specified.  There is no `<overhide-hub id=..>` component in the template.  Everything is done in the `window.onload`:

```

```

### Customizing

The *overhide-status* widget is not customizable.

The *overhide-hub* component is non-visible hence not customizable.

Out of the box the buttons are grey.