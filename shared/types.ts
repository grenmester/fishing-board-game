export type ClientMessage = JoinRoomClientMessage | StartGameClientMessage | MakeTurnClientMessage;

export type JoinRoomClientMessage = {
  type: ClientMessageType.JoinRoom;
  playerName: string;
  roomId: string;
};

export type StartGameClientMessage = {
  type: ClientMessageType.StartGame;
};

export type MakeTurnClientMessage = {
  type: ClientMessageType.MakeTurn;
  action: Action;
};

export const enum ClientMessageType {
  JoinRoom = "joinRoom",
  StartGame = "startGame",
  MakeTurn = "makeTurn",
}

export type ServerMessage =
  | FailServerMessage
  | CreateRoomServerMessage
  | UpdateRoomServerMessage
  | DeleteRoomServerMessage
  | CreateGameServerMessage
  | UpdateGameServerMessage
  | DeleteGameServerMessage;

export type FailServerMessage = {
  type: ServerMessageType.Fail;
  error: string;
};

export type CreateRoomServerMessage = {
  type: ServerMessageType.CreateRoom;
  playerId: string;
  room: Room;
};

export type UpdateRoomServerMessage = {
  type: ServerMessageType.UpdateRoom;
  room: Room;
};

export type DeleteRoomServerMessage = {
  type: ServerMessageType.DeleteRoom;
  error: string;
};

export type CreateGameServerMessage = {
  type: ServerMessageType.CreateGame;
  game: Game;
};

export type UpdateGameServerMessage = {
  type: ServerMessageType.UpdateGame;
  game: Game;
};

export type DeleteGameServerMessage = {
  type: ServerMessageType.DeleteGame;
  gameSummary: GameSummary;
};

export const enum ServerMessageType {
  Fail = "fail",
  CreateRoom = "createRoom",
  UpdateRoom = "updateRoom",
  DeleteRoom = "deleteRoom",
  CreateGame = "createGame",
  UpdateGame = "updateGame",
  DeleteGame = "deleteGame",
}

export const enum ActionType {
  CatchFish = "catchFish",
  EndTurn = "endTurn",
}

export type Action =
  | {
      actionType: ActionType.CatchFish;
      location: Location;
    }
  | {
      actionType: ActionType.EndTurn;
    };

export type Room = OpenRoom | InProgressRoom;

export type OpenRoom = {
  readonly roomId: string;
  status: RoomStatus.Open;
  playerProfiles: Record<string, PlayerProfile>;
};

export type InProgressRoom = {
  readonly roomId: string;
  status: RoomStatus.InProgress;
  readonly playerProfiles: Record<string, PlayerProfile>;
  readonly playerOrder: string[];
  game: Game;
};

export const enum RoomStatus {
  Open = "open",
  InProgress = "inProgress",
}

export type PlayerProfile = {
  readonly playerId: string;
  playerName: string;
};

export type Game = {
  players: Record<string, GamePlayer>;
  turnIdx: number;
  actionsLeft: number;
};

export type GamePlayer = {
  readonly playerId: string;
  fishList: Fish[];
  reputation: number;
};

export type GameSummary = {
  readonly winner: string;
  readonly players: Record<string, GamePlayer>;
};

export const enum Fish {
  Trout = "trout",
  Bass = "bass",
  Catfish = "catfish",
  Perch = "perch",
  Sardine = "sardine",
  Mackerel = "mackerel",
  Trash = "trash",
}

export type FishData = {
  reputation: number;
  money: number;
};

export const enum Location {
  Lake = "lake",
  Pier = "pier",
}

export type LocationData = Partial<Record<Fish, number>>;
