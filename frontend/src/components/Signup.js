import React, { useState } from 'react';
import axios from 'axios';
import '../styles/components/AuthForm.css';


const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post('http://localhost:5000/api/signup', { username, password }) // Explicit backend URL
      .then(() => alert('Signup successful!'))
      .catch((err) => {
        console.error('Error during signup:', err.response?.data || err.message);
        alert('Signup failed!');
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Signup</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Signup</button>
    </form>
  );
};

export default Signup;
