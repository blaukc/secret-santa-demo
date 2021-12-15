import React from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import { Link } from "react-router-dom";

const HomeScreen = () => {
    return (
        <Container className="flex-grow-1" fluid>
            <Row className="align-items-center w-100 h-100">
                <Container>
                    <Row className="justify-content-center">
                        <Col xs="auto">
                            <h1 className="text-secondary">Secret Santa</h1>
                        </Col>
                    </Row>
                    <Row className="justify-content-center my-3">
                        <Col xs="10" md="6">
                            <h5 className="text-secondary text-center">Just a simple Secret Santa website you can use with friends and family.</h5>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col xs="auto">
                            <Button type="button" variant="outline-secondary" size="lg"
                            as={Link} to="/create-event">
                                Get Started
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </Row>
        </Container>
    )
}

export default HomeScreen
