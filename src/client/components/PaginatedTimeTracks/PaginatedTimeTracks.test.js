import React from 'react';
import ReactDOM from 'react-dom';
import { shallow, mount } from 'enzyme';
import PaginatedTimeTracks from './index';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <PaginatedTimeTracks
      listTimeTracks={{ status: 'IN_PROGRESS' }}
      fetchTimeTrackList={() => {}}
      history={{}}
      match={{}}
      location={{}}
      userId="12"
      userInfo={{ status: 'IDLE' }}
      fetchUserInformation={() => {}}
    />,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
