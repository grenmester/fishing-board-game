import React, { useEffect, useState } from "react";
import { ClientMessageEnum, ServerMessageEnum } from "../../shared/enums";
import type {
  ClientMessage,
  GameState,
  GameSummary,
  GameTurn,
  Players,
  ServerMessage,
} from "shared/types";
import LobbyScreen from "./LobbyScreen";
import RoomScreen from "./RoomScreen";
import GameScreen from "./GameScreen";

const App = () => {
  const [playerName, setPlayerName] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  const [screen, setScreen] = useState<"Lobby" | "Room" | "Game">("Lobby");
  const [players, setPlayers] = useState<Players>({});
  const [gameState, setGameState] = useState<GameState>();
  const [gameTurn, setGameTurn] = useState<GameTurn>();
  const [gameSummary, setGameSummary] = useState<GameSummary>();

  const [error, setError] = useState<string>();

  const wsRef = React.useRef<WebSocket>();

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");
    wsRef.current = ws;

    ws.onmessage = (e: MessageEvent<string>) => {
      setError(undefined);
      const data = JSON.parse(e.data) as ServerMessage;
      switch (data.type) {
        case ServerMessageEnum.JoinRoomFailure:
        case ServerMessageEnum.StartGameFailure:
        case ServerMessageEnum.MakeTurnFailure:
          setError(data.error);
          break;
        case ServerMessageEnum.CreateRoom:
          setScreen("Room");
          setPlayers(data.roomState.players);
          break;
        case ServerMessageEnum.UpdateRoom:
          setPlayers(data.roomState.players);
          break;
        case ServerMessageEnum.DeleteRoom:
          setScreen("Lobby");
          setPlayers({});
          setError(data.error);
          break;
        case ServerMessageEnum.CreateGame:
          setScreen("Game");
          setGameState(data.gameState);
          break;
        case ServerMessageEnum.UpdateGame:
          setGameState(data.gameState);
          setGameTurn(data.gameTurn);
          break;
        case ServerMessageEnum.DeleteGame:
          setScreen("Room");
          setGameTurn(undefined);
          setGameSummary(data.gameSummary);
          break;
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const joinRoom = () => {
    sendMessage({
      type: ClientMessageEnum.JoinRoomRequest,
      playerName: playerName,
      roomId: roomId,
    });
  };

  const startGame = () => {
    sendMessage({
      type: ClientMessageEnum.StartGameRequest,
      roomId: roomId,
    });
  };

  const makeTurn = () => {
    sendMessage({
      type: ClientMessageEnum.MakeTurnRequest,
      roomId: roomId,
    });
  };

  const sendMessage = (message: ClientMessage) => {
    wsRef.current?.send(JSON.stringify(message));
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
          gameState={gameState}
          gameTurn={gameTurn}
          makeTurn={makeTurn}
        />
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default App;
