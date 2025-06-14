import React, { useState } from "react";

const UNIT_POOL = [
  { id: 1, name: "Knight", hp: 10, atk: 3 },
  { id: 2, name: "Archer", hp: 6, atk: 4 },
  { id: 3, name: "Mage", hp: 5, atk: 5 },
  { id: 4, name: "Paladin", hp: 8, atk: 2 },
  { id: 5, name: "Rogue", hp: 6, atk: 4 },
  { id: 6, name: "Golem", hp: 12, atk: 2 },
];

const GRID_SIZE = 3;

function DraftPhase({ onComplete }) {
  const [drafted, setDrafted] = useState({ p1: [], p2: [] });
  const [currentPlayer, setCurrentPlayer] = useState("p1");
  const [pool, setPool] = useState([...UNIT_POOL]);

  const draftUnit = (unit) => {
    setDrafted((prev) => ({
      ...prev,
      [currentPlayer]: [...prev[currentPlayer], unit],
    }));
    setPool(pool.filter((u) => u.id !== unit.id));
    setCurrentPlayer(currentPlayer === "p1" ? "p2" : "p1");
  };

  if (drafted.p1.length === 3 && drafted.p2.length === 3) {
    return onComplete(drafted);
  }

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Draft Phase - Player {currentPlayer === "p1" ? "1" : "2"}</h2>
      <div className="grid grid-cols-3 gap-2">
        {pool.map((unit) => (
          <button
            key={unit.id}
            className="p-2 border rounded hover:bg-gray-100"
            onClick={() => draftUnit(unit)}
          >
            {unit.name} (HP: {unit.hp}, ATK: {unit.atk})
          </button>
        ))}
      </div>
    </div>
  );
}

function BattlePhase({ drafted }) {
  const [grid, setGrid] = useState(Array(GRID_SIZE * GRID_SIZE).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState("p1");
  const [units, setUnits] = useState({ ...drafted });

  const deployUnit = (index) => {
    const unit = units[currentPlayer][0];
    if (!unit || grid[index]) return;
    const newGrid = [...grid];
    newGrid[index] = { ...unit, owner: currentPlayer };
    setGrid(newGrid);
    setUnits({
      ...units,
      [currentPlayer]: units[currentPlayer].slice(1),
    });
    setCurrentPlayer(currentPlayer === "p1" ? "p2" : "p1");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Battle Phase - Player {currentPlayer === "p1" ? "1" : "2"}</h2>
      <div className="grid grid-cols-3 gap-1 w-48">
        {grid.map((cell, i) => (
          <div
            key={i}
            className="h-16 border flex items-center justify-center cursor-pointer hover:bg-gray-100"
            onClick={() => deployUnit(i)}
          >
            {cell ? `${cell.name} (${cell.owner})` : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Game() {
  const [phase, setPhase] = useState("draft");
  const [draftedUnits, setDraftedUnits] = useState(null);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Legends of the Ember Ring (MVP)</h1>
      {phase === "draft" && (
        <DraftPhase
          onComplete={(drafted) => {
            setDraftedUnits(drafted);
            setPhase("battle");
          }}
        />
      )}
      {phase === "battle" && draftedUnits && <BattlePhase drafted={draftedUnits} />}
    </div>
  );
}
