/*
|-------------------------------------------------------------------------------
| Storybook Heidi Addon
|-------------------------------------------------------------------------------
|
| This is a combination of the @storybook/addon-info and storybook-readme
| addons. Each render their content in different panes - this coupling makes
| sure they're kept together.
|
*/

const React = require('react');
const { Component, createElement: h } = React;
const PropTypes = require('prop-types');
const withInfo = require('@storybook/addon-info').withInfo;
const setInfoOptions = require('@storybook/addon-info').setDefaults;
const GithubMarkdown = require('storybook-readme/components/markdown').default;

// Setup info addon dependency
setInfoOptions({
  inline: false,
  header: true,
  source: true,
  propTables: [],
  maxPropsIntoLine: 3,
  maxPropObjectKeys: 3,
  maxPropArrayLength: 3,
  maxPropStringLength: 50
});

/*
| The addon uses Provider / HOC architecture to share readme's across individual
| stories.
|
*/

class ReadmeInfoProvider extends React.Component {
  getChildContext () {
    return {
      '@@heidi-sb-addon': {
        readme: this.props.readme
      }
    };
  }
  render () {
    return this.props.children;
  }
}

ReadmeInfoProvider.childContextTypes = { '@@heidi-sb-addon': PropTypes.object };

function withReadmeInfo (WrappedComponent) {
  class WithReadmeInfo extends React.Component {
    render () {
      const addonCache = this.context['@@heidi-sb-addon'] || {};
      const { readme } = addonCache;
      const { desc } = this.props;
      return h(
        WrappedComponent,
        Object.assign({}, this.props, { readme, desc }),
        this.props.children
      );
    }
  }
  WithReadmeInfo.contextTypes = { '@@heidi-sb-addon': PropTypes.object };
  return WithReadmeInfo;
}

const ReadmeContainer = props =>
  h('div', {}, [
    !props.desc
      ? null
      : h(
        'p',
        {
          key: 'desc',
          style: { color: 'rgb(68, 68, 68)', fontSize: '15px' }
        },
        props.desc
      ),
    h(
      'h1',
      {
        key: 'header',
        style: {
          margin: '20px 0px 0px',
          padding: '0px 0px 5px',
          fontSize: '25px',
          borderBottom: '1px solid rgb(238, 238, 238)'
        }
      },
      'Readme'
    ),
    h(
      'div',
      {
        key: 'readme',
        style: {
          boxShadow: 'rgba(0, 0, 0, 0.05) 0px 2px 3px',
          border: '1px solid rgb(238, 238, 238)',
          padding: '2px 15px',
          marginTop: 15
        }
      },
      props.children
    )
  ]);

const REMOVALS = [
  // Top Header
  /#(?!#).*\n/,
  // We don't care about the rest of the readme
  /## (Legal|Development)(.*\n)*/gm
];

const memoizeSingle = fn => {
  let cache = null,
    lastArg = null;
  return (arg, ...args) => {
    if (arg !== lastArg) {
      lastArg = arg;
      cache = fn(arg, ...args);
    }
    return cache;
  };
};

class MarkdownWrapper extends Component {
  constructor () {
    super();
    this.getReadme = memoizeSingle(
      readme =>
        typeof readme === 'string'
          ? REMOVALS.reduce((x, r) => x.replace(r, ''), readme)
          : null
    );
  }
  render () {
    const readme = this.getReadme(this.props.readme);
    return h(
      ReadmeContainer,
      { desc: this.props.desc },
      !readme ? null : h(GithubMarkdown, { key: 'readme', source: readme })
    );
  }
}

const Markdown = withReadmeInfo(MarkdownWrapper);

const heidiAddon = {
  addStory ({ name, story, props = [], propsExclude = [], description, desc }) {
    if (!Array.isArray(props)) {
      throw new Error(
        'Cannot display propTypes for story. Expected to be provided a collection of component\'s.'
      );
    }
    const markdown = h(Markdown, { desc: desc || description });
    const options = {
      text: markdown,
      propTables: props,
      excludePropTypes: propsExclude
    };
    return heidiAddon.isStoryShot // Info addon add's alot of DOM noise.
      ? this.add(name, story)
      : this.add(name, withInfo(options)(story));
  },
  /**
   * Aligns the story with a grid and container styles.
   * @param {{ styles, isCentered, hasGrid }} options
   */
  alignStories (options = {}) {
    const { styles, isCentered = true, hasGrid = true } = options;
    const s = {
      container: {
        display: 'flex',
        position: 'absolute',
        padding: 10,
        top: 30,
        bottom: 5,
        left: 5,
        right: 5
      },
      centered: {
        justifyContent: 'center',
        alignItems: 'center'
      },
      grid: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 7px, rgba(0, 0, 0, 0.05) 1px, transparent 8px),
          repeating-linear-gradient(90deg, transparent, transparent 7px, rgba(0, 0, 0, 0.05) 1px, transparent 8px)`,
        backgroundSize: '10px 10px',
        borderRadius: '0 0 4px 4px',
        border: 'solid 1px rgba(0, 0, 0, 0.05)'
      }
    };

    this.addDecorator(child => {
      const component = h('div', { style: styles }, child());
      return h(
        'div',
        {
          style: Object.assign(
            {},
            s.container,
            isCentered ? s.centered : {},
            hasGrid ? s.grid : {}
          )
        },
        component
      );
    });
  }
};

const withReadme = readme => child =>
  h(ReadmeInfoProvider, { readme }, child());

module.exports = {
  heidiAddon,
  withReadme
};
