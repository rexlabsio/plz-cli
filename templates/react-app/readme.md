# {{TITLE_NAME}}

## Quick Resources

Some good resources if you have any problems getting started or questions on the way.

- [Vivid Frontend Guide](https://vivid.surge.sh/)
- [Writing Stories](https://storybook.js.org/basics/writing-stories/)

## Getting started

**Install dependencies**

```shell
$ yarn
```

**Available Commands**

```shell
# General development
$ yarn start                 # starts a development server
$ yarn storybook             # starts a storybook server
$ yarn build                 # bundles the app for production

# Bundle stats
$ yarn build && yarn stats   # get webpack bundle size stats

# Testing
$ yarn test                  # runs all units tests
$ yarn test:watch            # runs unit tests when files change
```

## App Development

### Component Development

Ideally app specific components should be developed in storybook. See `src/.stories.js` to get started. Reasons for this:

- Easy to discover the all components in the app, for later dev consumption & ux improvement
- Snapshots of the stories can serve as regression tests

To open storybook run:

```bash
$ yarn storybook
```

### Theme

Theme specific information should all be stored in `src/theme/*.js`.

The centralisation of significant styling variables makes sure we can change values across the whole project at a moments notice. It also serves as an early warning if we have too many different values for certain theme variables, like 1,000,000 shades of grey 😉.

Information that we want to store in theme variables include:

- Colors
- Spacings / Paddings
- Shadows
- Border Radii
- Font weights and predefined text styles

Global styles and the css resets, which are visual primitives, are stored in the theme module for the same centralisation reason.

#### Component Style Overrides

Overriding styles of Components written with `element-styles` should be done in `src/theme/components.js`. They are passed into the App & Stories with the `StyleProvider` component.

In some cases, you may want to add an addition `StyleProvider` component lower in the React tree, to change the styles of unique UI composed of one or more `element-styles` written Components.

### Data Models (API Data)

To connect the app with the API, we use [`model-generator`](https://vivid.surge.sh/data/model-generator/) in the frontend. Please read the docs if you want to know more about it in detail, but here are some key things:

- Models are kept under `src/data/*`
- You can use the `withQuery` HOC to connect a component to specific API data. You can also use multiple HOCs if needed. Model generator will take care of building proper API requests, contributing the data to all components as needed and garbage collection once no component is consuming the data anymore...
- `withValueList` is a HOC specifically designed for value lists, meaning it will keep the data around because we don't expect value lists to change frequently
- If you have special business logic in a lot of places when connecting to the API, you can create app specific abstractions (usually as HOC built on the model generator HOCs) in `src/containers/*`.

### Routing (👩‍🔬 experimental)

We created a new library [`whereabouts`](https://github.com/rexlabsio/vivid/tree/master/modules/whereabouts) (including some react helpers in [`react-whereabouts`](https://github.com/rexlabsio/vivid/tree/master/components/react-whereabouts)). Both libraries are still in an early stage and will be added as the default library once proven to be stable.

### Forms

We also have a new [form abstraction](https://github.com/rexlabsio/vivid/tree/master/components/form) as work in progress, that is built on top of [`formik`](https://github.com/jaredpalmer/formik). More details to be added once the new abstraction has been tested 😊

### Webpack Aliases (and general configs)

The following aliases are set up by default:

```bash
src      → src
data     → src/data
view     → src/view
utils    → src/utils
assets   → src/assets
config   → src/config.js
store    → src/store.js
```

If you want to add more aliases or adjust any other kind of webpack or babel settings, you can [override the defaults with your custom configuration](https://github.com/rexlabsio/vivid/tree/master/modules/plz-cli#configuration).

## Legal

Copyright (c) {{YEAR}} Rex Software All Rights Reserved.
