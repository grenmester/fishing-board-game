import type { GameSummary, PlayerProfile } from "shared/types";

const RoomScreen = ({
  playerName,
  roomId,
  playerProfiles,
  gameSummary,
  startGame,
}: {
  playerName: string;
  roomId: string;
  playerProfiles: Record<string, PlayerProfile>;
  gameSummary: GameSummary | undefined;
  startGame: () => void;
}) => {
  return (
    <div>
      <h2>Waiting Room</h2>
      <p>Player Name: {playerName}</p>
      <p>Room ID: {roomId}</p>
      <p>Player List: {JSON.stringify(playerProfiles, null, 2)}</p>
      {gameSummary && (
        <>
          <p>Game Summary: </p>
          <pre>{JSON.stringify(gameSummary, null, 2)}</pre>
        </>
      )}
      <button onClick={startGame}>Start Game</button>
    </div>
  );
};

export default RoomScreen;
