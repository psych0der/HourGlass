import React from 'react';
import ReactDOM from 'react-dom';
import { shallow, mount } from 'enzyme';
import TimeTrackRow from './index';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <TimeTrackRow
      timeTrackData={{ date: '2018-12-12', duration: 2, note: 'aaa' }}
      preferredWorkingHoursPerDay={2}
    />,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
