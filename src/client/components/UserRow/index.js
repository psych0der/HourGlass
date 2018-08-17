import React from 'react';
import './index.css';
import { Label } from 'react-bootstrap';

/* Presentational component to render user information */
export default ({
  userData,
  onClick,
}: {
  userData: Object,
  onClick: () => *,
}) => {
  return (
    <div className="userRow">
      <div className="userName">{userData.name}</div>
      <div className="userRole">
        <Label bsStyle="primary">{userData.role}</Label>
      </div>
    </div>
  );
};
