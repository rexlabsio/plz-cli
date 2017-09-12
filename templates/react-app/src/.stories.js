import React from 'react';

export default ({ storiesOf }, { knobs, action }) => {
  storiesOf('{{TITLE_NAME}}')
    .addStory({
      name: 'default',
      description: '',
      story: () => <h1>Foo Bar</h1>
    })
};
