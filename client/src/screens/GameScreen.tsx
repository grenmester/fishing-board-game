import { useState } from "react";

import {
  ActionCard,
  ActionType,
  Location,
  type Action,
  type ActionCardInput,
  type BorrowGearActionCardInput,
  type BorrowMoneyActionCardInput,
  type Game,
  type PlayerProfile,
} from "../../../shared/types";

interface GameScreenProps {
  playerName: string;
  roomId: string;
  playerProfiles: Record<string, PlayerProfile>;
  playerId: string;
  game: Game;
  makeTurn: (action: Action) => void;
}

const GameScreen = ({ playerName, roomId, playerProfiles, playerId, game, makeTurn }: GameScreenProps) => {
  const [location, setLocation] = useState<Location>(Location.Lake);
  const [fishIdx, setFishIdx] = useState(0);
  const [marketIdx, setMarketIdx] = useState(0);
  const [gearIdx, setGearIdx] = useState(0);
  const [actionCardIdx, setActionCardIdx] = useState<number>();
  const [actionCardInput, setActionCardInput] = useState<Partial<ActionCardInput>>();

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
      <p>Location: {location}</p>
      <p>Fishing Attempts Made: {game.fishingAttempts}</p>
      <p>Player List: {JSON.stringify(playerProfiles, null, 2)}</p>
      <p>Game State: </p>
      <pre>{JSON.stringify(game, null, 2)}</pre>
      <p>
        Locations:
        {game.turnConfig.allowedLocations.map((allowedLocation) => (
          <label key={allowedLocation}>
            <input
              type="radio"
              value={allowedLocation}
              checked={location === allowedLocation}
              onChange={(e) => {
                setLocation(e.target.value as Location);
              }}
            />
            {allowedLocation}
          </label>
        ))}
        <button
          onClick={() => {
            makeTurn({
              actionType: ActionType.SetLocation,
              location,
            });
          }}
        >
          Set Location
        </button>
        {game.fishingAttempts < game.turnConfig.allowedFishingAttempts && (
          <button
            onClick={() => {
              makeTurn({ actionType: ActionType.CatchFish });
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
        {game.market.map((gear, idx) => (
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
        <button
          onClick={() => {
            makeTurn({ actionType: ActionType.RefreshMarket });
          }}
        >
          Refresh Market
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
      {player.actionCards.length > 0 && (
        <p>
          Action Cards:
          {player.actionCards.map((actionCard, idx) => (
            <label key={`${actionCard}${idx.toString()}`}>
              <input
                type="radio"
                value={idx}
                checked={actionCardIdx === idx}
                onChange={(e) => {
                  setActionCardIdx(parseInt(e.target.value));
                  setActionCardInput({ actionCard });
                }}
              />
              {actionCard}
            </label>
          ))}
          <br />
          {actionCardIdx !== undefined && player.actionCards[actionCardIdx] === ActionCard.BorrowGear && (
            <>
              {Object.keys(game.players).map((playerId) => (
                <label key={playerId}>
                  <input
                    type="radio"
                    value={playerId}
                    checked={(actionCardInput as BorrowGearActionCardInput).playerId === playerId}
                    onChange={(e) => {
                      setActionCardInput({
                        actionCard: ActionCard.BorrowGear,
                        playerId: e.target.value,
                      });
                    }}
                  />
                  {playerId}
                </label>
              ))}
              <br />
              {actionCardInput &&
                "playerId" in actionCardInput &&
                game.players[actionCardInput.playerId]?.gearList.map((gear, idx) => (
                  <label key={idx}>
                    <input
                      type="radio"
                      value={idx}
                      checked={(actionCardInput as BorrowGearActionCardInput).gearIdx === idx}
                      onChange={(e) => {
                        setActionCardInput((actionCardInput) => ({
                          ...(actionCardInput as BorrowGearActionCardInput),
                          gearIdx: parseInt(e.target.value),
                        }));
                      }}
                    />
                    {gear}
                  </label>
                ))}
            </>
          )}
          {actionCardIdx !== undefined &&
            player.actionCards[actionCardIdx] === ActionCard.BorrowMoney &&
            Object.keys(game.players).map((playerId) => (
              <label key={playerId}>
                <input
                  type="radio"
                  value={playerId}
                  checked={(actionCardInput as BorrowMoneyActionCardInput).playerId === playerId}
                  onChange={(e) => {
                    setActionCardInput((actionCardInput) => ({
                      ...(actionCardInput as BorrowMoneyActionCardInput),
                      playerId: e.target.value,
                    }));
                  }}
                />
                {playerId}
              </label>
            ))}
          {actionCardIdx !== undefined &&
            player.actionCards[actionCardIdx] === ActionCard.BorrowMoneyFromAll &&
            "nothing to show"}
          <br />
          {actionCardIdx !== undefined && (
            <button
              onClick={() => {
                makeTurn({
                  actionType: ActionType.PlayActionCard,
                  actionCardIdx,
                  actionCardInput: actionCardInput as ActionCardInput,
                });
              }}
            >
              Play Action Card
            </button>
          )}
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
