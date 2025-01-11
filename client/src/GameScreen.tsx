import type { GameState, GameTurn, RoomState } from "shared/types";

const GameScreen = ({
  playerName,
  roomId,
  players,
  gameState,
  gameTurn,
  makeTurn,
}: {
  playerName: string;
  roomId: string;
  players: RoomState["players"];
  gameState: GameState | undefined;
  gameTurn: GameTurn | undefined;
  makeTurn: () => void;
}) => {
  return (
    <div>
      <h2>Game</h2>
      <p>Player Name: {playerName}</p>
      <p>Room ID: {roomId}</p>
      <p>Player List: {JSON.stringify(players, null, 2)}</p>
      <p>Game State: </p>
      <pre>{JSON.stringify(gameState, null, 2)}</pre>
      <button onClick={makeTurn}>Make Turn</button>
      {gameTurn && (
        <p>
          {gameTurn.playerId} caught {gameTurn.roll} fish
        </p>
      )}
    </div>
  );
};

export default GameScreen;
