# :pray: plz

<p align="center">CLI toolkit for frontend web dev @ rexlabs, enabling you to:</p>

<div align="center"><strong>create</strong> :clap:</div>
<p align="center"><em>Generate new apps and npm packages!</em></p>

<div align="center"><strong>develop</strong> :raised_hands:</div>
<p align="center"><em>Preview UI with <u>Webpack Dev Server</u> and <u>Storybook</u>!</em></p>

<div align="center"><strong>test</strong> :ok_hand:</div>
<p align="center"><em>Run tests with <u>Jest</u> and <u>Storyshot</u>!</em></p>

<div align="center"><strong>bundle</strong> :wave:</div>
<p align="center"><em>Build distributions with <u>Babel</u> and <u>Webpack</u>!</em></p>

### Rationale

> _Oh geez, another front dev tool... **wrong!**_  
> This is a kit of tools - it says so in the first sentence. It is 💯 gud.

Frontend development is filled to the brim with open source tools like webpack, babel, jest and storybook. As great as they are, they're difficult to configure, don't play nice together, and each new tool introduces learning curves. Boo.

Rather than we all struggling through the pains of configuration setup and maintenance, in each app and package we build @ rexlabs, we invest all that tooling focus into `plz`.

It (`plz` 🙏) can sit in front of these tools, with a bunch of sane default configurations and hacks, to then be consistently employed in our projects.

Devs are given the opportunity to forget about tooling woes, freeing their minds for better tasks. What a pleasant experience!

## Usage

`$ plz help`

<!-- help-content -->
```text
Commands:
  create <name> [root-dir]  Generates a project called `@rexlabs/<name>`.
  test [options]            Starts a test runner in current directory.
  stories                   Starts a storybook for UI components.
  serve                     Starts an dev server for the project.
  build                     Bundles a project for distribution.
  clean                     Removes previously built files.
  help                      Shows this help message.

Help:
  --help, -h  Show help                                                [boolean]
  --help-all  Show all help                                            [boolean]

Options:
  --version, -v  Show cli version number                               [boolean]

Run `plz help <command>` for more info & options.
```
<!-- /help-content -->

### Create a new Project

```shell
plz create my-new-component
```

This will generate a new project in a folder called `my-new-component`.

##### Project Types

To change the type of project, use `--project-type`.

- **`react-component`**
- **`react-app`**
- **`module`**

> _Defaults to `react-component` project type._

### Start Development

_[http://localhost:3000](http://localhost:3000)_

#### App

```shell
plz serve
```

This will start a [Webpack][webpack] Dev Server with hot module replacement enabled, rebuilding your project on file changes.

#### Components

```shell
plz stories
plz stories --output-dir=./storybook-build
```

This will start a [Storybook][storybook] server, loading the `src/.stories.js` module. It can also be run from the root of a monorepo to load stories from each component package.

### Running Tests

```shell
plz test
plz test --watch
```

This will start [Jest][jest], the Painless Test Runner™. It will look for files under `__tests__` anywhere in the project.

#### Components

`__tests__/storyshots.js`
```js
import plz from '@rexlabs/plz-cli';
plz.initStoryshots();
```

Components that have stories can use [Storyshot][storyshot] to snapshot the renders.

### Bundling Projects

```shell
plz build
```

This will use [Babel][babel] or [Webpack][webpack], depending on the project type, to bundle the source of the project into browser-ready assets.

## Configuration

Config for the `plz` 🙏 cli is resolved from established configuration files [like other cli tools][cosmiconfig].

* The `plz` property in `package.json` file
* The `.plzrc` file _(optionally with `.json`, `.yaml`, `.js` extensions)_
* The `.plz.config.js` file

### Available Options

| Config Field | Description |
| :------------- | :------------- |
| `projectType` | One of the follow types:<br/>`react-app`, `react-component`, `react-module` |
| `buildDir` | The location of your project's build output.<br/><br/>For apps this is `public/`.<br/><br/>For modules this is at the root because modules output several bundle directories of their own:<br/><ul><li>`lib` (cjs)</li><li>`module/` (esm)</li></ul> |
| `runtimeCompilation` | When enabled, packages found in `node_modules/` that have a `package.json` `plz:main` field will be compiled & watched with Babel. |
| `storybook` | All options for Storybook's runtime. _See [@storybook/addon-options][storybookoptions] for more details._<br/><br/><blockquote>Additionally, `babel` and `webpack` properties can will defined, following the rules of the other config middleware.</blockquote> |
| `babel` | Middleware for the [Babel config][babelconfig] of the project. See the [Example Config](#example-config) for more details. |
| `webpack` | Middleware for the [Webpack config][webpackconfig] of the project. See the [Example Config](#example-config) for more details. |

### CLI Arguments

Additionally, all config options can be overridden with cli args.

```shell
# Force the "react-app" configuration
plz build --project-type "react-app" --build-dir "./public"

# Change storybook nested configs
plz stories --storybook-show-down-panel
```

### Example Config

`.plzrc.js` or `plz.config.js`

```js
module.exports = {
  projectType: "react-app",
  buildDir: './app-build',
  runtimeCompilation: true,
  storybook: {
    url: ,
    goFullScreen: false,
    showLeftPanel: true,
    showDownPanel: true,
    showSearchBox: false,
    downPanelInRight: true,
    sortStoriesByKind: false
  },
  babel: (babelConfig) => {
    // ...transform the config if required!
    return transformedBabelConfig;
  },
  webpack: (webpackConfig) => {
    // ...transform the config if required!
    return transformedWebpackConfig;
  }
}
```

## Contributing

### Structure

**`index.js`**  
_Start of CLI_

**`src/commands/`**  
_Bulk of CLI logic is here, taking different paths for differing project types._

**`src/configs/`**  
_All the configuration for underlying tools._

### Testing

```shell
# Watch for changes, rerunning tests
$ yarn test:watch

# Run watch once
$ yarn test
```

### Re-generating cool ASCII logo

```shell
# The logo should be pasted to src/utils/index.js
yarn ascii | clipcopy
```

### Inject up-to-date usage in `readme.md`

```shell
# The usage info is injected into the readme
yarn update-readme
```

[storybook]: https://storybook.js.org
[storybookoptions]: https://github.com/storybooks/storybook/tree/master/addons/options
[storyshots]: https://github.com/storybooks/storybook/tree/master/addons/storyshots
[webpack]: https://webpack.js.org
[webpackconfig]: https://webpack.js.org/configuration/
[jest]: https://facebook.github.io/jest
[babel]: https://babeljs.io
[babelconfig]: https://babeljs.io/docs/usage/api/
[cosmiconfig]: https://github.com/davidtheclark/cosmiconfig
