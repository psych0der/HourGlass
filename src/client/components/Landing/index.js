// @flow
import React from 'react';
type Props = {};
type State = {};

export class Landing extends React.Component<Props, State> {
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

export default Landing;
