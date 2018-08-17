import React from 'react';
import ReactDOM from 'react-dom';
import { shallow, mount } from 'enzyme';
import UserRow from './index';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <UserRow userData={{ name: 'Mayank', role: 'super-admin' }} />,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
