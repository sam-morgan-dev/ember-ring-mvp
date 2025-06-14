import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://your-render-backend-url.onrender.com");

export default function Game() {
  const [room, setRoom] = useState("");
  const [player, setPlayer] = useState(null);
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    socket.on("joined", ({ playerId }) => setPlayer(playerId));
    socket.on("state", (state) => setGameState(state));
  }, []);

  const joinRoom = () => {
    const roomCode = prompt("Enter room code:");
    if (roomCode) {
      setRoom(roomCode);
      socket.emit("join", { room: roomCode });
    }
  };

  const draftUnit = (unitId) => {
    socket.emit("draft", { room, unitId });
  };

  const deployUnit = (index) => {
    socket.emit("deploy", { room, index });
  };

  if (!room) return <button onClick={joinRoom}>Join Game</button>;

  if (!gameState) return <p>Waiting for opponent...</p>;

  const { phase, units, grid, currentPlayer } = gameState;
  const isMyTurn = currentPlayer === player;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Legends of the Ember Ring</h1>
      <p>Room: {room} | You are: {player}</p>
      <p>Phase: {phase} | {isMyTurn ? "Your Turn" : "Opponent's Turn"}</p>

      {phase === "draft" && (
        <div className="grid grid-cols-3 gap-2 my-4">
          {units.pool.map((unit) => (
            <button
              key={unit.id}
              onClick={() => draftUnit(unit.id)}
              disabled={!isMyTurn}
              className="p-2 border rounded hover:bg-gray-100"
            >
              {unit.name} (HP: {unit.hp}, ATK: {unit.atk})
            </button>
          ))}
        </div>
      )}

      {phase === "battle" && (
        <div className="grid grid-cols-3 gap-1 w-48 my-4">
          {grid.map((cell, i) => (
            <div
              key={i}
              onClick={() => isMyTurn && !cell && deployUnit(i)}
              className="h-16 border flex items-center justify-center cursor-pointer"
            >
              {cell ? `${cell.name} (${cell.owner})` : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
