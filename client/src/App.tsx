import { useEffect, useRef, useState } from "react";
import { ClientMessageEnum, ServerMessageEnum } from "../../shared/enums";
import type { Game, GameSummary, Player, ServerMessage } from "shared/types";
import LobbyScreen from "./LobbyScreen";
import RoomScreen from "./RoomScreen";
import GameScreen from "./GameScreen";

const App = () => {
  const [playerName, setPlayerName] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  const [screen, setScreen] = useState<"Lobby" | "Room" | "Game">("Lobby");
  const [players, setPlayers] = useState<Player[]>([]);
  const [game, setGame] = useState<Game>();
  const [gameSummary, setGameSummary] = useState<GameSummary>();
  const [debugString, setDebugString] = useState<string>("");

  const [error, setError] = useState<string>();

  const wsRef = useRef<WebSocket>();

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");
    wsRef.current = ws;

    ws.onmessage = (e: MessageEvent<string>) => {
      setError(undefined);
      const data = JSON.parse(e.data) as ServerMessage;
      switch (data.type) {
        case ServerMessageEnum.Fail:
          setError(data.error);
          break;
        case ServerMessageEnum.CreateRoom:
          setScreen("Room");
          setPlayers(data.room.players);
          break;
        case ServerMessageEnum.UpdateRoom:
          setPlayers(data.room.players);
          break;
        case ServerMessageEnum.DeleteRoom:
          setScreen("Lobby");
          setPlayers([]);
          setError(data.error);
          break;
        case ServerMessageEnum.CreateGame:
          setScreen("Game");
          setGame(data.game);
          break;
        case ServerMessageEnum.UpdateGame:
          setGame(data.game);
          break;
        case ServerMessageEnum.DeleteGame:
          setScreen("Room");
          setGameSummary(data.gameSummary);
          break;
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const joinRoom = () => {
    wsRef.current?.send(
      JSON.stringify({
        type: ClientMessageEnum.JoinRoomRequest,
        playerName: playerName,
        roomId: roomId,
      }),
    );
  };

  const startGame = () => {
    wsRef.current?.send(
      JSON.stringify({
        type: ClientMessageEnum.StartGameRequest,
        roomId: roomId,
      }),
    );
  };

  const makeTurn = () => {
    wsRef.current?.send(
      JSON.stringify({
        type: ClientMessageEnum.MakeTurnRequest,
        roomId: roomId,
      }),
    );
  };

  return (
    <div>
      <h1>Fishing Board Game</h1>
      {screen === "Lobby" && (
        <LobbyScreen
          playerName={playerName}
          setPlayerName={setPlayerName}
          roomId={roomId}
          setRoomId={setRoomId}
          joinRoom={joinRoom}
        />
      )}
      {screen === "Room" && (
        <RoomScreen
          playerName={playerName}
          roomId={roomId}
          players={players}
          gameSummary={gameSummary}
          startGame={startGame}
        />
      )}
      {screen === "Game" && (
        <GameScreen
          playerName={playerName}
          roomId={roomId}
          players={players}
          game={game}
          makeTurn={makeTurn}
        />
      )}
      {error && <p>Error: {error}</p>}
      <hr />
      <p>Websockets Debug Console</p>
      <textarea onChange={(e) => setDebugString(e.target.value)} placeholder="WebSocket message" />
      <br />
      <button onClick={() => wsRef.current?.send(debugString)}>Send WebSocket Message</button>
    </div>
  );
};

export default App;
