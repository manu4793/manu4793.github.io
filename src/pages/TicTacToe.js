import React, { useState, useEffect } from "react";
import axios from "axios";

const initialBoard = Array(9).fill("");

export default function TicTacToe() {
  const [board, setBoard] = useState(initialBoard);
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  function calculateWinner(bd) {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (let [a,b,c] of lines) {
      if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) return bd[a];
    }
    return bd.every(Boolean) ? "Tie" : null;
  }

  function handleClick(idx) {
    if (board[idx] || winner) return;
    const newBoard = board.slice();
    newBoard[idx] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    const win = calculateWinner(newBoard);
    if (win) {
      setWinner(win);
      saveGame(newBoard, win);
    }
    setXIsNext(!xIsNext);
  }

  function resetGame() {
    setBoard(initialBoard);
    setWinner(null);
    setXIsNext(true);
  }

  // --- BACKEND PARTS ---
  async function saveGame(finalBoard, win) {
    setLoading(true);
    try {
      await axios.post("http://localhost:8000/api/tictactoe/games/", {
        player_x: "Player X",
        player_o: "Player O",
        winner: win,
        board: finalBoard,
      });
      fetchGames();
    } catch (err) {
      alert("Could not save game!");
    }
    setLoading(false);
  }

  async function fetchGames() {
    try {
      const res = await axios.get("http://localhost:8000/api/tictactoe/games/");
      setHistory(res.data.slice(0, 5)); // Last 5 games
    } catch (err) {
      setHistory([]);
    }
  }

  // --- UI ---
  return (
    <div className="container mt-4" style={{maxWidth: 480}}>
      <h2>Tic Tac Toe</h2>
      <div className="mb-2">Current: {winner ? (winner === "Tie" ? "Tie!" : `Winner: ${winner}`) : xIsNext ? "X" : "O"}</div>
      <div className="d-flex flex-wrap" style={{width: 180}}>
        {board.map((v,i) =>
          <button key={i}
            className="btn btn-outline-dark m-1"
            style={{width:50, height:50, fontSize:28}}
            onClick={() => handleClick(i)}>
            {v}
          </button>
        )}
      </div>
      <div className="my-3">
        <button className="btn btn-secondary" onClick={resetGame}>Restart</button>
      </div>
      <hr/>
      <h5>Game History</h5>
      {loading && <div>Saving...</div>}
      <ul>
        {history.map(game =>
          <li key={game.id}>
            {game.player_x} vs {game.player_o} – {game.winner}
            <span style={{marginLeft:10, fontFamily:"monospace"}}>
              [{game.board.join("")}]
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}
