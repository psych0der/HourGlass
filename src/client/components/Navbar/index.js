// @flow
import React from 'react';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
type Props = {};

const NavBar = (props: Props) => {
  return (
    <Navbar collapseOnSelect>
      <Navbar.Header>
        <Navbar.Brand>
          <a href="#brand">HourGlass</a>
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav>
          <NavItem eventKey={1} href="#">
            Home
          </NavItem>
        </Nav>
        <Nav pullRight>
          <NavItem eventKey={1} href="#">
            Login
          </NavItem>
          <NavItem eventKey={2} href="#">
            Register
          </NavItem>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};
export default NavBar;
