import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import TicTacToe from "./pages/TicTacToe";
import WeatherDashboard from "./pages/WeatherDashboard";
import RunBoxDemo from "./components/RunBoxDemo";
import Projects from "./pages/Projects"; // If you have a projects page
import GitHubRepos from './pages/GitHubRepos';
import Tools from "./pages/Tools";
import Calculator from "./pages/Calculator";
import Resume from './pages/Resume'; 
import About from './pages/About'; 
import ChessDemo from './components/ChessDemo';
import Contact from './pages/Contact';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/tictactoe" element={<TicTacToe />} />
        <Route path="/weather" element={<WeatherDashboard />} />
        <Route path="/run-box-ecm-demo" element={<RunBoxDemo />} />
        <Route path="/github" element={<GitHubRepos />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/tools/calculator" element={<Calculator />} />
        <Route path="/resume" element={<Resume />} /> 
        <Route path="/about" element={<About />} /> 
        <Route path="/personal-webpage/chessdemo" element={<ChessDemo />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        {/* Add more routes here as needed */}
      </Routes>
    </>
  );
}
