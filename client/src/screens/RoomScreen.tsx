import type { GameSummary, PlayerProfile } from "shared/types";
import { ClientMessageType } from "../../../shared/types";

interface RoomScreenProps {
  playerId: string;
  roomId: string;
  playerProfiles: Record<string, PlayerProfile>;
  gameSummary: GameSummary | undefined;
  sendMessage: (message: string) => void;
}

const RoomScreen = ({ playerId, roomId, playerProfiles, gameSummary, sendMessage }: RoomScreenProps) => {
  const startGame = () => {
    sendMessage(
      JSON.stringify({
        type: ClientMessageType.StartGame,
      }),
    );
  };

  return (
    <main className="flex flex-col gap-10 items-center">
      <p>Waiting for players to join</p>
      <div className="text-center">
        <p>
          <span className="font-bold">Player Name:</span> {playerProfiles[playerId]?.playerName}
        </p>
        <p>
          <span className="font-bold">Room ID:</span> {roomId}
        </p>
      </div>
      {gameSummary && (
        <div className="p-4 w-full max-w-4xl bg-cyan-300 rounded-xl">
          <h2 className="font-bold text-center">Game Summary</h2>
          <pre>{JSON.stringify(gameSummary, null, 2)}</pre>
        </div>
      )}
      <div className="flex flex-wrap gap-10 justify-center max-w-4xl">
        {Object.entries(playerProfiles).map(([key, { playerName }]) => (
          <div className="flex flex-col gap-2 items-center p-4 w-40 bg-amber-300 rounded-4xl" key={key}>
            <img className="size-20" src="favicon.png" />
            <span className="overflow-hidden w-full text-center overflow-ellipsis text-nowrap">{playerName}</span>
          </div>
        ))}
      </div>
      <button
        className="py-1 px-4 mx-auto text-white bg-amber-500 rounded-xl hover:bg-amber-600 w-fit"
        onClick={startGame}
      >
        Start Game
      </button>
    </main>
  );
};

export default RoomScreen;
