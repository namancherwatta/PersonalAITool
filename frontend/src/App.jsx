
import './App.css'

import React, { useState,useEffect } from "react";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import TodoList  from "./components/TodoList";
import GmailSection from "./components/GmailSection";
import CalendarSection from "./components/CalendarSection";
import HealthBar from "./components/HealthBar";
import dummyData from "./assets/dummydata.json"
import Navbar from './Components/Navbar';

const App = () => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
   console.log(savedToken,savedUser)
    if (savedToken && savedUser) {
      setUser({ token: savedToken, userId: JSON.parse(savedUser).userId,name:JSON.parse(savedUser).username }); 
    }
  }, []);

 
  
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <Navbar setShowLogin={setShowLogin} setShowSignup={setShowSignup} user={user} setUser={setUser} />
      
      {showLogin && <Login setUser={setUser} setShowLogin={setShowLogin} />}
      {showSignup && <Signup setUser={setUser} setShowSignup={setShowSignup} />}
      
      <div className="container mx-auto p-4 grid grid-cols-3 gap-4">
        <div className="col-span-1 ">
          <GmailSection user={user} dummyEmails={dummyData.emails} />
        </div>
        <div className="col-span-1">
          <TodoList user={user} />
        </div>
        <div className="col-span-1">
          <CalendarSection user={user} dummyEvents={dummyData.events} />
        </div>
      </div>

      <div className="container mx-auto mt-4 p-4">
        <HealthBar user={user} dummyHealthData={dummyData.health} />
      </div>
    </div>
  );
};

export default App;

