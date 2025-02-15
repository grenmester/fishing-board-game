import { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";

import type { Game, GameSummary, PlayerProfile, ServerMessage } from "shared/types";
import { ServerMessageType } from "../../shared/types";

import DebugConsole from "./components/DebugConsole";
import GameScreen from "./screens/GameScreen";
import LobbyScreen from "./screens/LobbyScreen";
import RoomScreen from "./screens/RoomScreen";

const App = () => {
  const [screen, setScreen] = useState<"Lobby" | "Room" | "Game">("Lobby");
  const [roomId, setRoomId] = useState<string>("");
  const [playerId, setPlayerId] = useState<string>("");
  const [playerProfiles, setPlayerProfiles] = useState<Record<string, PlayerProfile>>({});
  const [game, setGame] = useState<Game>();
  const [gameSummary, setGameSummary] = useState<GameSummary>();
  const [error, setError] = useState<string>("");

  const wsRef = useRef<WebSocket>();

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");
    wsRef.current = ws;

    ws.onmessage = (e: MessageEvent<string>) => {
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

  const closeErrorHandler = () => {
    setError("");
  };

  return (
    <div className="p-4 sm:p-10">
      <h1 className="flex justify-center m-10 text-4xl font-bold text-center">Fishing Board Game</h1>
      {screen === "Lobby" && <LobbyScreen roomId={roomId} setRoomId={setRoomId} sendMessage={sendMessage} />}
      {screen === "Room" && (
        <RoomScreen
          playerId={playerId}
          roomId={roomId}
          playerProfiles={playerProfiles}
          gameSummary={gameSummary}
          sendMessage={sendMessage}
        />
      )}
      {screen === "Game" && game && (
        <GameScreen
          roomId={roomId}
          playerProfiles={playerProfiles}
          playerId={playerId}
          game={game}
          sendMessage={sendMessage}
        />
      )}
      {error && (
        <div className="fixed top-4 right-4">
          <div className="flex gap-4 justify-between items-center py-2 px-4 text-red-500 bg-red-100 rounded-xl border-2 border-red-500">
            <p className="max-w-md">Error: {error}</p>
            <IoMdClose onClick={closeErrorHandler} />
          </div>
        </div>
      )}
      <DebugConsole sendMessage={sendMessage} />
    </div>
  );
};

export default App;
