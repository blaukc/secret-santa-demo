import React, { useState, useEffect, Fragment } from 'react'
import { Container, Row, Col, Form, Button, Alert, ProgressBar, FloatingLabel, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'

import { update_event, delete_event, sending_emails } from '../slices/eventSlice'
import { validateToken } from '../slices/tokenSlice'

const EventScreen = () => {

    const [title, setTitle] = useState('')
    const [date, setDate] = useState('')
    const [budget, setBudget] = useState(0)
    const [location, setLocation] = useState('')
    const [numParticipants, setNumParticipants] = useState(3)
    const [participants, setParticipants] = useState([['', ''], ['', '']])
    const [namesDrawn, setNamesDrawn] = useState(false)
    const [emailsSent, setEmailsSent] = useState(false)

    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')

    const [errorAlert, setErrorAlert] = useState('')

    const dispatch = useDispatch()

    const user = useSelector((state) => state.user)
    const host_name = user.name
    const host_email = user.email

    const token = useSelector((state) => state.token)
    const { access_token } = token

    const sending_emails_state = useSelector((state) => state.event)
    const { sending_emails_loading, sending_emails_error, sending_emails_error_code } = sending_emails_state

    const update_event_state = useSelector((state) => state.event)
    const event_loading = update_event_state.update_loading
    const event_error = update_event_state.update_error
    const event_error_code = update_event_state.update_error_code

    // const user = useSelector((state) => state.user)

    const navigate = useNavigate()
    const params = useParams()
    const event_id = params.slug

    const axios = require("axios")

    const getEvent = async() => {
        try {
            const response = await axios.get(`/api/events/${event_id}/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                }
            })

            setTitle(response.data.title)
            setDate(response.data.date)
            setBudget(Number(response.data.budget))
            setLocation(response.data.location)
            setNumParticipants(response.data.num_participants)
            setParticipants(response.data.participant_details)
            setNamesDrawn(response.data.names_drawn)
            setEmailsSent(response.data.emails_sent)
            setSubject(`Secret Santa: ${response.data.title}`)
            setBody(`Hi $giver,\n\nYou've been invited to a Secret Santa organised by ${host_name}.\n\nDate: ${response.data.date ? response.data.date : "Date Unconfirmed"}\nBudget: ${response.data.budget !== '0.00' ? response.data.budget : "Budget Unconfirmed"}\nLocation: ${response.data.location !== '' ? response.data.location : "Location Unconfirmed"}\n\nYou will be giving your gift to $receiver.`)

        } catch (error) {
            if (error.response.status === 401) navigate("/manage-events?redirect=event")
        }
    }


    useEffect(() => {
        if (access_token === '') {
            navigate(`/login?redirect=manage-events-${event_id}`)
        }
        else {
            //validate token, if not valid, dispatch logout
            dispatch(validateToken(access_token))
            getEvent()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, access_token, navigate])

    // for handling variable number of participants
    const addParticipantHandler = () => {
        setNumParticipants(numParticipants + 1)
        let participants_copy = [...participants]
        participants_copy.push(['',''])
        setParticipants(participants_copy)
    }

    const updateParticipantHandler = (e, index, field) => {    //index is for which row         field 0 -> name, 1 -> email
        let participant_copy = [...participants]
        participant_copy[index][field] = e.target.value
        setParticipants(participant_copy)
    }

    const removeParticipantHandler = (index) => {
        setNumParticipants(numParticipants - 1)
        let participant_copy = [...participants]
        participant_copy.splice(index, 1)
        setParticipants(participant_copy)
    }

    const validateEmail = (email) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    const updateEventHandler = (e) => {
        e.preventDefault()
        setErrorAlert('')
        // check inputs
        let valid_participants = []
        if (title === '') {
            setErrorAlert('Title is empty')
            return
        }
        if (budget < 0) {
            setErrorAlert('Invalid budget')
            return
        }
        for (let i = 0; i < participants.length; i++) {
            if (participants[i][0] !== '' && participants[i][1] !== '') {
                valid_participants.push(participants[i])
            } else if (participants[i][0] === '' && participants[i][1] === '') {
                continue
            } else if (participants[i][0] === '' || participants[i][1] === '') {
                setErrorAlert('Participants not filled up properly')
                return
            }
            if (!validateEmail(participants[i][1])) {
                setErrorAlert('Invalid email address')
                return
            }
        }
        if (valid_participants.length < 3) {
            setErrorAlert('Not enough people for a Secret Santa')
            return
        }
        // dispatch

        const eventInfo = {
            "title": title,
            "host": host_email,
            "num_participants": valid_participants.length,
            "participant_details_list": valid_participants,
            "date": date,
            "budget": budget,
            "location": location,
        }

        dispatch(update_event(access_token, eventInfo, event_id))
    }

    const deleteEventHandler = () => {
        dispatch(delete_event(access_token, event_id))
        navigate("/manage-events")
    }

    const drawNamesHandler = async() => {
        try {
            const response = await axios.get(`/api/draw-names/${event_id}/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                }
            })
            setNamesDrawn(response.data.names_drawn)
        } catch (error) {
            if (error.response.status === 401) navigate("/manage-events?redirect=event")
        }
    }

    const sendEmailsHandler = async() => {
        const response = await dispatch(sending_emails(access_token, subject, body, event_id))
        try {
            setEmailsSent(response.data.emails_sent)
        } catch {
            setEmailsSent(false)
        }
    }

    return (
        <Container className="flex-grow-1" fluid="true">
            <Row className="justify-content-center w-100 h-100">
                <Col md="8" className="align-items-center">
                    <Container className="w-100 h-100">
                        <Row className="w-100 h-100 justify-content-between">
                            <Col sm="12" md="5">
                                <Container>
                                    <Form>
                                        <Row>
                                            <h1 className="text-center">Update Event</h1>
                                        </Row>

                                        {errorAlert !== '' &&
                                            <Alert variant="danger">
                                                {errorAlert}
                                            </Alert>
                                        }

                                        {event_error !== '' &&
                                            <Alert variant="danger">
                                                <p>{event_error}</p>
                                                {event_error_code}
                                            </Alert>
                                        }

                                        <Form.Group className="mb-3" controlId="formBasicTitle">
                                            <Form.Label>Event Title</Form.Label>
                                            <Form.Control type="text" placeholder="Enter event title"
                                            value={title} onChange={(e) => setTitle(e.target.value)}/>
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="formBasicDate">
                                            <Form.Label>Date</Form.Label>
                                            <Form.Control type="date" placeholder="Enter date"
                                            value={date} onChange={(e) => setDate(e.target.value)}/>
                                        </Form.Group>


                                        <Form.Group className="mb-3" controlId="formBasicBudget">
                                            <Form.Label>Budget</Form.Label>
                                            <Form.Control type="number" placeholder="Enter budget" min="0"
                                            value={budget} onChange={(e) => setBudget(e.target.value)}/>
                                        </Form.Group>


                                        <Form.Group className="mb-3" controlId="formBasicLocation">
                                            <Form.Label>Location</Form.Label>
                                            <Form.Control type="text" placeholder="Enter location"
                                            value={location} onChange={(e) => setLocation(e.target.value)}/>
                                        </Form.Group>


                                        <Form.Group className="mb-3" controlId="formBasicParticipants">
                                            <Form.Label>Participants</Form.Label>

                                                <Row className="">
                                                    <Col xs="4">
                                                        <Form.Label>Name</Form.Label>
                                                    </Col>

                                                    <Col xs="6">
                                                        <Form.Label>Email</Form.Label>
                                                    </Col>
                                                </Row>


                                                {participants.map((participant, index) => (
                                                    <Row className="mb-3" key={index}>
                                                        <Col xs="4">
                                                            <Form.Group>
                                                                <Form.Control type="name" placeholder="Enter Participant Name"
                                                                value={participant[0]} onChange={(e) => updateParticipantHandler(e, index, 0)} />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs="6">
                                                            <Form.Group>
                                                                <Form.Control type="email" placeholder="Enter Participant Email"
                                                                value={participant[1]} onChange={(e) => updateParticipantHandler(e, index, 1)} />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col xs="2">
                                                            <Button variant="outline-danger" type="button"
                                                            onClick={() => removeParticipantHandler(index)} disabled={numParticipants <= 3}>
                                                                Remove
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                ))}

                                                <Col className="mb-3">
                                                    <Button variant="outline-primary" type="button" onClick={() => addParticipantHandler()}>
                                                        Add Participant
                                                    </Button>
                                                </Col>

                                        </Form.Group>



                                        <Row className="justify-content-center mb-5">
                                            <Col xs="4" md="auto" className="mx-3">
                                                <Row className="justify-content-center">
                                                    <Button variant="primary" type="submit" onClick={(e) => updateEventHandler(e)}>
                                                        Update
                                                    </Button>
                                                </Row>
                                            </Col>
                                            <Col xs="4" md="auto">
                                                <Row className="justify-content-center">
                                                    <Button variant="secondary" type="submit" onClick={(e) => deleteEventHandler(e)}>
                                                        Delete
                                                    </Button>
                                                </Row>
                                            </Col>
                                        </Row>

                                        {event_loading &&
                                            <Fragment>
                                            <p>Updating Event</p>
                                            <ProgressBar animated now={100} variant="success" />
                                            </Fragment>
                                        }
                                    </Form>
                                </Container>
                            </Col>


                            <Col sm="12" md="5">
                                <Row>
                                    <h1 className="text-center">Manage Event</h1>
                                </Row>
                                <Row className="mt-3">
                                    { namesDrawn ?
                                        <h6 className="text-center">Names have already been drawn. Continue to next step.</h6>
                                        :
                                        <h6 className="text-center">Once details of the event have been finalised, click the button to draw names for secret santa participants.</h6>
                                    }
                                </Row>
                                <Row className="justify-content-center">
                                    <Col sm="4" md="auto">
                                        <Button variant="outline-primary" type="button"
                                        onClick={() => drawNamesHandler()} disabled={namesDrawn}>
                                            Draw Names
                                        </Button>
                                    </Col>
                                </Row>

                                {sending_emails_error !== '' &&
                                    <Alert variant="danger">
                                        <p>{sending_emails_error}</p>
                                        {sending_emails_error_code}
                                    </Alert>
                                }

                                <Row className="mt-5">
                                    { emailsSent ?
                                        <h6 className="text-center">Emails have been sent out. Enjoy your secret santa!</h6>
                                        :
                                        <h6 className="text-center">Once names have been drawn, click the button to send out the emails containing details for the secret santa.</h6>
                                    }
                                </Row>
                                { !emailsSent &&
                                    <OverlayTrigger
                                    placement="right"
                                    overlay={
                                        <Tooltip id={`tooltip-right`}>
                                            Use $giver and $receiver as placeholder for giver and receiver names.
                                        </Tooltip>
                                    }>
                                        <Form>
                                            <FloatingLabel controlId="floatingTextarea" label="Subject" className="mb-3">
                                                <Form.Control type="text" value={subject} onChange={(e) => setSubject(e.target.value)}/>
                                            </FloatingLabel>
                                                <FloatingLabel controlId="floatingTextarea2" label="Body">
                                                    <Form.Control as="textarea"
                                                    value={body}
                                                    onChange={(e) => setBody(e.target.value)}
                                                    style={{ minHeight: '300px' }}
                                                    />
                                                </FloatingLabel>
                                        </Form>
                                    </OverlayTrigger>
                                }
                                <Row className="justify-content-center mt-3">
                                    <Col sm="4" md="auto">
                                        <Button variant="outline-primary" type="button"
                                        onClick={() => sendEmailsHandler()} disabled={emailsSent || !namesDrawn}>
                                            Send Emails
                                        </Button>
                                    </Col>
                                </Row>



                                {sending_emails_loading &&
                                    <Row className="mt-3">
                                    <p>Sending out emails. This may take a while...</p>
                                    <ProgressBar animated now={100} variant="success"/>
                                    </Row>
                                }

                            </Col>
                        </Row>
                    </Container>
                </Col>
            </Row>
        </Container>
    )
}

export default EventScreen
