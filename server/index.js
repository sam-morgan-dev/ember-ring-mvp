const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const UNIT_POOL = [
  { id: 1, name: "Knight", hp: 10, atk: 3 },
  { id: 2, name: "Archer", hp: 6, atk: 4 },
  { id: 3, name: "Mage", hp: 5, atk: 5 },
  { id: 4, name: "Paladin", hp: 8, atk: 2 },
  { id: 5, name: "Rogue", hp: 6, atk: 4 },
  { id: 6, name: "Golem", hp: 12, atk: 2 },
];

const rooms = {};

io.on("connection", (socket) => {
  socket.on("join", ({ room }) => {
    if (!rooms[room]) {
      rooms[room] = {
        players: [],
        units: { pool: [...UNIT_POOL], p1: [], p2: [] },
        grid: Array(9).fill(null),
        phase: "draft",
        currentPlayer: "p1",
      };
    }
    const roomData = rooms[room];
    if (roomData.players.length >= 2) return;

    const playerId = roomData.players.length === 0 ? "p1" : "p2";
    roomData.players.push({ id: socket.id, role: playerId });
    socket.join(room);
    socket.emit("joined", { playerId });
    io.to(room).emit("state", roomData);
  });

  socket.on("draft", ({ room, unitId }) => {
    const game = rooms[room];
    const unit = game.units.pool.find(u => u.id === unitId);
    if (!unit || game.phase !== "draft") return;

    game.units[game.currentPlayer].push(unit);
    game.units.pool = game.units.pool.filter(u => u.id !== unitId);
    game.currentPlayer = game.currentPlayer === "p1" ? "p2" : "p1";

    if (game.units.p1.length === 3 && game.units.p2.length === 3) {
      game.phase = "battle";
    }

    io.to(room).emit("state", game);
  });

  socket.on("deploy", ({ room, index }) => {
    const game = rooms[room];
    if (game.phase !== "battle" || game.grid[index]) return;

    const unit = game.units[game.currentPlayer].shift();
    if (!unit) return;

    game.grid[index] = { ...unit, owner: game.currentPlayer };
    game.currentPlayer = game.currentPlayer === "p1" ? "p2" : "p1";

    io.to(room).emit("state", game);
  });
});

server.listen(3001, () => console.log("Server listening on port 3001"));
