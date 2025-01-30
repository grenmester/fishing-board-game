import { WebSocket, WebSocketServer } from "ws";
import { randomUUID } from "crypto";
import { actionCardDataRecord, fishDataRecord, gearDataRecord, locationDataRecord } from "shared/data";
import {
  ActionCard,
  ActionType,
  ClientMessageType,
  Fish,
  Gear,
  Location,
  RoomStatus,
  ServerMessageType,
  type ClientMessage,
  type Game,
  type GamePlayer,
  type GameSummary,
  type InProgressRoom,
  type JoinRoomClientMessage,
  type LocationData,
  type MakeTurnClientMessage,
  type Room,
  type ServerMessage,
  type TurnConfig,
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
const WINNING_REPUTATION = 10;
const MARKET_SIZE = 3;
const MARKET_REFRESH_COST = 3;
const NUM_STARTING_ACTION_CARDS = 2;
const DEFAULT_TURN_CONFIG: TurnConfig = {
  allowedLocations: [Location.Pier, Location.Lake],
  allowedFishingAttempts: 2,
};

const wss = new WebSocketServer({ port: PORT }) as Server;
const rooms: Record<string, Room> = {};

wss.on("connection", (ws: Socket) => {
  ws.playerId = randomUUID();
  console.info(`Client ${ws.playerId} connected`);

  ws.on("message", (message) => {
    const data: ClientMessage = JSON.parse(message.toString());
    console.debug(`message: ${JSON.stringify(data, null, 2)}`);
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

const genActionCardDraw = (numCards: number): ActionCard[] => {
  return Array.from(Array(numCards), getRandomActionCard);
};
const genMarket = (): Gear[] => {
  return Array.from(Array(MARKET_SIZE), getRandomGear);
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
    players[playerId] = {
      playerId,
      fishList: [],
      gearList: [],
      actionCards: genActionCardDraw(NUM_STARTING_ACTION_CARDS),
      money: 0,
      reputation: 0,
    };
  }
  rooms[roomId] = {
    roomId,
    status: RoomStatus.InProgress,
    playerProfiles,
    game: {
      players,
      playerOrder: playerIds,
      turnIdx: 0,
      currentPlayerId: playerId,
      fishingAttempts: 0,
      turnConfig: DEFAULT_TURN_CONFIG,
      market: genMarket(),
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

  if (playerId !== room.game.currentPlayerId) {
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

const getRandomActionCard = (): ActionCard => {
  const actionCards = Object.keys(actionCardDataRecord);
  return actionCards[Math.floor(Math.random() * actionCards.length)] as ActionCard;
};

const getRandomGear = (): Gear => {
  const gear = Object.keys(gearDataRecord);
  return gear[Math.floor(Math.random() * gear.length)] as Gear;
};

const checkGameOver = (room: InProgressRoom): GameSummary | undefined => {
  for (const [playerId, player] of Object.entries(room.game.players)) {
    if (player.reputation >= WINNING_REPUTATION) {
      return { winner: room.playerProfiles[playerId]!.playerName, players: room.game.players };
    }
  }
  return undefined;
};

const genTurnConfig = (game: Game): TurnConfig => {
  const player = game.players[game.currentPlayerId]!;
  let turnConfig = DEFAULT_TURN_CONFIG;
  player.gearList.forEach((gear) => {
    turnConfig = gearDataRecord[gear].effect(turnConfig);
  });
  return turnConfig;
};

const handleMakeTurn = (ws: Socket, data: MakeTurnClientMessage): void => {
  const playerId = ws.playerId;
  const roomId = ws.roomId;
  const error = validateMakeTurnInput(roomId, playerId);
  if (error) {
    sendMessage(ws, { type: ServerMessageType.Fail, error });
    return;
  }

  const action = data.action;
  const room = rooms[roomId] as InProgressRoom;
  const { playerProfiles, game } = room;
  const playerName = playerProfiles[playerId]?.playerName;
  const player = game.players[playerId]!;

  switch (action.actionType) {
    case ActionType.BuyGear: {
      const gear = game.market[action.gearIdx];
      if (!gear) {
        const error = "Invalid gear selected.";
        sendMessage(ws, { type: ServerMessageType.Fail, error });
        console.error(`Player ${playerName} (${playerId}) attempted to buy an invalid gear`);
        return;
      }

      const cost = gearDataRecord[gear].cost;
      if (player.money < cost) {
        const error = "You don't have enough money to buy that gear.";
        sendMessage(ws, { type: ServerMessageType.Fail, error });
        console.error(`Player ${playerName} (${playerId}) attempted to buy a ${gear} but has insufficient money`);
        return;
      }

      game.turnConfig = gearDataRecord[gear].effect(game.turnConfig);
      game.market[action.gearIdx] = getRandomGear();
      player.gearList.push(gear);
      player.money -= cost;
      console.info(`Player ${playerName} (${playerId}) bought a ${gear}`);
      break;
    }
    case ActionType.CatchFish: {
      if (!game.location) {
        const error = "You did not select a location.";
        sendMessage(ws, { type: ServerMessageType.Fail, error });
        console.error(`Player ${playerName} (${playerId}) attempted to catch fish but didn't select a location`);
        return;
      }
      if (game.fishingAttempts >= game.turnConfig.allowedFishingAttempts) {
        const error = "You have no actions left.";
        sendMessage(ws, { type: ServerMessageType.Fail, error });
        console.error(`Player ${playerName} (${playerId}) attempted to catch fish but has no actions remaining`);
        return;
      }
      game.fishingAttempts++;

      const fish = getRandomFish(locationDataRecord[game.location]);
      player.fishList.push(fish);
      console.info(`Player ${playerName} (${playerId}) caught a ${fish}`);
      break;
    }
    case ActionType.DonateFish: {
      const fish = player.fishList[action.fishIdx];
      if (!fish) {
        const error = "Invalid fish selected.";
        sendMessage(ws, { type: ServerMessageType.Fail, error });
        console.error(`Player ${playerName} (${playerId}) attempted to donate an invalid fish`);
        return;
      }
      player.fishList.splice(action.fishIdx, 1);
      player.reputation += fishDataRecord[fish].reputation;
      console.info(`Player ${playerName} (${playerId}) donated a ${fish}`);
      break;
    }
    case ActionType.DonateGear: {
      const gear = player.gearList[action.gearIdx];
      if (!gear) {
        const error = "Invalid gear selected.";
        sendMessage(ws, { type: ServerMessageType.Fail, error });
        console.error(`Player ${playerName} (${playerId}) attempted to donate an invalid gear`);
        return;
      }
      player.gearList.splice(action.gearIdx, 1);
      player.reputation += gearDataRecord[gear].reputation;
      console.info(`Player ${playerName} (${playerId}) donated a ${gear}`);
      break;
    }
    case ActionType.PlayActionCard: {
      const actionCard = player.actionCards[action.actionCardIdx];
      const input = action.actionCardInput;
      if (!actionCard || actionCard !== input.actionCard) {
        const error = "Invalid action card selected.";
        sendMessage(ws, { type: ServerMessageType.Fail, error });
        console.error(`Player ${playerName} (${playerId}) attempted to use an invalid action card`);
        return;
      }
      const { validator, effect } = actionCardDataRecord[actionCard];
      const error = validator(game, input);
      if (error) {
        sendMessage(ws, { type: ServerMessageType.Fail, error });
        console.error(
          `Player ${playerName} (${playerId}) attempted to use an action card but did not meet the requirements`,
        );
        return;
      }
      room.game = effect(game, input);
      break;
    }
    case ActionType.RefreshMarket: {
      if (player.money < MARKET_REFRESH_COST) {
        const error = "Insufficient money.";
        sendMessage(ws, { type: ServerMessageType.Fail, error });
        console.error(`Player ${playerName} (${playerId}) attempted to refresh market with insufficient money`);
        return;
      }

      player.money -= MARKET_REFRESH_COST;
      game.market = genMarket();
      console.info(`Player ${playerName} (${playerId}) refreshed the market`);
      break;
    }
    case ActionType.SellFish: {
      const fish = player.fishList[action.fishIdx];
      if (!fish) {
        const error = "Invalid fish selected.";
        sendMessage(ws, { type: ServerMessageType.Fail, error });
        console.error(`Player ${playerName} (${playerId}) attempted to sell an invalid fish`);
        return;
      }
      player.fishList.splice(action.fishIdx, 1);
      player.money += fishDataRecord[fish].money;
      console.info(`Player ${playerName} (${playerId}) sold a ${fish}`);
      break;
    }
    case ActionType.SetLocation: {
      if (game.location) {
        const error = "Location already selected.";
        sendMessage(ws, { type: ServerMessageType.Fail, error });
        console.error(`Player ${playerName} (${playerId}) attempted to set their location again`);
        return;
      }
      if (!game.turnConfig.allowedLocations.includes(action.location)) {
        const error = "Invalid location selected.";
        sendMessage(ws, { type: ServerMessageType.Fail, error });
        console.error(`Player ${playerName} (${playerId}) attempted to set an invalid location`);
        return;
      }
      game.location = action.location;
      break;
    }
    case ActionType.EndTurn: {
      game.turnIdx++;
      game.currentPlayerId = game.playerOrder[game.turnIdx % game.playerOrder.length] as string;
      delete game.location;
      game.fishingAttempts = 0;
      game.turnConfig = genTurnConfig(game);

      console.info(`Player ${playerName} (${playerId}) ended their turn`);
      break;
    }
  }

  broadcastMessageToRoom(room, { type: ServerMessageType.UpdateGame, game: room.game });

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
