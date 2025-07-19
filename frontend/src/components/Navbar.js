import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar bg-dark text-light">
      <div className="container d-flex justify-content-between align-items-center">
        <Link to="/" className="navbar-brand text-white fw-bold">
          Welcome!
        </Link>
        <ul className="nav">
          <li className="nav-item">
            <Link to="/" className="nav-link text-white">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/projects" className="nav-link text-white">
              Projects
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/tools" className="nav-link text-white">
              Tools
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-link text-white">
              About
            </Link>
          </li>
          <li className="nav-item">
              <Link className="nav-link" to="/github">GitHub Repos</Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className="nav-link text-white">
              Contact Me
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;