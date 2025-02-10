import React, { useState } from "react";
import axios from "axios";
import toast from 'react-hot-toast'
const Signup = ({ setUser, setShowSignup }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const handleSignup = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post("http://localhost:4001/register", {
        name,
        email,
        phone,
        password,
      });
      toast.success(data.message || 'User registered successfully')
      setShowSignup(false);
    } catch (err) {
      setError("Signup failed. Try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center"
      onClick={() => setShowSignup(false)}
    >
      <div className="bg-white p-6 rounded-lg shadow-md w-80 relative" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
          onClick={() => setShowSignup(false)}
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">Sign Up</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Name"
          className="border rounded p-2 w-full mb-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="border rounded p-2 w-full mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Phone Number"
          className="border rounded p-2 w-full mb-2"
          value={phone}
          onChange={(e) => setNumber(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border rounded p-2 w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="bg-green-500 text-white rounded px-4 py-2 w-full"
        >
          Sign Up
        </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
