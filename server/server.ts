import { WebSocket, WebSocketServer } from "ws";
import { randomUUID } from "crypto";
import { fishDataRecord, locationDataRecord } from "shared/data";
import {
  ActionType,
  ClientMessageType,
  Fish,
  RoomStatus,
  ServerMessageType,
  type ClientMessage,
  type GamePlayer,
  type GameSummary,
  type InProgressRoom,
  type JoinRoomClientMessage,
  type LocationData,
  type MakeTurnClientMessage,
  type Room,
  type ServerMessage,
} from "shared/types";

interface Server extends WebSocketServer {
  clients: Set<Socket>;
}

interface Socket extends WebSocket {
  playerId: string;
  roomId: string;
}

const PORT = 3000;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;
const ACTIONS_PER_TURN = 2;
const WINNING_REPUTATION = 10;

const wss = new WebSocketServer({ port: PORT }) as Server;
const rooms: Record<string, Room> = {};

wss.on("connection", (ws: Socket) => {
  ws.playerId = randomUUID();
  console.info(`Client ${ws.playerId} connected`);

  ws.on("message", (message) => {
    const data: ClientMessage = JSON.parse(message.toString());
    switch (data.type) {
      case ClientMessageType.JoinRoom:
        handleJoinRoom(ws, data);
        break;
      case ClientMessageType.StartGame:
        handleStartGame(ws);
        break;
      case ClientMessageType.MakeTurn:
        handleMakeTurn(ws, data);
        break;
    }
  });

  ws.on("close", () => {
    console.info(`Client ${ws.playerId} disconnected`);
    handleClientDisconnect(ws);
  });
});
console.info(`The WebSocket server is running on port ${PORT}`);

const validateJoinRoomInput = (room: Room, playerId: string): string => {
  const roomId = room.roomId;
  if (room.status !== RoomStatus.Open) {
    console.error(`Player ${playerId} attempted to join room ${roomId} but the room doesn't exist`);
    return "The room is currently not open.";
  }

  if (playerId in room.playerProfiles) {
    console.error(`Player ${playerId} attempted to join room ${roomId} but is already in the room`);
    return "You are already in the room.";
  }

  return "";
};

const handleJoinRoom = (ws: Socket, data: JoinRoomClientMessage): void => {
  const { roomId, playerName } = data;

  let room: Room;
  if (rooms[roomId]) {
    room = rooms[roomId];
  } else {
    room = { roomId, status: RoomStatus.Open, playerProfiles: {} };
    rooms[roomId] = room;
    console.info(`Created room ${roomId}`);
  }
  const playerId = ws.playerId;

  const error = validateJoinRoomInput(room, playerId);
  if (error) {
    sendMessage(ws, { type: ServerMessageType.Fail, error });
    return;
  }

  ws.roomId = roomId;
  room.playerProfiles[playerId] = { playerId, playerName };
  console.info(`Player ${playerName} (${playerId}) joined room ${roomId}`);

  sendMessage(ws, { type: ServerMessageType.CreateRoom, playerId, room });
  broadcastMessageToRoom(room, { type: ServerMessageType.UpdateRoom, room });
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

  if (!(playerId in room.playerProfiles)) {
    console.error(`Player ${playerId} attempted to start game in room ${roomId} but they are not in it`);
    return "You are not in the room.";
  }

  const numPlayers = Object.keys(room.playerProfiles).length;
  if (numPlayers < MIN_PLAYERS || numPlayers > MAX_PLAYERS) {
    console.error(`Player ${playerId} attempted to start game in room ${roomId} with ${numPlayers} player(s)`);
    return `The game can't be started with ${numPlayers} players. There must be between ${MIN_PLAYERS} and ${MAX_PLAYERS} players.`;
  }

  return "";
};

const handleStartGame = (ws: Socket): void => {
  const playerId = ws.playerId;
  const roomId = ws.roomId;
  const error = validateStartGameInput(roomId, playerId);
  if (error) {
    sendMessage(ws, { type: ServerMessageType.Fail, error });
    return;
  }

  const playerProfiles = rooms[roomId]!.playerProfiles;
  const playerIds = Object.keys(playerProfiles);
  let players: Record<string, GamePlayer> = {};
  for (const playerId of playerIds) {
    players[playerId] = { playerId, fishList: [], reputation: 0 };
  }
  rooms[roomId] = {
    roomId,
    status: RoomStatus.InProgress,
    playerProfiles,
    playerOrder: playerIds,
    game: {
      players: players,
      turnIdx: 0,
      actionsLeft: ACTIONS_PER_TURN,
    },
  };
  const playerName = playerProfiles[playerId]!.playerName;
  console.info(`Player ${playerName} (${playerId}) started game in room ${roomId}`);

  const room = rooms[roomId];
  broadcastMessageToRoom(room, { type: ServerMessageType.CreateGame, game: room.game });
};

const validateMakeTurnInput = (roomId: string, playerId: string): string => {
  const room = rooms[roomId];
  if (!room) {
    console.error(`Player ${playerId} attempted to make a turn in room ${roomId} but the room doesn't exist`);
    return "The room does not exist.";
  }

  if (room.status !== RoomStatus.InProgress) {
    console.error(`Player ${playerId} attempted to make a turn in room ${roomId} but the game is not in progress`);
    return "The game is already in progress.";
  }

  if (!(playerId in room.playerProfiles)) {
    console.error(`Player ${playerId} attempted to make a turn in room ${roomId} but they are not in it`);
    return "You are not in the room.";
  }

  const currentPlayerId = room.playerOrder[room.game.turnIdx % room.playerOrder.length];
  if (playerId !== currentPlayerId) {
    console.error(`Player ${playerId} attempted to make a turn in room ${roomId} but it is not their turn`);
    return "It's not your turn.";
  }

  return "";
};

const getRandomFish = (locationData: LocationData): Fish => {
  const totalWeight = Object.values(locationData).reduce((sum, weight) => sum + weight, 0);

  const probability = Math.random() * totalWeight;
  let cumulativeProbability = 0;

  for (const [fish, weight] of Object.entries(locationData)) {
    cumulativeProbability += weight;
    if (probability < cumulativeProbability) {
      return fish as Fish;
    }
  }

  return Fish.Trash;
};

const checkGameOver = (room: InProgressRoom): GameSummary | undefined => {
  for (const [playerId, player] of Object.entries(room.game.players)) {
    if (player.reputation >= WINNING_REPUTATION) {
      return { winner: room.playerProfiles[playerId]!.playerName, players: room.game.players };
    }
  }
  return undefined;
};

const handleMakeTurn = (ws: Socket, data: MakeTurnClientMessage): void => {
  const action = data.action;
  const playerId = ws.playerId;
  const roomId = ws.roomId;
  const error = validateMakeTurnInput(roomId, playerId);
  if (error) {
    sendMessage(ws, { type: ServerMessageType.Fail, error });
    return;
  }

  const room = rooms[roomId] as InProgressRoom;
  const { playerProfiles, game } = room;
  const playerName = playerProfiles[playerId]?.playerName;

  switch (action.actionType) {
    case ActionType.CatchFish:
      if (game.actionsLeft <= 0) {
        const error = "You have no actions left.";
        sendMessage(ws, { type: ServerMessageType.Fail, error });
        console.error(`Player ${playerName} (${playerId}) attempted to catch fish but has no actions remaining`);
        return;
      }
      game.actionsLeft--;

      const player = game.players[playerId]!;
      const fish = getRandomFish(locationDataRecord[action.location]);
      player.fishList.push(fish);
      player.reputation += fishDataRecord[fish].reputation;
      console.info(`Player ${playerName} (${playerId}) caught a ${fish}`);
      break;
    case ActionType.EndTurn:
      game.actionsLeft = ACTIONS_PER_TURN;
      game.turnIdx++;
      console.info(`Player ${playerName} (${playerId}) ended their turn`);
      break;
  }

  broadcastMessageToRoom(room, { type: ServerMessageType.UpdateGame, game });

  const gameSummary = checkGameOver(room);
  if (gameSummary) {
    rooms[roomId] = { roomId, status: RoomStatus.Open, playerProfiles };
    console.info(`Player ${playerName} (${playerId}) won the game in room ${roomId}, room was reset`);

    broadcastMessageToRoom(room, { type: ServerMessageType.DeleteGame, gameSummary });
  }
};

const handleClientDisconnect = (ws: Socket): void => {
  const roomId = ws.roomId;
  if (!roomId) {
    return;
  }

  const room = rooms[roomId];
  if (!room) {
    return;
  }

  const playerId = ws.playerId;
  const playerName = room.playerProfiles[playerId]!.playerName;
  switch (room.status) {
    case RoomStatus.Open:
      delete room.playerProfiles[playerId];
      console.info(`Player ${playerName} (${playerId}) disconnected from room ${roomId}`);
      broadcastMessageToRoom(room, { type: ServerMessageType.UpdateRoom, room });

      if (!room.playerProfiles) {
        delete rooms[roomId];
        console.info(`No more players in room ${roomId}, room was deleted`);
        broadcastMessageToRoom(room, {
          type: ServerMessageType.DeleteRoom,
          error: "No more players in the room.",
        });
      }
      break;
    case RoomStatus.InProgress:
      delete rooms[roomId];
      console.error(
        `Player ${playerName} (${playerId}) disconnected from room ${roomId} while game was in progress, room was deleted`,
      );
      broadcastMessageToRoom(room, {
        type: ServerMessageType.DeleteRoom,
        error: "Another player left while the game was in progress.",
      });
      break;
  }
};

const sendMessage = (socket: Socket, message: ServerMessage): void => {
  socket.send(JSON.stringify(message));
};

const broadcastMessageToRoom = (room: Room, message: ServerMessage): void => {
  wss.clients.forEach((client) => {
    if (client.playerId in room.playerProfiles && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};
