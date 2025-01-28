import { useState } from "react";
import { type Action, ActionType, type Game, type PlayerProfile, Location } from "../../shared/types";

const GameScreen = ({
  playerName,
  roomId,
  playerProfiles,
  playerId,
  game,
  makeTurn,
}: {
  playerName: string;
  roomId: string;
  playerProfiles: Record<string, PlayerProfile>;
  playerId: string;
  game: Game;
  makeTurn: (action: Action) => void;
}) => {
  const [location, setLocation] = useState<Location>(Location.Lake);
  // const [turnIdx, setTurnIdx] = useState<number>();

  return (
    <div>
      <h2>Game</h2>
      <p>Player Name: {playerName}</p>
      <p>Player ID: {playerId}</p>
      <p>Room ID: {roomId}</p>
      <p>Player List: {JSON.stringify(playerProfiles, null, 2)}</p>
      <p>Game State: </p>
      <pre>{JSON.stringify(game, null, 2)}</pre>
      <label>
        <input
          type="radio"
          value={Location.Lake}
          checked={location === Location.Lake}
          onChange={(e) => setLocation(e.target.value as Location)}
        />
        Lake
      </label>
      <label>
        <input
          type="radio"
          value={Location.Pier}
          checked={location === Location.Pier}
          onChange={(e) => setLocation(e.target.value as Location)}
        />
        Pier
      </label>
      {game.actionsLeft > 0 && (
        <button
          onClick={() =>
            makeTurn({
              actionType: ActionType.CatchFish,
              location,
            })
          }
        >
          Catch Fish
        </button>
      )}
      <button onClick={() => makeTurn({ actionType: ActionType.EndTurn })}>End Turn</button>
    </div>
  );
};

export default GameScreen;
