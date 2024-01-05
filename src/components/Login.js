import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; 

function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null); // State to store any error messages
  const navigate = useNavigate();


  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null); // Reset error messages on new submission

    try {
      // API call to the login endpoint
      const response = await fetch('https://frontend-take-home-service.fetch.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
        credentials: 'include' // Important for including cookies
      });

      if (response.ok) {
        // Handle successful response
        // Assuming the API redirects upon successful login or you might want to do it manually
        navigate('/search');
      } else {
        // Extracting error message from response
        const errorData = await response.json();
        setError(errorData.message || 'An error occurred. Please try again.');
      }
    } catch (networkError) {
      // Handling network errors
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src="/fetch.png" alt="Logo" className="login-logo" /> {/* Make sure the path is correct */}
      </div>
      <div className="login-box">
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
export default Login;
