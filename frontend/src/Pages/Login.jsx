import React, { useState } from "react";
import axios from "axios";

const Login = ({ setUser, setShowLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:4001/login", { email, password });
      localStorage.setItem("token", response.data.token); 
      localStorage.setItem("user", JSON.stringify({ userid: response.data.userid,username:response.data.name },)); 
      setUser(response.data);
      setShowLogin(false);
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center"
      onClick={() => setShowLogin(false)}
    >
      <div className="bg-white p-6 rounded-lg shadow-md w-80 relative" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
          onClick={() => setShowLogin(false)}
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="border rounded p-2 w-full mb-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border rounded p-2 w-full mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            onClick={handleLogin}
            className="bg-blue-500 text-white rounded px-4 py-2 w-full"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
