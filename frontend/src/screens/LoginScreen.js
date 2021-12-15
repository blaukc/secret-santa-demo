import React, { useState, useEffect, Fragment } from 'react'
import { Container, Row, Col, Form, Button, Alert, ProgressBar } from 'react-bootstrap'
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'

import { login } from '../slices/tokenSlice'

const LoginScreen = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const token = useSelector((state) => state.token)
    const { error, loading, access_token } = token
    const dispatch = useDispatch()

    const location = useLocation()
    const redirect = location.search.split('=')[1]
    if (redirect) {
        localStorage.setItem('redirect', redirect)
    }


    const navigate = useNavigate()

    useEffect(() => {
        if (access_token) {
            const redirect_location = localStorage.getItem('redirect')
            console.log(redirect_location)
            if (redirect_location) {
                const redirect_slug = redirect_location.split("manage-events-")
                console.log(redirect_slug)
                if (redirect_slug.length > 1) {
                    navigate(`/manage-events/${redirect_slug[1]}`)
                } else if (redirect_slug[0] === 'manage-events') {
                    navigate('/manage-events')
                } else {
                    navigate('/create-event')
                }
            } else {
                navigate('/create-event')
            }
            localStorage.removeItem('redirect')
        }
    }, [redirect, access_token, navigate])

    const loginHandler = (e) => {
        e.preventDefault()
        navigate("/login")
        dispatch(login(email, password))
    }


    return (
        <Container className="flex-grow-1" fluiadd="true">
            <Row className="justify-content-center w-100 h-100">
                <Col md="4" className="align-items-center">
                    <Container className="w-100 h-100">
                        <Row className="align-items-center w-100 h-100">
                            <Container>
                                <Form>
                                    <h1>Sign in</h1>

                                    {error &&
                                        <Alert variant="danger">
                                            {error}
                                        </Alert>
                                    }

                                    {redirect === "create-event" &&
                                        <Alert variant="warning">
                                            Sign In to Create an Event!
                                        </Alert>
                                    }

                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label>Email address</Form.Label>
                                        <Form.Control type="email" placeholder="Enter email"
                                        value={email} onChange={(e) => setEmail(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicPassword">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type="password" placeholder="Password"
                                        value={password} onChange={(e) => setPassword(e.target.value)}/>
                                    </Form.Group>

                                    <Button variant="primary" type="submit" onClick={(e) => loginHandler(e)} disabled={loading}>
                                        Login
                                    </Button>

                                    <Row className="mt-3">
                                        <Col>
                                            New User? <Link to="/register">Register</Link>
                                        </Col>
                                    </Row>


                                    {loading &&
                                        <Fragment>
                                        <p>Logging in...</p>
                                        <ProgressBar animated now={100} variant="success" />
                                        </Fragment>
                                    }
                                </Form>
                            </Container>
                        </Row>
                    </Container>
                </Col>
            </Row>
        </Container>
    )
}

export default LoginScreen
