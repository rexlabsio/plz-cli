# {{TITLE_NAME}}

## Quick Resources

- [Vivid Frontend Guide](https://vivid.surge.sh/)
- [Writing Stories](https://storybook.js.org/basics/writing-stories/)

## Getting started

**Install dependencies**

```shell
$ yarn
```

**Available Commands**

```shell
$ yarn start              # starts a development server
$ yarn storybook          # starts a storybook server
$ yarn test               # runs all units tests
$ yarn test:watch         # runs unit tests when files change
$ yarn build              # bundles the app for production
```

## Component Development

See `src/.stories.js` to get started.

Components should always, when possible, be developed in Storybook.

- Easy to discover the all components in the app, for later dev consumption & ux improvement.
- Snapshots of the stories can serve as regression tests.

## App Development

### Data Models (API Data)

[Modelling API Data](https://vivid.surge.sh/data/model-generator/) for the frontend, and how those model's interop with the rest of our behavioural and ui code, falls to [`@rexlabs/model-generator`](https://www.npmjs.com/package/@rexlabs/model-generator).

1. Models are kept under `src/data/`
2. Models are connected to Components with HOC's from `@rexlabs/model-generator`.
  * `@withModel(model[, namespace])`
    Most generic decorator that takes any model and sets the redux connect up accordingly. The optional namespace
  * [Entities](https://vivid.surge.sh/data/model-generator/connectors/entities.html)
    * `@withEntityList(model[, uuid, args, namespace])`
      Connects to given model and automatically loaded list from API (if not already available in redux store)
    * `@withEntity(model[, id, namespace])`
      Same for single items. `id` can be either a static value or a function, that will receive the components props as first argument
  * [Value Lists](https://vivid.surge.sh/data/model-generator/connectors/value-lists.html)
    * `@withValueLists(model)`
      Simply connects the given value list to the component (to `this.props.valueLists.x` and loads data from API if not already available in store
3. More model connectors should be added to `src/containers/`.

## Legal

Copyright (c) {{YEAR}} Rex Software All Rights Reserved.
