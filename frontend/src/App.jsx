
import './App.css'
import React, { useState,useEffect, use } from "react";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import GmailSection from "./components/GmailSection";
import CalendarSection from "./components/CalendarSection";
import dummyData from "./assets/dummydata.json"
import Navbar from './Components/Navbar';
import { GoogleOAuthProvider } from '@react-oauth/google';
import HealthBar from './Components/HealthBar';
import TodoList from './Components/Todolist';
import Assistant from './Components/Assistant';

const App = () => {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [googleToken,setGoogleToken]=useState(null);
  const [rerenderSection, setRerenderSection] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
  //  console.log(savedToken,savedUser)
   console.log(googleToken)
    if (savedToken && savedUser) {
      setUser({ token: savedToken, userId: JSON.parse(savedUser).userId,name:JSON.parse(savedUser).username }); 
    }
  }, []);

 
  
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-gray-100 py-10">
        {/* Navbar */}
        <Navbar setShowLogin={setShowLogin} setShowSignup={setShowSignup} user={user} setUser={setUser} />

        {/* Modals */}
        {showLogin && <Login setUser={setUser} setShowLogin={setShowLogin} />}
        {showSignup && <Signup setUser={setUser} setShowSignup={setShowSignup} />}

        {/* Main Content Grid */}
        <div className="container mt-6 mx-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {/* Gmail Section */}
          <div className="lg:col-span-3">
            <GmailSection 
              user={user} 
              dummyEmails={dummyData.emails} 
              setGoogleToken={setGoogleToken} 
              onLogout={() => setGoogleToken(null)} 
              rerenderSection={rerenderSection} 
              setRerenderSection={setRerenderSection} 
            />
          </div>

          {/* Todo List */}
          <div className="lg:col-span-2">
            <TodoList 
              user={user} 
              rerenderSection={rerenderSection} 
              setRerenderSection={setRerenderSection} 
            />
          </div>

          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <CalendarSection 
              user={user} 
              dummyEvents={dummyData.events} 
              googleToken={googleToken} 
            />
          </div>
        </div>

        {/* Health Bar */}
        <div className="container mx-auto mt-4 p-4">
          <HealthBar 
            user={user} 
            dummyHealthData={dummyData.health} 
            rerenderSection={rerenderSection} 
            setRerenderSection={setRerenderSection} 
          />
        </div>

        {/* Assistant */}
        <div className="fixed bottom-4 right-4 z-50">
          <Assistant user={user} setRerenderSection={setRerenderSection} />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};


export default App;

