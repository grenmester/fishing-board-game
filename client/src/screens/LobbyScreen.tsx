import type { ChangeEvent, Dispatch, SetStateAction } from "react";

interface LobbyScreenProps {
  playerName: string;
  setPlayerName: Dispatch<SetStateAction<string>>;
  roomId: string;
  setRoomId: Dispatch<SetStateAction<string>>;
  joinRoom: () => void;
}

const LobbyScreen = ({ playerName, setPlayerName, roomId, setRoomId, joinRoom }: LobbyScreenProps) => {
  const playerNameHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
  };
  const roomIdHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value);
  };

  return (
    <div>
      <h2>Lobby</h2>
      <label>
        Player Name:
        <input onChange={playerNameHandler} placeholder="Enter your name" type="text" value={playerName} />
      </label>
      <label>
        Room ID:
        <input onChange={roomIdHandler} placeholder="Enter the room ID" type="text" value={roomId} />
      </label>
      <button onClick={joinRoom}>Join Game</button>
    </div>
  );
};

export default LobbyScreen;
