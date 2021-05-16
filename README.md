<p align="center"><a href="https://overhide.io"><img src="./.github/logo.png" width="200px"/></a></p>

<p align="center"><a href="https://overhide.io">overhide.io</a></p><p style="width: 500px; margin: auto">A free and open-sourced (mostly) ecosystem of widgets, a front-end library, and back-end services &mdash; to make addition of "logins" and "in-app-purchases" (IAP) to your app as banal as possible.</p>

<hr/>

# overhide widgets

## Quick Start

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