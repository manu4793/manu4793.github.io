// src/components/ChessDemo.js
import React, { useState, useEffect, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { Howl } from "howler";
import "./ChessDemo.css";
import { Helmet } from "react-helmet";

const base = process.env.PUBLIC_URL;

const moveSound = new Howl({ src: [`${base}/assets/sounds/move.wav`] });
const captureSound = new Howl({ src: [`${base}/assets/sounds/capture.wav`] });
const checkSound = new Howl({ src: [`${base}/assets/sounds/check.wav`] });
const checkmateSound = new Howl({ src: [`${base}/assets/sounds/checkmate.wav`] });
const startSound = new Howl({ src: [`${base}/assets/sounds/start.wav`] });

const customPieces = {
  wP: ({ squareWidth }) => (
    <img
      style={{ width: squareWidth, height: squareWidth }}
      src={`${base}/assets/images/w_pawn.png`}
      alt="white pawn"
    />
  ),
  wN: ({ squareWidth }) => (
    <img
      style={{ width: squareWidth, height: squareWidth }}
      src={`${base}/assets/images/w_knight.png`}
      alt="white knight"
    />
  ),
  wB: ({ squareWidth }) => (
    <img
      style={{ width: squareWidth, height: squareWidth }}
      src={`${base}/assets/images/w_bishop.png`}
      alt="white bishop"
    />
  ),
  wR: ({ squareWidth }) => (
    <img
      style={{ width: squareWidth, height: squareWidth }}
      src={`${base}/assets/images/w_rook.png`}
      alt="white rook"
    />
  ),
  wQ: ({ squareWidth }) => (
    <img
      style={{ width: squareWidth, height: squareWidth }}
      src={`${base}/assets/images/w_queen.png`}
      alt="white queen"
    />
  ),
  wK: ({ squareWidth }) => (
    <img
      style={{ width: squareWidth, height: squareWidth }}
      src={`${base}/assets/images/w_king.png`}
      alt="white king"
    />
  ),
  bP: ({ squareWidth }) => (
    <img
      style={{ width: squareWidth, height: squareWidth }}
      src={`${base}/assets/images/b_pawn.png`}
      alt="black pawn"
    />
  ),
  bN: ({ squareWidth }) => (
    <img
      style={{ width: squareWidth, height: squareWidth }}
      src={`${base}/assets/images/b_knight.png`}
      alt="black knight"
    />
  ),
  bB: ({ squareWidth }) => (
    <img
      style={{ width: squareWidth, height: squareWidth }}
      src={`${base}/assets/images/b_bishop.png`}
      alt="black bishop"
    />
  ),
  bR: ({ squareWidth }) => (
    <img
      style={{ width: squareWidth, height: squareWidth }}
      src={`${base}/assets/images/b_rook.png`}
      alt="black rook"
    />
  ),
  bQ: ({ squareWidth }) => (
    <img
      style={{ width: squareWidth, height: squareWidth }}
      src={`${base}/assets/images/b_queen.png`}
      alt="black queen"
    />
  ),
  bK: ({ squareWidth }) => (
    <img
      style={{ width: squareWidth, height: squareWidth }}
      src={`${base}/assets/images/b_king.png`}
      alt="black king"
    />
  ),
};

export default function ChessDemo() {
  const chess = useRef(new Chess()).current;
  const [fen, setFen] = useState(chess.fen());
  const fenRef = useRef(fen);
  const [playerColor, setPlayerColor] = useState("white");
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [skillLevel, setSkillLevel] = useState(10);
  const stockfishRef = useRef(null);
  const analysisRef = useRef(null);
  const [status, setStatus] = useState("");
  const [engineReady, setEngineReady] = useState(false);
  const [analysisReady, setAnalysisReady] = useState(false);
  const [history, setHistory] = useState([chess.fen()]);
  const [currentMove, setCurrentMove] = useState(0);
  const currentMoveRef = useRef(currentMove);
  const [evalScore, setEvalScore] = useState(0);
  const [bestMoves, setBestMoves] = useState([]);
  const [boardRenderKey, setBoardRenderKey] = useState(0);
  const currentAnalysisFen = useRef(null);
  const [showBestMove, setShowBestMove] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalHighlights, setLegalHighlights] = useState({});
  const [highlightSquares, setHighlightSquares] = useState({});
  const [gameMode, setGameMode] = useState('vsComputer');
  const playerSide = playerColor[0];
  const [boardWidth, setBoardWidth] = useState(560);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fenRef.current = fen;
  }, [fen]);

  useEffect(() => {
    currentMoveRef.current = currentMove;
  }, [currentMove]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setBoardWidth(Math.min(width - 40, 560));
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const stockfish = new Worker(`${base}/assets/stockfish/stockfish.js`);
    stockfishRef.current = stockfish;

    stockfish.onmessage = (event) => {
      const message = event.data;
      if (message === "readyok") {
        setEngineReady(true);
      } else if (message.startsWith("bestmove")) {
        const bestMove = message.split(" ")[1];
        const from = bestMove.slice(0, 2);
        const to = bestMove.slice(2, 4);
        const promotion = bestMove[4] || undefined;
        const move = { from, to, promotion };
        const result = chess.move(move);
        if (result) {
          playSound(result);
          setFen(chess.fen());
          setHistory((prev) => [...prev.slice(0, currentMoveRef.current + 1), chess.fen()]);
          setCurrentMove((prev) => prev + 1);
          afterFenChange();
        }
      }
    };

    stockfish.postMessage("uci");
    stockfish.postMessage("isready");

    return () => stockfish.terminate();
  }, []);

  useEffect(() => {
    const analysis = new Worker(`${base}/assets/stockfish/stockfish.js`);
    analysisRef.current = analysis;

    analysis.onmessage = (event) => {
      const message = event.data;
      if (message === "readyok") {
        setAnalysisReady(true);
      } else if (message.startsWith("info depth")) {
        if (fenRef.current !== currentAnalysisFen.current) {
          return;
        }
        const parts = message.split(" ");
        const multipvIdx = parts.findIndex((p) => p === "multipv");
        let multipv = 1;
        if (multipvIdx > -1) multipv = parseInt(parts[multipvIdx + 1]);
        const scoreIdx = parts.findIndex((p) => p === "score");
        if (scoreIdx === -1) return;
        const scoreType = parts[scoreIdx + 1];
        let scoreVal = parseInt(parts[scoreIdx + 2]);
        const tempChess = new Chess(fenRef.current);
        if (tempChess.turn() === "b") scoreVal = -scoreVal;
        let scoreForDisplay;
        let evalForSet = scoreVal;
        if (scoreType === "mate") {
          evalForSet = scoreVal > 0 ? 10000 : -10000;
          const mateNum = Math.abs(scoreVal);
          scoreForDisplay = scoreVal > 0 ? `+M${mateNum}` : `-M${mateNum}`;
        } else {
          scoreForDisplay = (scoreVal / 100).toFixed(1);
          evalForSet = scoreVal;
        }
        if (multipv === 1) {
          setEvalScore(evalForSet);
        }
        const pvIdx = parts.findIndex((p) => p === "pv");
        if (pvIdx === -1) return;
        const firstMove = parts[pvIdx + 1];
        const tempChessPv = new Chess(fenRef.current);
        const moveObj = {
          from: firstMove.slice(0, 2),
          to: firstMove.slice(2, 4),
          promotion: firstMove[4] || undefined,
        };
        let result;
        try {
          result = tempChessPv.move(moveObj);
        } catch (e) {
          console.warn("Skipping invalid best move from analysis due to error:", moveObj, e);
          return;
        }
        if (!result) {
          console.warn("Skipping invalid best move from analysis:", moveObj);
          return;
        }
        const lastMove = tempChessPv.undo();
        const san = lastMove.san;
        const isKnight = lastMove.piece === "n";
        setBestMoves((prev) => {
          const newArr = [...prev];
          newArr[multipv - 1] = { san, score: scoreForDisplay, uci: firstMove, isKnight };
          return newArr;
        });
      }
    };

    analysis.postMessage("uci");
    analysis.postMessage("isready");

    return () => analysis.terminate();
  }, []);

  useEffect(() => {
    if (engineReady) {
      stockfishRef.current.postMessage(`setoption name Skill Level value ${skillLevel}`);
    }
    if (analysisReady) {
      analysisRef.current.postMessage(`setoption name Skill Level value ${skillLevel}`);
      analysisRef.current.postMessage("setoption name MultiPV value 3");
    }
  }, [engineReady, analysisReady, skillLevel]);

  useEffect(() => {
    if (selectedSquare) {
      const moves = chess.moves({ square: selectedSquare, verbose: true });
      const styles = {};
      moves.forEach((m) => {
        let style;
        if (m.flags.includes("c") || m.flags.includes("e")) {
          style = {
            background: "radial-gradient(circle, transparent 20%, rgba(128,128,128,0.5) 20%)",
          };
        } else {
          style = {
            background: "radial-gradient(circle, rgba(128,128,128,0.5) 15%, transparent 15%)",
          };
        }
        styles[m.to] = style;
      });
      styles[selectedSquare] = { backgroundColor: "rgba(255, 255, 0, 0.4)" };
      setLegalHighlights(styles);
    } else {
      setLegalHighlights({});
    }
  }, [selectedSquare, fen]);

  useEffect(() => {
    if (currentMove === history.length - 1 && !chess.isGameOver() && analysisReady) {
      analyzePosition();
    }
  }, [fen, currentMove, analysisReady]);

  const getKingSquare = (color) => {
    for (let i = 97; i <= 104; i++) {
      for (let j = 1; j <= 8; j++) {
        const sq = String.fromCharCode(i) + j;
        const piece = chess.get(sq);
        if (piece && piece.type === "k" && piece.color === color) return sq;
      }
    }
    return null;
  };

  const getCheckers = (kingColor) => {
    const kingSq = getKingSquare(kingColor);
    const oppColor = kingColor === "w" ? "b" : "w";
    const checkers = [];
    for (let i = 97; i <= 104; i++) {
      for (let j = 1; j <= 8; j++) {
        const sq = String.fromCharCode(i) + j;
        const piece = chess.get(sq);
        if (piece && piece.color === oppColor) {
          const moves = chess.moves({ square: sq, verbose: true });
          if (moves.some((m) => m.to === kingSq)) {
            checkers.push(sq);
          }
        }
      }
    }
    return checkers;
  };

  const startNewGame = () => {
    chess.reset();
    const initialFen = chess.fen();
    setFen(initialFen);
    setHistory([initialFen]);
    setCurrentMove(0);
    setStatus("");
    setEvalScore(0);
    setBestMoves([]);
    setHighlightSquares({});
    startSound.play();
    setBoardOrientation(playerColor);
    if (gameMode === 'vsComputer' && playerColor === "black" && engineReady) {
      makeAIMove();
    } else {
      afterFenChange();
    }
  };

  const makeAIMove = () => {
    stockfishRef.current.postMessage("ucinewgame");
    stockfishRef.current.postMessage(`position fen ${chess.fen()}`);
    stockfishRef.current.postMessage("go movetime 1000");
  };

  const analyzePosition = () => {
    analysisRef.current.postMessage("stop");
    analysisRef.current.postMessage(`position fen ${fen}`);
    analysisRef.current.postMessage("go movetime 2000");
    currentAnalysisFen.current = fen;
  };

  const afterFenChange = () => {
    updateStatus();
  };

  // UPDATED makePlayerMove: truncates history if not at end before adding move
  const makePlayerMove = (from, to, promotion) => {
    const move = { from, to, promotion };
    let result;
    try {
      result = chess.move(move);
    } catch (e) {
      console.error("Invalid move:", e);
      return false;
    }
    if (result) {
      playSound(result);
      // TRUNCATE history if not at the end before adding new move
      setHistory((prev) => [
        ...prev.slice(0, currentMoveRef.current + 1),
        chess.fen()
      ]);
      setCurrentMove((prev) => prev + 1);
      setFen(chess.fen());
      afterFenChange();
      if (gameMode === 'vsComputer' && !chess.isGameOver() && engineReady) {
        makeAIMove();
      }
      return true;
    }
    return false;
  };

  const onDrop = (source, target) => {
    let promotion;
    const piece = chess.get(source);
    if (
      piece &&
      piece.type === "p" &&
      ((piece.color === "w" && target[1] === "8") ||
        (piece.color === "b" && target[1] === "1"))
    ) {
      promotion = "q";
    }
    const success = makePlayerMove(source, target, promotion);
    return success;
  };

  const onSquareClick = (square) => {
    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      if (square === selectedSquare) {
        setSelectedSquare(null);
      } else {
        setSelectedSquare(square);
      }
    } else if (selectedSquare) {
      let promotion = null;
      const selectedPiece = chess.get(selectedSquare);
      if (
        selectedPiece &&
        selectedPiece.type === "p" &&
        ((selectedPiece.color === "w" && square[1] === "8") ||
          (selectedPiece.color === "b" && square[1] === "1"))
      ) {
        promotion = "q";
      }
      const success = makePlayerMove(selectedSquare, square, promotion);
      if (success) {
        setSelectedSquare(null);
      } else {
        setSelectedSquare(null); // Deselect on invalid move
      }
    }
  };

  const playSound = (move) => {
    if (move.captured) {
      captureSound.play();
    } else {
      moveSound.play();
    }
    if (chess.isCheckmate()) {
      checkmateSound.play();
    } else if (chess.isCheck()) {
      checkSound.play();
    }
  };

  const updateStatus = () => {
    let newStatus = "";
    let highlights = {};
    if (chess.isCheckmate()) {
      newStatus = "Checkmate! " + (chess.turn() === "w" ? "Black wins" : "White wins");
      const matedColor = chess.turn();
      const kingSq = getKingSquare(matedColor);
      const checkers = getCheckers(matedColor);
      if (kingSq) {
        highlights[kingSq] = { backgroundColor: "red" };
      }
      checkers.forEach((sq) => {
        highlights[sq] = { backgroundColor: "green" };
      });
    } else if (chess.isDraw()) {
      newStatus = "Draw!";
    } else if (chess.isCheck()) {
      newStatus = "Check!";
    } else {
      newStatus = "";
    }
    setStatus(newStatus);
    setHighlightSquares(highlights);
    if (chess.isGameOver()) {
      setBestMoves([]);
      setEvalScore(0);
    }
  };

  const handleColorChange = (e) => {
    const color = e.target.value;
    setPlayerColor(color);
    setBoardOrientation(color);
    setBoardRenderKey((prev) => prev + 1); // force re-render
  };

  const handleFlip = () => {
    setBoardOrientation((prev) => (prev === "white" ? "black" : "white"));
    setBoardRenderKey((prev) => prev + 1); // force re-render
  };

  const goBack = () => {
    if (currentMove > 0) {
      const newIndex = currentMove - 1;
      const prevFen = history[newIndex];
      chess.load(prevFen);
      setFen(prevFen);
      setCurrentMove(newIndex);
      afterFenChange();
    }
  };

  const goForward = () => {
    if (currentMove < history.length - 1) {
      const newIndex = currentMove + 1;
      const nextFen = history[newIndex];
      chess.load(nextFen);
      setFen(nextFen);
      setCurrentMove(newIndex);
      afterFenChange();
    }
  };

  const isDraggablePiece = ({ piece }) =>
    gameMode === 'vsPlayer' || piece[0] === playerSide;

  const evalPawns = evalScore / 100;
  const advantage = Math.tanh(evalPawns / 3) * 50;
  const whiteHeight = 50 + advantage;
  const blackHeight = 100 - whiteHeight;

  const evalBarStyle = isMobile
    ? { height: '20px', width: '100%', flexDirection: 'row' }
    : { width: '20px', height: `${boardWidth}px`, flexDirection: 'column' };

  const blackSideStyle = isMobile
    ? { width: `${blackHeight}%`, height: '100%' }
    : { height: `${blackHeight}%` };

  const whiteSideStyle = isMobile
    ? { width: `${whiteHeight}%`, height: '100%' }
    : { height: `${whiteHeight}%` };

  const getArrowPath = () => {
    if (!bestMoves[0]?.uci) return '';
    const uci = bestMoves[0].uci;
    const fromSquare = uci.slice(0, 2);
    const toSquare = uci.slice(2, 4);
    let fromFile = fromSquare.charCodeAt(0) - 'a'.charCodeAt(0);
    let fromRank = 8 - parseInt(fromSquare[1]);
    let toFile = toSquare.charCodeAt(0) - 'a'.charCodeAt(0);
    let toRank = 8 - parseInt(toSquare[1]);
    let fromX = fromFile + 0.5;
    let fromY = fromRank + 0.5;
    let toX = toFile + 0.5;
    let toY = toRank + 0.5;
    if (boardOrientation === 'black') {
      fromX = 7 - fromFile + 0.5;
      fromY = 7 - fromRank + 0.5;
      toX = 7 - toFile + 0.5;
      toY = 7 - toRank + 0.5;
    }
    const dx = toX - fromX;
    const dy = toY - fromY;
    if (!bestMoves[0].isKnight) {
      return `M${fromX} ${fromY} L${toX} ${toY}`;
    }
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const mid = absDx < absDy ? { x: fromX, y: toY } : { x: toX, y: fromY };
    const dmx = mid.x - toX;
    const dmy = mid.y - toY;
    const headLength = Math.sqrt(dmx * dmx + dmy * dmy);
    const arrowReducer = 0.15;
    const knightEndX = mid.x - dmx * (headLength - arrowReducer) / headLength;
    const knightEndY = mid.y - dmy * (headLength - arrowReducer) / headLength;
    return `M${fromX} ${fromY} L${mid.x} ${mid.y} L${knightEndX} ${knightEndY}`;
  };

  useEffect(() => {
    console.log("FEN updated:", fen);
  }, [fen]);

  return (
    <>
      <Helmet>
        <title>Chess Demo</title>
        <meta property="og:title" content="Chess Demo" />
        <meta property="og:description" content="Play chess against Stockfish." />
        <meta property="og:image" content="https://cdn-icons-png.flaticon.com/512/600/600489.png" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
      </Helmet>
    <div className="chess-container">
      <h2>Chess Game vs Stockfish</h2>
      <div className="controls">
        <button onClick={() => {setGameMode('vsPlayer'); startNewGame();}} disabled={!analysisReady}>
          Player vs Player
        </button>
        <button onClick={() => {setGameMode('vsComputer'); startNewGame();}} disabled={!engineReady || !analysisReady}>
          Player vs Computer
        </button>
        {gameMode === 'vsComputer' && (
          <>
            <label>
              Play as:
              <select value={playerColor} onChange={handleColorChange}>
                <option value="white">White</option>
                <option value="black">Black</option>
              </select>
            </label>
            <label>
              Difficulty (0-20):
              <input
                type="number"
                min="0"
                max="20"
                value={skillLevel}
                onChange={(e) => setSkillLevel(parseInt(e.target.value))}
              />
            </label>
          </>
        )}
      </div>
      {!engineReady && <p>Loading Stockfish...</p>}
      <div className="chess-game">
        <div className="eval-bar" style={evalBarStyle}>
          <div className="black-side" style={blackSideStyle} />
          <div className="white-side" style={whiteSideStyle} />
        </div>
        <div className="board" style={{ position: 'relative', width: `${boardWidth}px`, height: `${boardWidth}px` }}>
          <Chessboard
            key={boardRenderKey}
            position={fen}
            onPieceDrop={onDrop}
            onSquareClick={onSquareClick}
            boardOrientation={boardOrientation}
            customPieces={customPieces}
            isDraggablePiece={isDraggablePiece}
            boardWidth={boardWidth}
            showPromotionDialog={false}
            customDragLayerStyles={{ opacity: 1 }}
            customSquareStyles={{ ...legalHighlights, ...highlightSquares }}
            onPieceDragBegin={(piece, sourceSquare) => {
              if (isDraggablePiece({ piece })) {
                setSelectedSquare(sourceSquare);
              }
            }}
            onPieceDragEnd={() => setSelectedSquare(null)}
          />
          {showBestMove && bestMoves[0]?.uci && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
              viewBox="0 0 8 8"
            >
              <defs>
                <marker
                  id="arrowhead"
                  viewBox="0 0 10 10"
                  refX="3"
                  refY="5"
                  markerUnits="strokeWidth"
                  markerWidth="4"
                  markerHeight="3"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="green" opacity="0.7" />
                </marker>
              </defs>
              <path
                d={getArrowPath()}
                stroke="green"
                strokeWidth="0.2"
                strokeLinejoin="round"
                fill="none"
                markerEnd="url(#arrowhead)"
                opacity="0.7"
              />
            </svg>
          )}
        </div>
        <div className="best-moves">
          <h3>Top 3 Moves</h3>
          <ul>
            {bestMoves.filter((m) => m).map((m, i) => (
              <li key={i}>
                {m.san} ({m.score})
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="navigation">
        <button onClick={startNewGame}>Start Game</button>
        <button onClick={goBack} disabled={currentMove <= 0}>
          Back
        </button>
        <button onClick={goForward} disabled={currentMove >= history.length - 1}>
          Next
        </button>
        <button onClick={handleFlip}>Flip Board</button>
        <button onClick={() => setShowBestMove(!showBestMove)}>
          {showBestMove ? "Hide Best Move" : "Show Best Move"}
        </button>
      </div>
      <p className="status">{status}</p>
    </div>
    </>
  );
}
