import { useEffect, useState } from 'react';

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }

  return null;
}

function indexToRowCol(index) {
  return [Math.floor(index / 3), index % 3];
}

function isAdjacent(from, to) {
  const [fromRow, fromCol] = indexToRowCol(from);
  const [toRow, toCol] = indexToRowCol(to);
  const rowDiff = Math.abs(fromRow - toRow);
  const colDiff = Math.abs(fromCol - toCol);

  return (rowDiff <= 1 && colDiff <= 1) && !(rowDiff === 0 && colDiff === 0);
}

function canMovePiece(squares, player, from, to) {
  if (squares[from] !== player || squares[to] !== null)
    return false;

  if (!isAdjacent(from, to))
    return false;

  const nextSquares = squares.slice();
  nextSquares[from] = null;
  nextSquares[to] = player;
  const wins = calculateWinner(nextSquares) === player;

  // If a piece occupies center, the move must win or vacate center
  if (squares[4] === player && from !== 4 && !wins)
    return false;

  return true;
}

function Board({ xIsNext, squares, onPlay }) {
  const [selectedSquare, setSelectedSquare] = useState(null);

  useEffect(() => {
    setSelectedSquare(null);
  }, [squares, xIsNext]);

  const winner = calculateWinner(squares);
  const player = xIsNext ? 'X' : 'O';
  const playerPieceCount = squares.filter((square) => square === player).length;
  const inPlacementPhase = playerPieceCount < 3;

  function handleClick(i) {
    if (winner)
      return;

    if (inPlacementPhase) {
      if (squares[i])
        return;

      const nextSquares = squares.slice();
      nextSquares[i] = player;
      onPlay(nextSquares);
      return;
    }

    if (selectedSquare === null) {
      if (squares[i] === player)
        setSelectedSquare(i);
      return;
    }

    if (i === selectedSquare) {
      setSelectedSquare(null);
      return;
    }

    if (squares[i] === player) {
      setSelectedSquare(i);
      return;
    }

    if (!canMovePiece(squares, player, selectedSquare, i))
      return;

    const nextSquares = squares.slice();
    nextSquares[selectedSquare] = null;
    nextSquares[i] = player;
    onPlay(nextSquares);
  }

  let status;
  if (winner)
    status = 'Winner: ' + winner;
  else if (inPlacementPhase)
    status = 'Next player: ' + player + ' (place a piece)';
  else if (selectedSquare === null)
    status = 'Next player: ' + player + ' (select a piece to move)';
  else
    status = 'Next player: ' + player + ' (move to an adjacent empty square)';

  return (
    <>
      <div>{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} isSelected={selectedSquare === 0} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} isSelected={selectedSquare === 1} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} isSelected={selectedSquare === 2} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} isSelected={selectedSquare === 3} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} isSelected={selectedSquare === 4} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} isSelected={selectedSquare === 5} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} isSelected={selectedSquare === 6} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} isSelected={selectedSquare === 7} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} isSelected={selectedSquare === 8} />
      </div>
    </>
  );
}

function Square({ value, onSquareClick, isSelected }) {
  return (
    <button
      className="square"
      onClick={onSquareClick}
      style={isSelected ? { outline: '2px solid #2563eb', outlineOffset: '-2px' } : undefined}
    >
      {value}
    </button>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = (currentMove % 2) === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0)
      description = 'Go to move #' + move;
    else
      description = 'Go to game start';
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}