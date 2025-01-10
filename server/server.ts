import { WebSocket, WebSocketServer } from "ws";
import * as crypto from "crypto";
import type { ClientMessage, Room, ServerMessage } from "shared/types";

const wss = new WebSocketServer({ port: 3000 }) as Server;
const rooms: { [roomId: string]: Room } = {};

wss.on("connection", (ws: Socket) => {
  ws.id = crypto.randomUUID();
  console.info(`Client ${ws.id} connected`);

  ws.on("message", (message) => {
    const data: ClientMessage = JSON.parse(message.toString());

    switch (data.type) {
      case "joinGame":
        handleJoinGame(ws, data.playerName, data.roomId);
        break;
      case "startGame":
        handleStartGame(data.roomId);
        break;
    }
  });

  ws.on("close", () => {
    console.info(`Client ${ws.id} disconnected`);
    handleClientDisconnect(ws);
  });
});

const handleJoinGame = (ws: Socket, playerName: string, roomId: string) => {
  const playerId = ws.id;
  let room: Room;
  if (rooms[roomId]) {
    room = rooms[roomId];
  } else {
    room = {
      status: "Open",
      players: {},
      gameState: {},
    };
    rooms[roomId] = room;
    console.info(`Created room ${roomId}`);
  }

  if (room.status !== "Open") {
    console.info(
      `Player ${playerName} (${playerId}) was denied access to room ${roomId}`,
    );
    sendMessage(ws, { type: "joinGameFailure", error: "Room not open" });
    return;
  }

  room.players[playerId] = playerName;
  ws.roomId = roomId;

  sendMessage(ws, { type: "joinGameSuccess" });
  broadcastRoomState(room);

  console.info(`Player ${playerName} (${playerId}) joined room ${roomId}`);
};

const handleStartGame = (roomId: string) => {
  const room = rooms[roomId];
  if (!room) {
    console.info(`Room ${roomId} not found`);
    return;
  }

  room.status = "InProgress";
  broadcastRoomState(room);

  console.info(`Game started in room ${roomId}`);
};

const broadcastRoomState = (room: Room) => {
  wss.clients.forEach((client) => {
    if (client.id in room.players && client.readyState === WebSocket.OPEN) {
      sendMessage(client, { type: "updateRoom", roomState: room });
    }
  });
};

const handleClientDisconnect = (ws: Socket) => {
  if (ws.roomId) {
    const room = rooms[ws.roomId];
    if (!room) {
      return;
    }

    const playerId = room.players[ws.id];
    switch (room.status) {
      case "Open":
        delete room.players[ws.id];
        broadcastRoomState(room);
        console.info(
          `Player ${playerId} (${ws.id}) disconnected from room ${ws.roomId}`,
        );
        if (!room.players) {
          delete rooms[ws.roomId];
          broadcastDisconnect(room);
          console.info(`No more players, deleted room ${ws.roomId}`);
        }
        break;
      case "InProgress":
        broadcastDisconnect(room);
        delete rooms[ws.roomId];
        console.info(
          `Player ${playerId} (${ws.id}) disconnected from in progress game, deleted room ${ws.roomId}`,
        );
        break;
    }
  }
};

const broadcastDisconnect = (room: Room) => {
  wss.clients.forEach((client) => {
    if (client.id in room.players && client.readyState === WebSocket.OPEN) {
      sendMessage(client, {
        type: "disconnect",
        error: "Another player left while the game was in progress",
      });
    }
  });
};

function sendMessage(socket: Socket, message: ServerMessage) {
  socket.send(JSON.stringify(message));
}

console.info("WebSocket server is running on ws://localhost:3000");

interface Server extends WebSocketServer {
  clients: Set<Socket>;
}

interface Socket extends WebSocket {
  id: string;
  roomId: string;
}
