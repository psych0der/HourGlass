import React from 'react';
import { Route } from 'react-router-dom';
import Home from '../Home';

export class App extends React.Component {
  render() {
    return (
      <div>
        {' '}
        {/* display Home at default path as of now */}{' '}
        <main>
          <Route exact path="/" component={Home} />{' '}
        </main>{' '}
      </div>
    );
  }
}

export default App;
