import React, { useState, useEffect, Fragment } from 'react'
import { Container, Row, Col, Form, Button, Alert, ProgressBar } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'

import { create_event, create_event_redirected } from '../slices/eventSlice'
import { validateToken } from '../slices/tokenSlice'

const CreateEventScreen = () => {

    const [title, setTitle] = useState('')
    const [date, setDate] = useState('')
    const [budget, setBudget] = useState(0)
    const [location, setLocation] = useState('')
    const [numParticipants, setNumParticipants] = useState(3)
    const [participants, setParticipants] = useState([['', ''], ['', '']])
    const [includeSelf, setIncludeSelf] = useState(true)

    const [errorAlert, setErrorAlert] = useState('')

    const dispatch = useDispatch()

    const user = useSelector((state) => state.user)
    const host_name = user.name
    const host_email = user.email

    const token = useSelector((state) => state.token)
    const { access_token } = token

    const create_event_state = useSelector((state) => state.event)
    const event_loading = create_event_state.create_loading
    const event_error = create_event_state.create_error
    const event_error_code = create_event_state.create_error_code
    const event_created = create_event_state.created

    // const user = useSelector((state) => state.user)

    const navigate = useNavigate()

    useEffect(() => {
        if (access_token === '') {
            navigate("/login?redirect=create-event")
        }
        else {
            //validate token, if not valid, dispatch logout
            dispatch(validateToken(access_token))
            if (event_created) {
                navigate("/manage-events")
                dispatch(create_event_redirected())
            }
        }
    }, [dispatch, access_token, navigate, event_created])

    // for handling variable number of participants
    const includeSelfHandler = () => {
        if (includeSelf) {
            setIncludeSelf(false)

            if (participants.length < 3) {      //if number of participants not self < 3, remove self and add a new entry
                addParticipantHandler()
                setNumParticipants(3)
            } else {                            //if number of participants not self >= 3, remove self only
                setNumParticipants(numParticipants - 1)
            }
        } else {
            setIncludeSelf(true)
            setNumParticipants(numParticipants + 1)
        }
    }

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

    const createEventHandler = (e) => {
        e.preventDefault()
        setErrorAlert('')
        // check inputs
        let valid_participants = []
        if (includeSelf) valid_participants.push([host_name, host_email])
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

        dispatch(create_event(access_token, eventInfo))
    }


    return (
        <Container className="flex-grow-1" fluid="true">
            <Row className="justify-content-center w-100 h-100">
                <Col md="8" className="align-items-center">
                    <Container className="w-100 h-100">
                        <Row className="align-items-center w-100 h-100">
                            <Container>
                                <Form>
                                    <Row>
                                        <h1 className="text-center">Create Event</h1>
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

                                        <Form.Check inline label="Include self?" name="group1" type="checkbox" className="mx-5"
                                        checked={includeSelf} onChange={() => includeSelfHandler()}/>

                                            <Row className="">
                                                <Col xs="4">
                                                    <Form.Label>Name</Form.Label>
                                                </Col>

                                                <Col xs="6">
                                                    <Form.Label>Email</Form.Label>
                                                </Col>
                                            </Row>

                                            { includeSelf &&
                                            <Row className="mb-3">
                                                <Col xs="4">
                                                    <Form.Group>
                                                        <Form.Control type="text" value={host_name} disabled/>
                                                    </Form.Group>
                                                </Col>

                                                <Col xs="6">
                                                    <Form.Group>
                                                        <Form.Control type="email" value={host_email} disabled/>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            }


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



                                    <Row className="justify-content-center">
                                        <Col sm="auto" md="auto">
                                            <Button variant="primary" type="submit" onClick={(e) => createEventHandler(e)}>
                                                Create Event
                                            </Button>
                                        </Col>
                                    </Row>

                                    {event_loading &&
                                        <Fragment>
                                        <p>Creating Event</p>
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

export default CreateEventScreen
