import React, { useEffect, useState } from "react";
import type { ClientMessage, Room, ServerMessage } from "shared/types";

const App = () => {
  const [playerName, setPlayerName] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  const [status, setStatus] = useState<string>();
  const [players, setPlayers] = useState<Room["players"]>();
  const [gameState, setGameState] = useState<Room["gameState"]>();

  const [connected, setConnected] = useState(false);
  const [joinGameError, setJoinGameError] = useState<string>();

  const wsRef = React.useRef<WebSocket>();

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");
    wsRef.current = ws;

    ws.onmessage = (e: MessageEvent<string>) => {
      const data = JSON.parse(e.data) as ServerMessage;
      switch (data.type) {
        case "joinGameFailure":
          setJoinGameError(data.error);
          break;
        case "joinGameSuccess":
          setConnected(true);
          break;
        case "updateRoom":
          setStatus(data.roomState.status);
          setPlayers(data.roomState.players);
          setGameState(data.roomState.gameState);
          break;
        case "disconnect":
          setConnected(false);
          setJoinGameError(data.error);
          break;
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const joinGame = () => {
    sendMessage({
      type: "joinGame",
      playerName: playerName,
      roomId: roomId,
    });
  };

  const startGame = () => {
    sendMessage({
      type: "startGame",
      roomId: roomId,
    });
  };

  return (
    <div>
      <h1>Fishing Board Game</h1>
      {!connected ? (
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
          <button onClick={joinGame}>Join Game</button>
          {joinGameError && <p>Error: {joinGameError}</p>}
        </div>
      ) : (
        <div>
          <h2>Waiting Room</h2>
          <p>Player Name: {playerName}</p>
          <p>Room ID: {roomId}</p>
          <p>Status: {status}</p>
          <p>Player List: {JSON.stringify(players, null, 2)}</p>
          <p>Game State: </p>
          <pre>{JSON.stringify(gameState, null, 2)}</pre>
          <button onClick={startGame}>Start Game</button>
        </div>
      )}
    </div>
  );

  function sendMessage(message: ClientMessage) {
    wsRef.current?.send(JSON.stringify(message));
  }
};

export default App;
