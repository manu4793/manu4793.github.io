import React from 'react';
import '../App.css';
import Resume from './Resume';

export default function Home() {
  return (
    <div className="home-container">
      {/* Container for photo and text */}
      <div className="header-center">
        <img src={process.env.PUBLIC_URL + "/your-photo.jpg"} alt="Manuel Ruiz" className="profile-pic" />
        <div className="header-text">
          <h1>Hi, I'm Manuel Ruiz</h1>
          <div className="subtitle">Software Engineer · Portfolio & Bio</div>
          <a href="mailto:manuelruiz937@outlook.com" className="email-link">manuelruiz937@outlook.com</a>
        </div>
      </div>

      <h2>About Me</h2>
      <p>
        I'm a Software Engineer experienced in Verification and Validation, with expertise in developing 
        automated solutions and enhancing testing efficiency in compliance with rigorous industry standards, including DO-178C. 
        Proficient in object-oriented programming, Python, C++, and Agile methodologies, I excel at solving complex technical challenges 
        through collaborative and innovative approaches. My background in both aerospace software engineering and military communication 
        systems equips me to quickly adapt, learn, and contribute effectively within high-performing, team-oriented environments.
      </p>

      <Resume />
    </div>
  );
}
