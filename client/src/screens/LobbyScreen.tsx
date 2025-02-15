import { useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";

import { ClientMessageType } from "../../../shared/types";

interface LobbyScreenProps {
  roomId: string;
  setRoomId: Dispatch<SetStateAction<string>>;
  sendMessage: (message: string) => void;
}

const LobbyScreen = ({ roomId, setRoomId, sendMessage }: LobbyScreenProps) => {
  const [playerName, setPlayerName] = useState<string>("");

  const playerNameHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
  };

  const roomIdHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value);
  };

  const joinRoom = () => {
    sendMessage(
      JSON.stringify({
        type: ClientMessageType.JoinRoom,
        playerName,
        roomId,
      }),
    );
  };

  return (
    <main>
      <p className="flex justify-center mb-10">
        Welcome to the fishing board game! Enter a name and room ID to join a game.
      </p>
      <div className="flex flex-col gap-2 p-6 mx-auto max-w-sm bg-amber-300 shadow rounded-4xl">
        <label>
          Player Name
          <input
            className="px-1 w-full bg-white rounded"
            onChange={playerNameHandler}
            placeholder="Enter your name"
            type="text"
            value={playerName}
          />
        </label>
        <label>
          Room ID
          <input
            className="px-1 w-full bg-white rounded"
            onChange={roomIdHandler}
            placeholder="Enter the room ID"
            type="text"
            value={roomId}
          />
        </label>
        <button
          className="py-1 px-4 mx-auto text-white bg-amber-500 rounded-xl hover:bg-amber-600 w-fit"
          onClick={joinRoom}
        >
          Join Game
        </button>
      </div>
    </main>
  );
};

export default LobbyScreen;
