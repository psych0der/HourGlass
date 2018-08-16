// @flow
import React from 'react';
import { Route } from 'react-router-dom';
import Routes from '../../Routes';
import { Link } from 'react-router-dom';
import { Navbar } from 'react-bootstrap';
import './index.css';
// import Home from '../Home';

type Props = {};
type State = {};

export class App extends React.Component<Props, State> {
  render() {
    return (
      <div className="App container">
        <Navbar collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">HourGlass</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
        </Navbar>
        <Routes />
      </div>
    );
  }
}

export default App;
