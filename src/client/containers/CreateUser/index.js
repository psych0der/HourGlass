// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createUser } from '../../redux/reducers/createUser';
import { UserCreator } from '../../components';
import { PageHeader } from 'react-bootstrap';
import './index.css';

type Props = {
  createUserState: Object,
  createUser: () => *,
};
type State = {};

export class CreateUser extends Component<Props, State> {
  render() {
    return (
      <div>
        <div>
          <PageHeader>Create new user</PageHeader>
        </div>
        <UserCreator
          isAdmin={true}
          createUser={this.props.createUser}
          userCreationState={this.props.createUserState}
          submitString="Create User"
          loadingString="Creating..."
        />
      </div>
    );
  }
}

const mapStateToProps = ({ createUser }) => ({ createUserState: createUser });

// connect redux to the container
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      createUser,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateUser);
