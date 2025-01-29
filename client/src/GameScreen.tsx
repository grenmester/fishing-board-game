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
  const [fishIdx, setFishIdx] = useState(0);
  const [marketIdx, setMarketIdx] = useState(0);
  const [gearIdx, setGearIdx] = useState(0);

  const player = game.players[playerId];
  if (!player) {
    throw Error();
  }

  return (
    <div>
      <h2>Game</h2>
      <p>Player Name: {playerName}</p>
      <p>Player ID: {playerId}</p>
      <p>Room ID: {roomId}</p>
      <p>Player List: {JSON.stringify(playerProfiles, null, 2)}</p>
      <p>Game State: </p>
      <pre>{JSON.stringify(game, null, 2)}</pre>
      <p>
        Locations:
        <label>
          <input
            type="radio"
            value={Location.Lake}
            checked={location === Location.Lake}
            onChange={(e) => {
              setLocation(e.target.value as Location);
            }}
          />
          Lake
        </label>
        <label>
          <input
            type="radio"
            value={Location.Pier}
            checked={location === Location.Pier}
            onChange={(e) => {
              setLocation(e.target.value as Location);
            }}
          />
          Pier
        </label>
        {game.actionsLeft > 0 && (
          <button
            onClick={() => {
              makeTurn({
                actionType: ActionType.CatchFish,
                location,
              });
            }}
          >
            Catch Fish
          </button>
        )}
      </p>
      {player.fishList.length > 0 && (
        <p>
          Fish:
          {player.fishList.map((fish, idx) => (
            <label key={`${fish}${idx.toString()}`}>
              <input
                type="radio"
                value={idx}
                checked={fishIdx === idx}
                onChange={(e) => {
                  setFishIdx(parseInt(e.target.value));
                }}
              />
              {fish}
            </label>
          ))}
          <button
            onClick={() => {
              makeTurn({
                actionType: ActionType.DonateFish,
                fishIdx,
              });
            }}
          >
            Donate Fish
          </button>
          <button
            onClick={() => {
              makeTurn({
                actionType: ActionType.SellFish,
                fishIdx,
              });
            }}
          >
            Sell Fish
          </button>
        </p>
      )}
      <p>
        Market:
        {game.gearList.map((gear, idx) => (
          <label key={`${gear}${idx.toString()}`}>
            <input
              type="radio"
              value={idx}
              checked={marketIdx === idx}
              onChange={(e) => {
                setMarketIdx(parseInt(e.target.value));
              }}
            />
            {gear}
          </label>
        ))}
        <button
          onClick={() => {
            makeTurn({
              actionType: ActionType.BuyGear,
              gearIdx: marketIdx,
            });
          }}
        >
          Buy Gear
        </button>
      </p>
      {player.gearList.length > 0 && (
        <p>
          Gear:
          {player.gearList.map((gear, idx) => (
            <label key={`${gear}${idx.toString()}`}>
              <input
                type="radio"
                value={idx}
                checked={gearIdx === idx}
                onChange={(e) => {
                  setGearIdx(parseInt(e.target.value));
                }}
              />
              {gear}
            </label>
          ))}
          <button
            onClick={() => {
              makeTurn({
                actionType: ActionType.DonateGear,
                gearIdx,
              });
            }}
          >
            Donate Gear
          </button>
        </p>
      )}
      <p>
        <button
          onClick={() => {
            makeTurn({ actionType: ActionType.EndTurn });
          }}
        >
          End Turn
        </button>
      </p>
    </div>
  );
};

export default GameScreen;
