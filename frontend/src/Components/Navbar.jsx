import React from "react";
import Logout from "../Pages/Logout";

const Navbar = ({ setShowLogin, setShowSignup, user,setUser }) => {
  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full flex justify-between p-4">
      <h1 className="text-xl font-bold">Personal AI Assist</h1>
      <div>
        {user ? (<><span className="text-green-600 font-semibold mx-3">Welcome, {user.name} </span>
          <Logout setUser={setUser} /></>
        ) : (
          <>
            <button
              className="border rounded px-4 py-2 mr-2 bg-green-600 font-semibold"
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
            <button
              className="border rounded px-4 py-2 bg-blue-600 font-semibold"
              onClick={() => setShowSignup(true)}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

