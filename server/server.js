const WebSocket = require("ws");
const crypto = require("crypto");

const wss = new WebSocket.Server({ port: 3000 });
const rooms = {};

wss.on("connection", (ws) => {
  ws.id = crypto.randomUUID();
  console.info(`Client ${ws.id} connected`);

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case "joinGame":
        handleJoinGame(ws, data.playerName, data.roomId);
        break;
      case "startGame":
        handleStartGame(ws, data.roomId);
        break;
    }
  });

  ws.on("close", () => {
    console.info(`Client ${ws.id} disconnected`);
    handleClientDisconnect(ws);
  });
});

const handleJoinGame = (ws, playerName, roomId) => {
  const playerId = ws.id;
  if (!(roomId in rooms)) {
    rooms[roomId] = {
      status: "Open",
      players: {},
      gameState: {},
    };
    console.info(`Created room ${roomId}`);
  }

  const room = rooms[roomId];
  if (room.status !== "Open") {
    console.info(
      `Player ${playerName} (${playerId}) was denied access to room ${roomId}`,
    );
    ws.send(
      JSON.stringify({ type: "joinGameFailure", error: "Room not open" }),
    );
    return;
  }

  room.players[playerId] = playerName;
  ws.roomId = roomId;

  ws.send(JSON.stringify({ type: "joinGameSuccess" }));
  broadcastRoomState(room);

  console.info(`Player ${playerName} (${playerId}) joined room ${roomId}`);
};

const handleStartGame = (ws, roomId) => {
  rooms[roomId].status = "InProgress";
  broadcastRoomState(rooms[roomId]);

  console.info(`Game started in room ${roomId}`);
};

const broadcastRoomState = (room) => {
  wss.clients.forEach((client) => {
    if (client.id in room.players && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "updateRoom", roomState: room }));
    }
  });
};

const handleClientDisconnect = (ws) => {
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

const broadcastDisconnect = (room) => {
  wss.clients.forEach((client) => {
    if (client.id in room.players && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "disconnect", error: "Another player left while the game was in progress" }));
    }
  });
};

console.info("WebSocket server is running on ws://localhost:3000");
