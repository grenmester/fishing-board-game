const LobbyScreen = ({
  playerName,
  setPlayerName,
  roomId,
  setRoomId,
  joinRoom,
}: {
  playerName: string;
  setPlayerName: (playerName: string) => void;
  roomId: string;
  setRoomId: (roomId: string) => void;
  joinRoom: () => void;
}) => {
  return (
    <div>
      <h2>Lobby</h2>
      <label>
        Player Name:
        <input
          onChange={(e) => {
            setPlayerName(e.target.value);
          }}
          placeholder="Enter your name"
          type="text"
          value={playerName}
        />
      </label>
      <label>
        Room ID:
        <input
          onChange={(e) => {
            setRoomId(e.target.value);
          }}
          placeholder="Enter the room ID"
          type="text"
          value={roomId}
        />
      </label>
      <button onClick={joinRoom}>Join Game</button>
    </div>
  );
};

export default LobbyScreen;
