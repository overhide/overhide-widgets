<p align="center"><a href="https://overhide.io"><img src="https://overhide.github.io/overhide-widgets/assets/logo.png" width="200px"/></a></p>

<p align="center"><a href="https://overhide.io">overhide.io</a></p><p style="width: 500px; margin: auto">A free and open-sourced (mostly) ecosystem of widgets, a front-end library, and back-end services &mdash; to make addition of "logins" and "in-app-purchases" (IAP) to your app as banal as possible.</p>

<hr/>

# overhide widgets

Customizable web-components enabling login and in-app purchases (IAP, paid up-sells) for any Web application to be as simple as possible.

The web-components are backed by the [legers.js library](https://www.npmjs.com/package/ledgers.js) in the browser and [renumeration APIs](https://overhide.io/2020/09/06/remuneration-api.html) to allow IAP in US dollars, ethers, and bitcoins (easily extensible to other cryptos).

Everything is open-source except for the US dollar microservice.

The authentication and authorization mechanism used herein is the [Ledger-Based Authorizations](https://overhide.io/2019/03/20/why.html): crypto authorization concepts abstracted out for use with US dollars and any ledger based currency.



How simple is it to put IAPs in your Web application?  Check out this "simplest" [demo](https://overhide.github.io/overhide-widgets/demo-front-end/simplest.html) ([code](/demo-front-end/simplest.html)) &mdash; it's essentially:

```
<html>

    ...

    <script>
      window.addEventListener('overhide-appsell-sku-clicked',(e) => { /* react to feature being used, only if, auth'ed */ });
    </script>

    <overhide-hub id="hub" apiKey="0x___API_KEY_ONLY_FOR_DEMOS_AND_TESTS___" isTest></overhide-hub>      

    <overhide-login hubId="hub"
                    overhideSocialMicrosoftEnabled
                    overhideSocialGoogleEnabled
                    overhideOhledgerWeb3Enabled
                    overhideEthereumWeb3Enabled
                    overhideBitcoinEnabled
                    overhideLedgerEnabled>
    </overhide-login>

    <overhide-appsell hubId="hub" 
                      sku="2-dollar-feature"
                      priceDollars="2"
                      authorizedMessage="Use Feature"
                      unauthorizedTemplate="Add Feature ($${topup})"
                      bitcoinAddress="tb1qr9d7z0es86sps5f2kefx5grpj4a5yvp4evj80z"
                      ethereumAddress="0x046c88317b23dc57F6945Bf4140140f73c8FC80F"
                      overhideAddress="0x046c88317b23dc57F6945Bf4140140f73c8FC80F">
    </overhide-appsell>
    
    ...
    
</html>
```



Just the above three web-components in an HTML page is all that's needed for the simplest authentication and authorization scenarios &mdash; allowing you to get paid ($2 in the above sample).  The components use the [legers.js library](https://www.npmjs.com/package/ledgers.js) library and [renumeration APIs](https://overhide.io/2020/09/06/remuneration-api.html) to provide all functionality.

Now, of course, the simplest example above doesn't use a back-end and all code sits fully decompilable in the browser.  It's useful for some scenarios, but for other scenarios you will want to [re-check authorizations in your back-end code and have feature-flows run through a back-end](https://overhide.io//2019/03/27/authorizations-and-exposed-source-code.html).

Most demos in this repo use feature-flows through a simple back-end that's provided as the [/demo-back-end](/demo-back-end) node.js application &mdash; that also runs in [Azure functions](https://azure.microsoft.com/en-us/services/functions/).  You can base your own back-end off of these samples, it's very little code.



The below infographic conveys at-a-glance what you get with these widgets:

<p align="center"><a href="https://overhide.github.io/overhide-widgets/assets/widgets.svg" target="_blank"><img src="https://overhide.github.io/overhide-widgets/assets/widgets.svg" width="75%"/></a></p>

The top-left shows a sample Web app with a nav-bar housing the [overhide-status](#overhide-status) component.

## Quick Start

To use these widgets in your Web app follow the steps below.

Don't just read these steps, follow along copying/looking-at the [demos](#demos).

The first three steps are gathering metadata necessary to setup how you get paid.

The reminder of the steps are actual code changes in your Web application.



1. onboard onto the dollar-ledger to get your US-dollar-ledger address ([production](https://ledger.overhide.io/onboard) | [testnet](https://test.ledger.overhide.io/onboard))

   - optional, you don't need this if you just want to accept cryptos or don't want in-app purchases at all (just authentication)

   - you will create a new [Stripe](https://stripe.com) account or connect your existing [Stripe](https://stripe.com) account
   - you will provide the above address as the *overhideAddress* attribute in all your [overhide-appsell](#overhide-appsell) components

2. onboard onto Ethereum (optional, recommended)

   - use a wallet such as [MetaMask](https://metamask.io/) to generate your credentials
   - you will provide your Ethereum public address as the *ethereumAddress* attribute in all your [overhide-appsell](#overhide-appsell) components

3. onboard onto Bitcoin (optional)

   - use a wallet such as [Electrum](https://electrum.org/#home) to generate your credentials
   - you will provide your Bitcoin public address as the *bitcoinAddress* attribute in all your [overhide-appsell](#overhide-appsell) components

4. pull in the `overhide-widgets.js` component into your app, see [CDN](#cdn).

5. add an [overhide-hub](#overhide-hub) component to your DOM or [initialize programatically](#setting-the-overhide-hub-programatically)

   - configure the *id* attribute if other components will de-reference this hub via their *hubId* attribtues, otherwise you will call the *setHub(..)* explicitly on each of those components from script
   - configure the *token* attribute or *apiKey* (see [Enabling with Token](#enabling-with-token))
   - specify the *isTest* attribute if this is a testnet application, otherwise leave it out

6. add an [overhide-login](#overhide-login) component to your DOM

   - configure the *id* of the [overhide-hub](#overhide-hub) element via the *hubId*, or call this elements's *setHub(..)* setter to set the hub element programatically
   - list all the desired authentication/authorization methods for this application, the various *overhide..Enabled* attributes in [overhide-login](#overhide-login)
     - *overhideSocialMicrosoftEnabled* if you want Microsoft social-login against the US dollar ledger &mdash; must onboard step [1] above and specify *overhideAddress* in your [overhide-appsell](#overhide-appsell) elements
     - *overhideSocialGoogleEnabled* if you want Google social-login against the US dollar ledger &mdash; must onboard step [1] above and specify *overhideAddress* in your [overhide-appsell](#overhide-appsell) elements
     - *overhideOhledgerWeb3Enabled* if you want customers to manage their US dollar ledger credentials with their Ethereum wallet such as [MetaMask](https://metamask.io/)  &mdash; must onboard step [1] above and specify *overhideAddress* in your [overhide-appsell](#overhide-appsell) elements
     - *overhideEthereumWeb3Enabled* if you want to allow payments in ethers for customers with their Ethereum wallet such as [MetaMask](https://metamask.io/)  &mdash; must onboard step [2] above and specify *ethereumAddress* in your [overhide-appsell](#overhide-appsell) elements
     - *overhideBitcoinEnabled* if you want to allow payments in bitcoins for customers with their Bitcoin wallet such as [Electrum](https://electrum.org/#home)  &mdash; must onboard step [3] above and specify *bitcoinAddress* in your [overhide-appsell](#overhide-appsell) elements
     - *overhideLedgerEnabled* if you want user-managed secret-token access against the US dollar ledger &mdash; must onboard step [1] above and specify *overhideAddress* in your [overhide-appsell](#overhide-appsell) elements

7. add an [overhide-appsell](#overhide-appsell) component as an explicit "login" button (non-feature) to your DOM

   1. optional, as the feature buttons can do this work
   2. configure the *id* of the [overhide-hub](#overhide-hub) element via the *hubId*, or call this elements's *setHub(..)* setter to set the hub element programatically
   3. do not provide any [overhide-appsell](#overhide-appsell) attrubutes except for the *hubId* (above) and the *loginMessage*

8. add [overhide-appsell](#overhide-appsell) components to your DOM for each feature

   1. configure the *id* of the [overhide-hub](#overhide-hub) element via the *hubId*, or call this elements's *setHub(..)* setter to set the hub element programatically
   2. provide a unique *sku* attribute per button
   3. provide the desired *priceDollars* attribute, or 0 if setting up a for-free feature
   4. provide the *authorizedMessage* attribute to be displayed when user is already authorized and just needs to click on the feature to enable / use
   5. provide the *unauthorizedTemplate* attribute to be displayed when the user is not yet authorized to use the feature (insufficient funds, not auth'ed)
   6. provide the *overhideAddress* attribute if onboarded for US dollar payments in step [1] above
   7. provide the *ethereumAddress* attribute if onboarded for ethers payments in step [2] above
   8. provide the *bitcoinAddress* attribute if onboarded for bitcoin payments in step [3] above

## Demos

We have several component demo files in [/demo-front-end](/demo-front-end):

- basic:  [demo](https://overhide.github.io/overhide-widgets/demo-front-end/basic.html) | [code](/demo-front-end/basic.html)
- no back-end: [demo](https://overhide.github.io/overhide-widgets/demo-front-end/no-back-end.html) | [code](/demo-front-end/no-back-end.html) (no [back-end](#back-end))
- custom buttons: [demo](https://overhide.github.io/overhide-widgets/demo-front-end/custom.html) | [code](/demo-front-end/custom.html) (see [Customizing](#customizing) section below)
- [/demo-react-app/react-app.html](/demo-react-app/react-app.html)
- simplest:  [demo](https://overhide.github.io/overhide-widgets/demo-front-end/simplest.html) | [code](/demo-front-end/simplest.html) (just one button, no [back-end](#back-end))



Most demos show:

- a nav-bar at the top with an [overhide-status](#overhide-status) web-component flush to the right.
- a login button (which is just an [overhide-appsell](#overhide-appsell) component with a *loginMessage* attribute instead of a *sku*)
- 3 feature buttons ([overhide-appsell](#overhide-appsell) components):
  - free
  - $2 up-sell
  - $3 subscription for 30 minutes

Everything is optional except for the non-visible [overhide-hub](#overhide-hub)  web-component that can be wired via DOM or JavaScript (see the [react-app demo](/demo-ract-app/react-app.html) for JS wiring).

You could just have a single up-sell / in-app purchase button, no status, no explicit login, and it will allow all the functionality (see "simplest"  [demo](https://overhide.github.io/overhide-widgets/demo-front-end/simplest.html) ([code](/demo-front-end/simplest.html)).



The [/demo-front-end/no-back-end.html](/demo-front-end/no-back-end.html) shows the use of these widgets without any back-end &mdash; shows use of widgets with just an API key, the back-end setup can be ignored for this one.  This is OK for some projects, but is less bad-actor proof.  All other demos leverage a back-end.

##### Back-End

Most demos run their feature-flows via our  [/demo-back-end](/demo-back-end): when a user clicks a feature, the back-end is interrogated to complete the feature flow.  The back-end verifies authentication and authorization as per credentials provided and monies paid on a ledger of choice.

The back-end serves three purposes on behalf of our front-ends:

- retrieves [an overhide token](https://token.overhide.io/swagger.html) for use with *overhide* API -- browser can call to get the token and provide to [overhide-hub](#overhide-hub)  component.
- retrieves the fees-schedule (not actually leveraged in demos for simplicity, but provided for completness)
- runs the feature-flows on the back-end when corresponding feature button clicked in the front-end (`/RunFeature` endpoints)
  - has a bunch of mandatory `query` parameters to authenticate and authorize
  - feature will not run if bad authentication or insufficient funds on ledger for feature (as per parameters): will result in "Unauthorized by Ledger-Based AuthZ-" response.

The endpoints for these are discussed in the [Local Development](#local-development) section below.



The [/demo-back-end](/demo-back-end) code runs both as stand-alone *node.js* as well as on  [Azure Functions](https://azure.microsoft.com/en-us/services/functions/) (instructions below in [Local Development](#local-development) section).  

All of the above demos &mdash; with the exception of the *no-back-end* and *simplest* demos &mdash; hit this back-end code as it is stood up at https://demo-back-end.azurewebsites.net/api on Azure; but, it's easy enough to stand-up locally and play around (again, see [Local Development](#local-development) below).

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

APIs abstracted by *overhide-widgets* require a bearer-token.  The `token` is passed in to the `<overhide-hub token="..">` component (see the [overhide-hub](#overhide-hub) component section for details).

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

For a specific version, e.g. version *1.0.5*: `https://cdn.jsdelivr.net/npm/overhide-widgets@1.0.5/dist/overhide-widgets.js`

The widgets can then be used in your DOM and via your framework JavaScript.



In [npm](https://www.npmjs.com/) based app projects, include the components and TypeScript definitions with your `package.json`:

```
"dependencies": {
  ..
  "overhide-widgets": "1.0.5",
  ..
}
```

See [/demo-react-app](/demo-react-app).

## Widget Reference

Below is a reference of the four web-components provided, their attributes, properties, events, and override [slots](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot) for customizing.

### overhide-hub

The *overhide-hub* comopnent is the main glue component of the whole subsystem.  

There can be only one *overhide-hub* shared by all the other components.

Each other component must be provided with an *overhide-hub* either via the DOM or programatically.

##### Setting the *overhide-hub* via DOM

Simply set an ID on the *overhide-hub* component and pass it into the other components as the `hubId` attribute:

```
<overhide-hub id="demo-hub" ...></overhide-hub> 

<overhide-appsell 
  hubId="demo-hub" 
  ...
</overhide-appsell>
```

##### Setting the *overhide-hub* Programatically

Get an instance of the *overhide-hub* component by instantiating in JavaScript (`document.createElement('overhide-hub')`) or grabbing from the *document* (`document.querySelector(..)`).

Provide it into each component using the `setHub(..)` setter via ES6 / TypeScript class.

Take a look at the [javascript-hub demo code](/demo-front-end/javascript-hub.html) ([demo](https://overhide.github.io/overhide-widgets/demo-front-end/javascript-hub.html)).

Here, the components wired into the DOM do not have a `hubId=..` attribute specified.  There is no `<overhide-hub id=..>` component in the template.  Everything is done in the `window.onload`:

```

```

##### Attributes

##### Properties

##### Slots

##### Events

### overhide-login

##### Attributes

##### Properties

##### Slots

##### Events

### overhide-appsell

##### Attributes

##### Properties

##### Slots

##### Events

### overhide-status

##### Attributes

##### Properties

##### Slots

##### Events

### Local Development

#### Target a Back-End

As mentioned in the [Demos](#demos) section, we have several component demo files in [/demo-front-end](/demo-front-end).

Each HTML file has a script constant `BACKEND_CONNECTION_STRING` which points at one of the back-end instances, either:

- https://demo-back-end.azurewebsites.net/api (default)
- http://localhost:8100 (local node.js server)
- http://localhost:7071/api (local AZ function server)

Modify this constant as needed.

#### Run a Demo Back-End

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

### Customizing

The *overhide-status* widget is not customizable.

The *overhide-hub* component is non-visible hence not customizable.

Out of the box the buttons are grey.