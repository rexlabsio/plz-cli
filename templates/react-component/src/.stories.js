import React from 'react';
import {{PASCAL_NAME}} from './';

export default ({ storiesOf }, { knobs })  => {
  storiesOf('{{PASCAL_NAME}}',)
    .alignStories()
    .addStory({
      name: 'default',
      desc: 'Default state of {{PASCAL_NAME}}.',
      // Add aditional component's here, if applicable, to show their props.
      props: [],
      story: () => {
        return (
          <{{PASCAL_NAME}}>
            Hello World!
          </{{PASCAL_NAME}}>
        );
      }
    });
}
