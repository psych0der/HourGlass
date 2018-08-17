import React from 'react';
import ReactDOM from 'react-dom';
import { shallow, mount } from 'enzyme';
import UserCreator from './index';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <UserCreator userCreationState={{ status: 'IN_PROGRESS' }} />,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
