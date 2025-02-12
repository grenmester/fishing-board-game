import { useEffect, useRef, useState } from "react";

import type { Action, Game, GameSummary, PlayerProfile, ServerMessage } from "shared/types";
import { ClientMessageType, ServerMessageType } from "../../shared/types";

import DebugConsole from "./components/DebugConsole";
import GameScreen from "./screens/GameScreen";
import LobbyScreen from "./screens/LobbyScreen";
import RoomScreen from "./screens/RoomScreen";

const App = () => {
  const [playerName, setPlayerName] = useState<string>("");
  const [playerId, setPlayerId] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  const [screen, setScreen] = useState<"Lobby" | "Room" | "Game">("Lobby");
  const [playerProfiles, setPlayerProfiles] = useState<Record<string, PlayerProfile>>({});
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
        case ServerMessageType.Fail:
          setError(data.error);
          break;
        case ServerMessageType.CreateRoom:
          setScreen("Room");
          setPlayerId(data.playerId);
          setPlayerProfiles(data.room.playerProfiles);
          break;
        case ServerMessageType.UpdateRoom:
          setPlayerProfiles(data.room.playerProfiles);
          break;
        case ServerMessageType.DeleteRoom:
          setScreen("Lobby");
          setPlayerProfiles({});
          setError(data.error);
          break;
        case ServerMessageType.CreateGame:
          setScreen("Game");
          setGame(data.game);
          break;
        case ServerMessageType.UpdateGame:
          setGame(data.game);
          break;
        case ServerMessageType.DeleteGame:
          setScreen("Room");
          setGameSummary(data.gameSummary);
          break;
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = (message: string) => {
    wsRef.current?.send(message);
  };

  const joinRoom = () => {
    wsRef.current?.send(
      JSON.stringify({
        type: ClientMessageType.JoinRoom,
        playerName,
        roomId,
      }),
    );
  };

  const startGame = () => {
    wsRef.current?.send(
      JSON.stringify({
        type: ClientMessageType.StartGame,
      }),
    );
  };

  const makeTurn = (action: Action) => {
    wsRef.current?.send(
      JSON.stringify({
        type: ClientMessageType.MakeTurn,
        action,
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
        playerProfiles={playerProfiles}
        gameSummary={gameSummary}
        startGame={startGame}
      />
      )}
      {screen === "Game" && game && (
        <GameScreen
          playerName={playerName}
          roomId={roomId}
          playerProfiles={playerProfiles}
          playerId={playerId}
          game={game}
          makeTurn={makeTurn}
        />
      )}
      {error && <p>Error: {error}</p>}
      <hr />
      <DebugConsole sendMessage={sendMessage} debugString={debugString} setDebugString={setDebugString} />
    </div>
  );
};

export default App;
