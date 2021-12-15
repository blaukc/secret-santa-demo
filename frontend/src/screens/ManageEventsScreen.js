import React, { useState, useEffect } from 'react'
import { Container, Row, Card, Alert } from 'react-bootstrap'
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'

import { validateToken } from '../slices/tokenSlice'

const ManageEventsScreen = () => {

    const [events, setEvents] = useState([])

    const dispatch = useDispatch()

    const location = useLocation()
    const redirect = location.search.split('=')[1]

    const token = useSelector((state) => state.token)
    const { access_token } = token

    // const user = useSelector((state) => state.user)

    const navigate = useNavigate()

    const axios = require('axios')

    const getEvents = async() => {
        const response = await axios.get("/api/events/", {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            }
        })
        setEvents(response.data)
    }

    useEffect(() => {
        if (access_token === '') {
            navigate("/login?redirect=manage-events")
        }
        else {
            //validate token, if not valid, dispatch logout
            dispatch(validateToken(access_token))
            getEvents()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, access_token, navigate])

    const checkDate = (checkEqual, date) => {
        const today = new Date()
        const test_date = new Date(date)
        if (checkEqual) {
            return today.getFullYear() === test_date.getFullYear() && today.getMonth() === test_date.getMonth() && today.getDate() === test_date.getDate();
        } else {
            return test_date > today
        }
    }

    return (
        <Container className="flex-grow-1 flex-wrap flex-row">
            {redirect === "event" &&
                <Alert variant="warning">
                    You are not authorised to view that event!
                </Alert>
            }
            <Row className="justify-content-center">
                {events.map((event) => (
                    <Card text="light" style={{ width: '18rem', textDecoration: 'none' }} className="my-5 mx-5" as={Link} to={`/manage-events/${event.id}`}
                    key={event.id} bg={!event.date ? "info" : checkDate(true, event.date) ? "warning" : checkDate(false, event.date) ? "primary" : "secondary"}>
                        <Card.Header>{event.date ? event.date : "Date Unconfirmed"}</Card.Header>
                        <Card.Body>
                            <Card.Title>{event.title}</Card.Title>
                            <Card.Text>{event.location === '' ? "Location Unconfirmed" : event.location}</Card.Text>
                            <Card.Text>{`${event.num_participants} Participants`}</Card.Text>
                            <Card.Text>{event.budget === "0.00" ? "Budget Unconfirmed" : `Budget: ${event.budget}`}</Card.Text>
                        </Card.Body>
                    </Card>
                ))
                }
            </Row>
        </Container>
    )
}

export default ManageEventsScreen
