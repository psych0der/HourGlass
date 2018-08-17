import React from 'react';
import ReactDOM from 'react-dom';
import { shallow, mount } from 'enzyme';
import LoaderButton from './index';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<LoaderButton />, div);
  ReactDOM.unmountComponentAtNode(div);
});
