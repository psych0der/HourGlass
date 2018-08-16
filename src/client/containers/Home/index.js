// @flow
import React from 'react';
import { Navbar } from '../../components';
import styles from './index.css';
type Props = {};
type State = {};

export class Home extends React.Component<Props, State> {
  state = {};

  render() {
    return (
      <div className="Home">
        <div className="lander">
          <h1>HourGlass</h1>
          <p>A simple time management app</p>
        </div>
      </div>
    );
  }
}

export default Home;
