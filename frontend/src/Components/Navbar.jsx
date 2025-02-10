import React from "react";

const Navbar = ({ setShowLogin, setShowSignup, user }) => {
  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full flex justify-between p-4">
      <h1 className="text-xl font-bold">MERN App</h1>
      <div>
        {user ? (
          <span className="text-green-600 font-semibold">Welcome, {user.name}</span>
        ) : (
          <>
            <button
              className="border rounded px-4 py-2 mr-2"
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
            <button
              className="border rounded px-4 py-2"
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

