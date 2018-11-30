## HourGlass

[![Build Status](https://travis-ci.org/psych0der/HourGlass.svg?branch=master)](https://travis-ci.org/psych0der/HourGlass)

# Sample time management app using React.js and Node.js

> This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app)
> since it provides simple and battle-tested boilerplate with many goodies built in. However, this is an ejected version
> as I wanted some features not available by default
> For backend I have used NodeJS with MongoDB as data storage

---

**API docs**: [https://psych0der.github.io/HourGlass/](https://psych0der.github.io/HourGlass)</br>
**Demo**: [https://hourglass.surge.sh/](https://hourglass.surge.sh/)

# Table of contents

- [Table of contents](#table-of-contents) - [Usage](#usage) - [Modifications done on create-react-app boilerplate](#modifications-done-on-create-react-app-boilerplate) - [Environment variables](#environment-variables) - [Redux](#redux) - [Using Redux DevTools](#using-redux-devtools) - [Fetch](#fetch) - [Storybook](#storybook) - [Application source code](#application-source-code) - [Configs](#configs)

---

#### [Usage](#usage)

**This project uses node version 8. It is advisable to use [nvm](https://github.com/creationix/nvm). Project root contains `.nvmrc` file.**

- Copy requirement file from .env.sample `cp .env.sample .env`
- Install dependencies: `yarn install`
- Start backend development server: `yarn run start-dev-server`
- Start frontend development server: `yarn run start-client`
- Create a production build frontend: `yarn run build-client`
- Start backend server in production mode: `yarn run start-prod-server`
- Run client Test cases: `yarn run test`
- Run API Test cases: `yarn run test:integrations`
- Start Storybook development server: `yarn run start-storybook`
- Generate API docs: `yarn docs`
- Build Storybook: `yarn run build-storybook`

---

#### [Modifications done on create-react-app boilerplate](#modifications)

- Added support for CSS-modules. This avoids the major headache of maintaining distinct class names across all the components
- Used Scss instead of CSS, as I feel using a superset of CSS will increase my developer productivity. All the SCSS files are compiled to CSS files only. So in the source code, only CSS files are imported.

  - This decision allows other developers to switch to CSS if they like and the code will look same

- Add [Flow](https://flow.org/) type checking. This allows writing code more confidently.
- Add [Prettier](https://github.com/prettier/prettier) code formatting. I am using VSCode and there's an excellent plugin for prettier that formats code on save
- I have also added a git pre-commit hook using [Husky](https://github.com/typicode/husky) that formats the code before committing it. So that you don't have to use VSCode to get automatic code formatting ;)
- I have added [Redux](https://redux.js.org/) for simple state management. This will also help in standardizing error handling for remote calls. I'll explain this another section.
- Use [React router](https://github.com/ReactTraining/react-router) for declarative routing. Although, we have a single page right now. But why not use a standardized way of creating route paths?

---

#### [Environment variables](#environment-variables)

This project uses environment variables for configurations like HTTP endpoint of the light bulb API. This allows the code to be decoupled from the configuration and configurables to be frozen at build time.
At the build time, this project looks for the .env file in the project root directory. This setup was done by create-react-app automatically while setting up this project. [Look here](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-custom-environment-variables) for more info.
This project contains _.env.sample_ file to describe environment variables required by project. **Don't add any confidential values in this sample file. Original .env file is not checked in git for security reasons.**

> Create a .env file by copying it from .env.sample before running this project [`cp .env.sample .env`]

---

#### [Redux](#redux)

I have used REDUX for state management. This allows for a single source of truth about application state. As there is scope for functionality addition which will require the state to be maintained at the application level, this is good to have added in this project.
Specifically, I have added REDUX for having a central and out of the box support for error handling of network requests. As all network requests have 3 states, namely in-progress, success, and failed, having a REDUX middleware at the application level that will handle all network calls allows to write error handling logic only once and the listen for different states to update UI.
Whenever a remote call is made, it has to be done through REDUX action creators, which will dispatch the relevant actions on a state change of network call.

#### [Using Redux DevTools](#using-dev-tools)

[Redux Devtools](https://github.com/gaearon/redux-devtools) is enabled by default in development.

- <kbd>CTRL</kbd>+<kbd>H</kbd> Toggle DevTools Dock
- <kbd>CTRL</kbd>+<kbd>Q</kbd> Move DevTools Dock Position
- see [redux-devtools-dock-monitor](https://github.com/gaearon/redux-devtools-dock-monitor) for more detailed information.

If you have the
[Redux DevTools chrome extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) installed it will automatically be used on the client-side instead.

DevTools are not enabled during production.

#### [Fetch](#fetch)

I have used new [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) API for network calls in this project instead of AJAX. Since Fetch is a relatively newer API, it is not supported on older browsers.
To overcome this limitation a [polyfill](https://www.npmjs.com/package/whatwg-fetch) for Fetch has been used. This just wraps older XMLHttp method in Promise and exposes interface similar to native Fetch.
Please note that this does not simplify or modify the interface that of native Fetch. It just adds support for older browsers.

---

#### [Storybook](#storybook)

[Storybook](https://github.com/storybooks/storybook) is a UI development and testing library. I have integrated storybook as this will provide required support
for developing new UI components. To run storybook, type this command -> `yarn run storybook`, and it will run a development server
for the storybook. For more options visit the link mentioned above.

The storybook configuration will load files with extension `.stories.js` inside the src directory.

---

##### [Application source code](#aps)

- All of the application source resides inside `src` directory.
- All Redux related code is inside `src/redux`
  - Reducers should reside in `src/redux/reducers`
- Containers/Stateful components should have a directory inside `src/client/containers`. Expose the default container using index.js file inside the folder
- Dumb/fully controlled components should have a directory inside `src/client/components/`
- Server code resides in `src/server`
  - Routes are defined in `src/server/api/routes`
  - Models are defined in `src/server/api/models`
  - Controllers are defined in `src/server/api/controllers`
  - Validators are defined in `src/server/api/validators`
- All the static assets used by components/containers should be contained inside their respective directories. This is done to isolate their assets and dependencies
- Each component/container should contain their .story.js and .test.js files inside their directories

##### [Configs](#configs)

All webpack related configs, and polyfills reside inside `config` directory

---
