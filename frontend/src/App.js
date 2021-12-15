import React from 'react'
import { Routes, Route } from "react-router-dom";

import Header from './components/Header'
import HomeScreen from './screens/HomeScreen'
import CreateEventScreen from './screens/CreateEventScreen'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import ManageEventsScreen from './screens/ManageEventsScreen'
import EventScreen from './screens/EventScreen'

function App() {
    return (
        <div className="d-flex flex-column vh-100" fluid="true">
            <Header />
            <Routes>
                <Route path="/" element={<HomeScreen />}/>
                <Route path="/create-event" element={<CreateEventScreen />}/>
                <Route path="/login" element={<LoginScreen />}/>
                <Route path="/register" element={<RegisterScreen />}/>
                <Route path="/manage-events" element={<ManageEventsScreen />}/>
                <Route path="/manage-events/:slug" element={<EventScreen />}/>
            </Routes>
        </div>
    );
}

export default App;
