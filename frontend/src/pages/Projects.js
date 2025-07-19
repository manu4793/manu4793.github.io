import React, { useEffect, useState } from "react";

const localProjects = [
  {
    name: "Chess Game",
    description: "A React chess game powered by Stockfish AI, featuring sound effects, hint arrows, evaluation bar, and local play.",
    demo: "/chessdemo",  // or whatever your route is
    image: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg", // <-- Use the exact filename!
    tech: ["React", "Stockfish", "Howler", "react-chessboard"],
    github: "https://github.com/manu4793/personal-webpage",
  },
  {
    name: "Stock Price Predictor",
    description: "LSTM-powered stock prediction app with FastAPI backend and React frontend.",
    demo: "/stockpredictor",
    github: "https://github.com/manu4793/manu4793.github.io/tree/main/backend",
    tech: ["React", "FastAPI", "TensorFlow", "Chart.js"],
    image: "https://uploads.dailydot.com/2024/09/Stonks-Meme.jpg", // optional
  },
  {
    name: "Tic Tac Toe Game",
    description: "A React + Django powered Tic Tac Toe game with persistent state and leaderboard.",
    demo: "/tictactoe", // Internal route (opens in same tab)
    github: "https://github.com/yourusername/tictactoe",
    tech: ["React", "Django", "REST API"],
    image: "https://upload.wikimedia.org/wikipedia/commons/3/32/Tic_tac_toe.svg",
  },
  {
    name: "Weather Dashboard",
    description: "Check the weather for any city in real-time using the OpenWeatherMap API.",
    demo: "/weather",
    github: "https://github.com/yourusername/weather-dashboard",
    tech: ["React", "Bootstrap", "API"],
    image: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
  },
  {
    name: "Game Recorder App",
    description: "A Python/Tkinter desktop app for managing multi-player tabletop game sessions (like D&D) with session tracking, summary export, and a modern UI.",
    github: "https://github.com/yourusername/game-recorder",
    download: "/game_recorder.py",
    tech: ["Python", "Tkinter", "PIL"],
    image: "https://cdn-icons-png.flaticon.com/512/616/616494.png", // D20 dice 
  },
  
];

export default function Projects() {
  const [githubProjects, setGithubProjects] = useState([]);
  
  useEffect(() => {
    fetch("https://api.github.com/users/manu4793/repos")
      .then((res) => res.json())
      .then((data) => {
        const repos = data
          .filter((repo) => !repo.fork) // Ignore forks
          .map((repo) => ({
            name: repo.name,
            description: repo.description || "No description provided.",
            github: repo.html_url,
            download: null,
            demo: null, // You can set a URL here if you have a live demo online
            tech: [], // Could parse topics here if you want
            image: "https://cdn-icons-png.flaticon.com/512/25/25231.png", // GitHub logo as default
          }));
        setGithubProjects(repos);
      })
      .catch((err) => {
        console.error("Failed to fetch GitHub repos:", err);
      });
  }, []);

  const allProjects = [...localProjects, ...githubProjects];

  return (
    <div className="container my-4">
      <h1 className="my-4">Projects</h1>
      <div className="row">
        {allProjects.map((proj, idx) => (
          <div className="col-md-6 mb-4" key={idx}>
            <div className="card h-100 shadow-sm">
              {proj.image && (
                <img
                  src={proj.image}
                  alt={proj.name}
                  className="card-img-top"
                  style={{ maxHeight: 220, objectFit: "cover" }}
                />
              )}
              <div className="card-body d-flex flex-column">
                <h4 className="card-title">{proj.name}</h4>
                <p className="card-text flex-grow-1">{proj.description}</p>
                <div className="mb-2">
                  {proj.tech?.map((t, i) => (
                    <span className="badge bg-secondary me-1" key={i}>
                      {t}
                    </span>
                  ))}
                </div>
                <div>
                  {proj.github && (
                    <a
                      className="btn btn-outline-dark btn-sm me-2"
                      href={proj.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>
                  )}
                  {proj.download && (
                    <a
                      className="btn btn-outline-success btn-sm me-2"
                      href={proj.download}
                      download
                    >
                      Download
                    </a>
                  )}
                    {proj.demo && (
                      <a
                        className="btn btn-outline-primary btn-sm"
                        href={proj.demo}
                        target={proj.demo.startsWith("http") ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                      >
                        Live Demo
                      </a>
                    )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}