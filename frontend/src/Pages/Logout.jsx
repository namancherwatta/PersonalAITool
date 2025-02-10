import React from 'react'

export default function Logout({ setUser }) {
    
        const handleLogout = () => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        };
      
        return (
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
        );
}
