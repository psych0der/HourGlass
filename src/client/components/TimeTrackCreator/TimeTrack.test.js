import React from 'react';
import ReactDOM from 'react-dom';
import { shallow, mount } from 'enzyme';
import TimeTrackCreator from './index';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <TimeTrackCreator timeTrackCreationState={{ status: 'IN_PROGRESS' }} />,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
