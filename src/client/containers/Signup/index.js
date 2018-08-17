// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { registerUser } from '../../redux/reducers/register';
import { UserCreator } from '../../components';
import './index.css';

type Props = {
  registerationState: Object,
  registerUser: () => *,
};
type State = {};

export class Signup extends Component<Props, State> {
  render() {
    return (
      <UserCreator
        isAdmin={false}
        createUser={this.props.registerUser}
        userCreationState={this.props.registerationState}
        submitString="Register"
        loadingString="Registering...."
      />
    );
  }
}

const mapStateToProps = ({ register }) => ({ registerationState: register });

// connect redux to the container
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      registerUser,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Signup);
