import type { Game, Player } from "shared/types";

const GameScreen = ({
  playerName,
  roomId,
  players,
  game,
  makeTurn,
}: {
  playerName: string;
  roomId: string;
  players: Player[];
  game: Game | undefined;
  makeTurn: () => void;
}) => {
  return (
    <div>
      <h2>Game</h2>
      <p>Player Name: {playerName}</p>
      <p>Room ID: {roomId}</p>
      <pre>Player List: {JSON.stringify(players, null, 2)}</pre>
      <p>Game State: </p>
      <pre>{JSON.stringify(game, null, 2)}</pre>
      <button onClick={makeTurn}>Make Turn</button>
    </div>
  );
};

export default GameScreen;
