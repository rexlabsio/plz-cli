import React from 'react';

export default ({ storiesOf }, { knobs, action }) => {
  storiesOf('Example')
    .alignStories()
    .addStory({
      name: 'default',
      description: '',
      story: () => <h1>Foo Bar</h1>
    });
};
