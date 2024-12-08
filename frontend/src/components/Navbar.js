import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/components/Navbar.css';


const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="nav-list">
        <li className="nav-item">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}
          >
            Dashboard
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/task-form"
            className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}
          >
            Task Form
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}
          >
            Login
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/signup"
            className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}
          >
            Signup
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
