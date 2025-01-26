import { WebSocket, WebSocketServer } from "ws";
import { randomInt, randomUUID } from "crypto";
import { type ClientMessage, type GameSummary, type Room, type ServerMessage } from "shared/types";
import { ClientMessageEnum, RoomStatus, ServerMessageEnum } from "../shared/enums";

interface Server extends WebSocketServer {
  clients: Set<Socket>;
}

interface Socket extends WebSocket {
  id: string;
  roomId: string;
}

const port = 3000;
const minPlayers = 2;
const maxPlayers = 8;
const numActionsPerTurn = 2;
const winningReputation = 10;

const wss = new WebSocketServer({ port }) as Server;
const rooms: { [roomId: string]: Room } = {};

wss.on("connection", (ws: Socket) => {
  ws.id = randomUUID();
  console.info(`Client ${ws.id} connected`);

  ws.on("message", (message) => {
    const data: ClientMessage = JSON.parse(message.toString());
    switch (data.type) {
      case ClientMessageEnum.JoinRoomRequest:
        handleJoinRoom(ws, data.roomId, data.playerName);
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
console.info(`The WebSocket server is running on port ${port}`);

const validateJoinRoomInput = (room: Room, playerId: string): string => {
  const roomId = room.roomId;
  if (room.status !== RoomStatus.Open) {
    console.error(`Player ${playerId} attempted to join room ${roomId} but the room doesn't exist`);
    return "The room is currently not open.";
  }

  const playerIds = room.players.map((player) => player.playerId);
  if (playerIds.includes(playerId)) {
    console.error(`Player ${playerId} attempted to join room ${roomId} but is already in the room`);
    return "You are already in the room.";
  }

  return "";
};

const handleJoinRoom = (ws: Socket, roomId: string, playerName: string): void => {
  let room: Room;
  if (rooms[roomId]) {
    room = rooms[roomId];
  } else {
    room = {
      roomId: roomId,
      status: RoomStatus.Open,
      players: [],
    };
    rooms[roomId] = room;
    console.info(`Created room ${roomId}`);
  }
  const playerId = ws.id;

  const error = validateJoinRoomInput(room, playerId);
  if (error) {
    sendMessage(ws, { type: ServerMessageEnum.Fail, error });
    return;
  }

  ws.roomId = roomId;
  room.players.push({
    playerId: playerId,
    playerName: playerName,
    reputation: 0,
  });
  console.info(`Player ${playerName} (${playerId}) joined room ${roomId}`);

  sendMessage(ws, { type: ServerMessageEnum.CreateRoom, room });
  broadcastMessageToRoom(room, { type: ServerMessageEnum.UpdateRoom, room });
};

const validateStartGameInput = (roomId: string, playerId: string): string => {
  const room = rooms[roomId];
  if (!room) {
    console.error(`Player ${playerId} attempted to start game in room ${roomId} but the room doesn't exist`);
    return "The room does not exist.";
  }

  if (room.status !== RoomStatus.Open) {
    console.error(`Player ${playerId} attempted to start game in room ${roomId} but the game is in progress`);
    return "The game is already in progress.";
  }

  const playerIds = room.players.map((player) => player.playerId);
  if (!playerIds.includes(playerId)) {
    console.error(`Player ${playerId} attempted to start game in room ${roomId} but they are not in it`);
    return "You are not in the room.";
  }

  const numPlayers = playerIds.length;
  if (numPlayers < minPlayers || numPlayers > maxPlayers) {
    console.error(`Player ${playerId} attempted to start game in room ${roomId} with ${numPlayers} player(s)`);
    return `The game can't be started with ${numPlayers} players. There must be between ${minPlayers} and ${maxPlayers} players.`;
  }

  return "";
};

const handleStartGame = (ws: Socket, roomId: string): void => {
  const playerId = ws.id;
  const error = validateStartGameInput(roomId, playerId);
  if (error) {
    sendMessage(ws, { type: ServerMessageEnum.Fail, error });
    return;
  }

  const room = rooms[roomId]!;
  room.status = RoomStatus.InProgress;
  const game = {
    turnCount: 0,
    actionsLeft: numActionsPerTurn,
  };
  room.game = game;
  const playerIdx = room.players.findIndex((player) => player.playerId === playerId);
  const playerName = room.players[playerIdx]?.playerName;
  console.info(`Player ${playerName} (${playerId}) started game in room ${roomId}`);

  broadcastMessageToRoom(room, { type: ServerMessageEnum.CreateGame, game });
};

const validateMakeTurnInput = (roomId: string, playerId: string): string => {
  const room = rooms[roomId];
  if (!room) {
    console.error(`Player ${playerId} attempted to make a turn in room ${roomId} but the room doesn't exist`);
    return "The room does not exist.";
  }

  const { status, players, game } = room;
  if (status !== RoomStatus.InProgress) {
    console.error(`Player ${playerId} attempted to make a turn in room ${roomId} but the game is not in progress`);
    return "The game is already in progress.";
  }

  const playerIds = players.map((player) => player.playerId);
  if (!playerIds.includes(playerId)) {
    console.error(`Player ${playerId} attempted to make a turn in room ${roomId} but they are not in it`);
    return "You are not in the room.";
  }

  const currentPlayerId = players[game!.turnCount % players.length]?.playerId;
  if (playerId !== currentPlayerId) {
    console.error(`Player ${playerId} attempted to make a turn in room ${roomId} but it is not their turn`);
    return "It's not your turn.";
  }

  return "";
};

const checkGameOver = (room: Room): GameSummary | undefined => {
  const winners = room.players.filter((player) => player.reputation >= winningReputation);
  if (winners.length === 0) {
    return undefined;
  }
  return { winner: winners[0]!.playerName, players: JSON.parse(JSON.stringify(room.players)) };
};

const handleMakeTurn = (ws: Socket, roomId: string) => {
  const playerId = ws.id;
  const error = validateMakeTurnInput(roomId, playerId);
  if (error) {
    sendMessage(ws, { type: ServerMessageEnum.Fail, error });
    return;
  }

  const room = rooms[roomId]!;
  const playerIdx = room.players.findIndex((player) => player.playerId === playerId);
  const playerName = room.players[playerIdx]?.playerName;
  room.game!.turnCount++;
  room.players[playerIdx]!.reputation += randomInt(1, 4);
  console.info(`Player ${playerName} (${playerId}) made a turn`);

  broadcastMessageToRoom(room, { type: ServerMessageEnum.UpdateRoom, room });

  const gameSummary = checkGameOver(room);
  if (gameSummary) {
    room.status = RoomStatus.Open;
    room.players.map((player) => {
      player.reputation = 0;
    });
    delete room.game;
    console.info(`Player ${playerName} (${playerId}) won the game in room ${roomId}, reset room`);

    broadcastMessageToRoom(room, { type: ServerMessageEnum.DeleteGame, gameSummary });
  }
};

const handleClientDisconnect = (ws: Socket) => {
  const roomId = ws.roomId;
  if (!roomId) {
    return;
  }

  const room = rooms[roomId];
  if (!room) {
    return;
  }

  const playerId = ws.id;
  const playerIdx = room.players.findIndex((player) => player.playerId === playerId);
  const playerName = room.players[playerIdx]?.playerName;
  switch (room.status) {
    case RoomStatus.Open:
      room.players.splice(playerIdx, 1);
      console.info(`Player ${playerName} (${playerId}) disconnected from room ${roomId}`);
      broadcastMessageToRoom(room, { type: ServerMessageEnum.UpdateRoom, room });

      if (room.players.length === 0) {
        delete rooms[roomId];
        console.info(`No more players in room ${roomId}, deleted room`);
        broadcastMessageToRoom(room, {
          type: ServerMessageEnum.DeleteRoom,
          error: "No more players in the room.",
        });
      }
      break;
    case RoomStatus.InProgress:
      delete rooms[roomId];
      console.error(
        `Player ${playerName} (${playerId}) disconnected from room ${roomId} while game was in progress, deleted room`,
      );
      broadcastMessageToRoom(room, {
        type: ServerMessageEnum.DeleteRoom,
        error: "Another player left while the game was in progress.",
      });
      break;
  }
};

const sendMessage = (socket: Socket, message: ServerMessage) => {
  socket.send(JSON.stringify(message));
};

const broadcastMessageToRoom = (room: Room, message: ServerMessage) => {
  const playerIds = room.players.map((player) => player.playerId);
  wss.clients.forEach((client) => {
    if (playerIds.includes(client.id) && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};
