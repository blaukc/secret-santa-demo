import React, { useState, useEffect, Fragment } from 'react'
import { Container, Row, Col, Form, Button, Alert, ProgressBar } from 'react-bootstrap'
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'

import { register } from '../slices/registerSlice'

const RegisterScreen = () => {

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errorAlert, setErrorAlert] = useState('')

    const navigate = useNavigate()

    const registerState = useSelector((state) => state.register)
    const register_loading = registerState.loading
    const register_error = registerState.error
    const register_error_code = registerState.error_code

    const token = useSelector((state) => state.token)
    const token_loading = token.loading
    const token_error = token.error
    const access_token = token.access_token

    const dispatch = useDispatch()

    const validateEmail = (email) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    const registerHandler = (e) => {
        e.preventDefault()
        if (!validateEmail(email)) {
            setErrorAlert('Invalid email address')
            return
        }
        if (name === '' || email === '' || password === '' || confirmPassword === '') {
            setErrorAlert('One or more fields are empty')
        } else {
            if (password === confirmPassword) {
                setErrorAlert('')
                dispatch(register(name, email, password))
            } else {
                setErrorAlert('Passwords do not match')
            }
        }
    }

    useEffect(() => {
        if (access_token) {
            navigate("/create-event")
        }
    }, [access_token, navigate])

    return (
        <Container className="flex-grow-1" fluid>
            <Row className="justify-content-center w-100 h-100">
                <Col md="4" className="align-items-center">
                    <Container className="w-100 h-100">
                        <Row className="align-items-center w-100 h-100">
                            <Container>
                                <Form>
                                    <h1>Register</h1>

                                    {errorAlert !== '' &&
                                        <Alert variant="danger">
                                            {errorAlert}
                                        </Alert>
                                    }

                                    {register_error !== '' &&
                                        <Alert variant="danger">
                                            <p>{register_error}</p>
                                            {register_error_code}
                                        </Alert>
                                    }

                                    {token_error !== '' &&
                                        <Alert variant="danger">
                                            {token_error}
                                        </Alert>
                                    }

                                    <Form.Group className="mb-3">
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control type="email" placeholder="Enter name"
                                        value={name} onChange={(e) => setName(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label>Email address</Form.Label>
                                        <Form.Control type="email" placeholder="Enter email"
                                        value={email} onChange={(e) => setEmail(e.target.value)}/>
                                        <Form.Text className="text-muted">
                                        We'll never share your email with anyone else.
                                        </Form.Text>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicPassword">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type="password" placeholder="Password"
                                        value={password} onChange={(e) => setPassword(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control type="password" placeholder="Confirm Password"
                                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                                    </Form.Group>






                                    <Button variant="primary" type="submit" onClick={(e) => registerHandler(e)}>
                                        Sign up
                                    </Button>

                                    <Row className="my-3">
                                        <Col>
                                            New User? <Link to="/login">Login</Link>
                                        </Col>
                                    </Row>

                                    {register_loading &&
                                        <Fragment>
                                        <p>Registering...</p>
                                        <ProgressBar animated now={50} variant="success"/>
                                        </Fragment>
                                    }

                                    {token_loading &&
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

export default RegisterScreen
