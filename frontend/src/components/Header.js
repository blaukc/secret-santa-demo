import React from 'react'
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap'
import { useLocation } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap"
import { useDispatch, useSelector } from "react-redux"

import { logout } from '../slices/tokenSlice'

const Header = () => {

    const location = useLocation()

    const token = useSelector((state) => state.token)
    const user = useSelector((state) => state.user)
    const { name } = user

    const dispatch = useDispatch()

    return (
        <Navbar bg="primary" expand="sm" className="navbar-dark">
            <Container>
                <LinkContainer to='/'>
                    <Navbar.Brand>Secret Santa</Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav activeKey={location.pathname} className="me-auto">
                        <LinkContainer to='/create-event'>
                            <Nav.Link>Create Event</Nav.Link>
                        </LinkContainer>

                        {token && name ?
                        <NavDropdown title={name} id="basic-nav-dropdown">
                            {/*<LinkContainer to='/my-profile'>
                                <NavDropdown.Item>My Profile</NavDropdown.Item>
                            </LinkContainer>*/}
                            <LinkContainer to='/manage-events'>
                                <NavDropdown.Item>Manage Events</NavDropdown.Item>
                            </LinkContainer>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={() => dispatch(logout())}>Logout</NavDropdown.Item>
                        </NavDropdown>
                        :
                        <LinkContainer to='/login'>
                            <Nav.Link>Login</Nav.Link>
                        </LinkContainer>
                        }
                        {/*<NavDropdown title="Dropdown" id="basic-nav-dropdown">
                            <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                        </NavDropdown>*/}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default Header
