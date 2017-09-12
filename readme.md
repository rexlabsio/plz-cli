<!-- ![](http://i.imgur.com/tRdw03U.png) -->

# plz cli

**Toolkit for generating, building & testing projects.**

It consolidates:
1. Generating new packages & apps.
2. Configuring build pipelines. _eg. Webpack, Babel_
3. Configuring and running unit & integration tests. _eg. Jest + Babel_
4. Starting a development server for UI components & Apps. _eg. Storybook, Dev Server_

## Usage

```shell
$ plz <command> [options]

# CLI help
$ plz help

# Usage for individual commands
$ plz help <command>
```
## Commands

##### `create <name> [--root-path=<pwd>] [--type=<react-component>]`

Generates a package called `@rexsoftware/<name>`.

> _Uses scaffold templates found in `templates/`. Defaults to `react-component` template._

Can create:

- **`react-component`**
- **`react-app`**
- **`module`**

##### `test [options]`
Starts a test runner in current directory.

> _Uses the `jest` test runner._

##### `stories`
Starts a storybook for UI components.

> _Uses the `storybook` tool._

##### `build`
Bundles the package/app for distribution.

> _Uses the `nwb` toolkit._

##### `serve`
Starts a demo for UI components, or a dev server for an App.

> _Uses the `nwb` toolkit._

##### `clean`
Removes previous build files.

> _Uses the `nwb` toolkit._

##### `help`
Shows the help message.

## Configuration

`package.json`
```js
{
  "config": {
    "plz": {
      // Enable compiling deps that have the "plz:main" field
      "runtimeCompilation": true,
      // Config for @storybook/addon-options
      "storybook": {
        "url": "",
        "goFullScreen": false,
        "showLeftPanel": true,
        "showDownPanel": true,
        "showSearchBox": false,
        "downPanelInRight": true,
        "sortStoriesByKind": false
      }
    }
  }
}
```

## Rationale

The CLI is largely a facade around other tools:
- nwb, by insin         (module bundler)
- jest, by facebook     (test runner)
- storybook, by kadira  (ui testing environment)

But, by creating a facade around these tools we can:
- Avoid forcing developer to learn & remember individual tools until they're required to.
- Replace the tools without changing the front-facing API of plz cli
- Optimise package's output over time, without costly refactors in every package

## Contributing

> **Modifying dependencies!**  
>   
> Dependencies are managed are the root of the project by `lerna`.
>   
> 1. Add/remove a dependency in package.json manually
> 2. In the root of heidi, run `yarn install-deps`

### Structure

Start by looking at `index.js`.

The bulk of logic are in the individal command files, in `src/commands/`.
Commands can follow different code paths for different package types.

Configuration for the internal tools can be found under `src/configs/`.

### Testing

```shell
# Watch for changes, rerunning tests
$ yarn test:watch

# Run watch once
$ yarn test
```

### Re-generating cool ASCII logo

```shell
# Prints the name given to the cli 'bin' in package.json
node ./support/generate-ascii-logo.js
```
