import { WebSocket, WebSocketServer } from "ws";
import * as crypto from "crypto";
import {
  type ClientMessage,
  type GameState,
  type RoomState,
  type ServerMessage,
} from "shared/types";
import {
  ClientMessageEnum,
  RoomStatus,
  ServerMessageEnum,
} from "../shared/enums";

const wss = new WebSocketServer({ port: 3000 }) as Server;
const rooms: { [roomId: string]: RoomState } = {};

wss.on("connection", (ws: Socket) => {
  ws.id = crypto.randomUUID();
  console.info(`Client ${ws.id} connected`);

  ws.on("message", (message) => {
    const data: ClientMessage = JSON.parse(message.toString());

    switch (data.type) {
      case ClientMessageEnum.JoinRoomRequest:
        handleJoinRoom(ws, data.playerName, data.roomId);
        break;
      case ClientMessageEnum.StartGameRequest:
        handleStartGame(ws, data.roomId);
        break;
      case ClientMessageEnum.MakeTurnRequest:
        handleMakeTurn(ws, data.roomId);
        break;
    }
  });

  ws.on("close", () => {
    console.info(`Client ${ws.id} disconnected`);
    handleClientDisconnect(ws);
  });
});

const handleJoinRoom = (ws: Socket, playerName: string, roomId: string) => {
  const playerId = ws.id;
  let room: RoomState;
  if (rooms[roomId]) {
    room = rooms[roomId];
  } else {
    room = {
      status: RoomStatus.Open,
      players: {},
    };
    rooms[roomId] = room;
    console.info(`Created room ${roomId}`);
  }

  if (room.status !== RoomStatus.Open) {
    sendMessage(ws, {
      type: ServerMessageEnum.JoinRoomFailure,
      error: "Room not open",
    });
    console.error(
      `Player ${playerName} (${playerId}) was denied access to room ${roomId}`,
    );
    return;
  }

  const playerIds = new Set(Object.keys(room.players));

  if (playerIds.has(playerId)) {
    sendMessage(ws, {
      type: ServerMessageEnum.JoinRoomFailure,
      error: "Already in room",
    });
    console.error(
      `Player ${playerName} (${playerId}) is already in room ${roomId}`,
    );
  }

  room.players[playerId] = playerName;
  ws.roomId = roomId;

  sendMessage(ws, { type: ServerMessageEnum.CreateRoom, roomState: room });
  broadcastMessageToClientIds(playerIds, {
    type: ServerMessageEnum.UpdateRoom,
    roomState: room,
  });
  console.info(`Player ${playerName} (${playerId}) joined room ${roomId}`);
};

const handleStartGame = (ws: Socket, roomId: string) => {
  const room = validateRoomExists(ws, roomId);
  if (!room) {
    return;
  }

  if (!validatePlayerInRoom(ws, room)) {
    return;
  }

  if (room.status !== RoomStatus.Open) {
    sendMessage(ws, {
      type: ServerMessageEnum.StartGameFailure,
      error: "Game in progress",
    });
    console.error(`Game in room ${roomId} is already in progress`);
    return;
  }

  const playerIds = Object.keys(room.players);
  const numPlayers = playerIds.length;
  const minPlayers = 2;
  const maxPlayers = 8;
  if (numPlayers < minPlayers || numPlayers > maxPlayers) {
    sendMessage(ws, {
      type: ServerMessageEnum.StartGameFailure,
      error: `Game must have ${minPlayers} to ${maxPlayers} players`,
    });
    console.error(
      `Game with ${numPlayers} player(s) was not started in room ${roomId}`,
    );
    return;
  }

  const gameState: GameState = {
    turnPlayerIndex: 0,
    scores: playerIds.map((id) => [id, 0]),
  };

  rooms[roomId] = {
    status: RoomStatus.InProgress,
    players: room.players,
    gameState,
  };

  broadcastMessageToRoom(room, {
    type: ServerMessageEnum.CreateGame,
    gameState,
  });
  console.info(`Game started in room ${roomId}`);
};

const handleMakeTurn = (ws: Socket, roomId: string) => {
  const room = validateRoomExists(ws, roomId);
  if (!room) {
    return;
  }

  const playerName = validatePlayerInRoom(ws, room);
  if (!playerName) {
    return;
  }

  const playerId = ws.id;

  if (room.status !== RoomStatus.InProgress) {
    sendMessage(ws, {
      type: ServerMessageEnum.MakeTurnFailure,
      error: "Game not in progress",
    });
    console.error(`Game in room ${roomId} is not in progress`);
    return;
  }

  const { turnPlayerIndex, scores } = room.gameState;

  if (playerId !== scores[turnPlayerIndex]?.[0]) {
    sendMessage(ws, {
      type: ServerMessageEnum.MakeTurnFailure,
      error: "It's not your turn.",
    });
    console.error(
      `Player ${playerName} (${playerId}) cannot move in room ${roomId}`,
    );
    return;
  }

  const roll = crypto.randomInt(6) + 1;
  let score = scores[turnPlayerIndex][1] + roll;
  const goal = 21;
  if (score > goal) {
    score -= goal;
  }
  scores[turnPlayerIndex][1] = score;

  const gameState = {
    turnPlayerIndex: (turnPlayerIndex + 1) % scores.length,
    scores,
  };
  room.gameState = gameState;

  broadcastMessageToRoom(room, {
    type: ServerMessageEnum.UpdateGame,
    gameTurn: { playerId, roll },
    gameState,
  });
  console.info(`Player ${playerName} (${playerId}) caught ${roll} fish}`);

  if (score === goal) {
    rooms[roomId] = { status: RoomStatus.Open, players: room.players };
    broadcastMessageToRoom(room, {
      type: ServerMessageEnum.DeleteGame,
      gameSummary: { scores, winner: playerName },
    });
    console.info(`Player ${playerName} (${playerId}) wins!`);
  }
};

const validateRoomExists = (
  ws: Socket,
  roomId: string,
): RoomState | undefined => {
  const room = rooms[roomId];
  if (!room) {
    sendMessage(ws, {
      type: ServerMessageEnum.DeleteRoom,
      error: "Room does not exist",
    });
    console.error(`Room ${roomId} not found`);
  }

  return room;
};

const validatePlayerInRoom = (
  ws: Socket,
  room: RoomState,
): string | undefined => {
  const playerName = room.players[ws.id];
  if (!playerName) {
    sendMessage(ws, {
      type: ServerMessageEnum.StartGameFailure,
      error: "You are not in this room",
    });
    console.error(`No player with id ${ws.id} in room`);
  }

  return playerName;
};

const handleClientDisconnect = (ws: Socket) => {
  if (ws.roomId) {
    const room = rooms[ws.roomId];
    if (!room) {
      return;
    }

    const playerId = room.players[ws.id];
    switch (room.status) {
      case RoomStatus.Open:
        delete room.players[ws.id];
        broadcastMessageToRoom(room, {
          type: ServerMessageEnum.UpdateRoom,
          roomState: room,
        });
        console.info(
          `Player ${playerId} (${ws.id}) disconnected from room ${ws.roomId}`,
        );
        if (Object.keys(room.players).length === 0) {
          broadcastMessageToRoom(room, {
            type: ServerMessageEnum.DeleteRoom,
            error: "No more players",
          });
          delete rooms[ws.roomId];
          console.info(`No more players, deleted room ${ws.roomId}`);
        }
        break;
      case RoomStatus.InProgress:
        broadcastMessageToRoom(room, {
          type: ServerMessageEnum.DeleteRoom,
          error: "Another player left while the game was in progress",
        });
        delete rooms[ws.roomId];
        console.error(
          `Player ${playerId} (${ws.id}) disconnected from in progress game, deleted room ${ws.roomId}`,
        );
        break;
    }
  }
};

const broadcastMessageToRoom = (room: RoomState, message: ServerMessage) => {
  broadcastMessageToClientIds(new Set(Object.keys(room.players)), message);
};

const broadcastMessageToClientIds = (
  clientIds: Set<string>,
  message: ServerMessage,
) => {
  wss.clients.forEach((client) => {
    if (clientIds.has(client.id) && client.readyState === WebSocket.OPEN) {
      sendMessage(client, message);
    }
  });
};

const sendMessage = (socket: Socket, message: ServerMessage) => {
  socket.send(JSON.stringify(message));
};

console.info("WebSocket server is running on ws://localhost:3000");

interface Server extends WebSocketServer {
  clients: Set<Socket>;
}

interface Socket extends WebSocket {
  id: string;
  roomId: string;
}
