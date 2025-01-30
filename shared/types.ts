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
  BuyGear = "buyGear",
  CatchFish = "catchFish",
  DonateFish = "donateFish",
  DonateGear = "donateGear",
  EndTurn = "endTurn",
  RefreshMarket = "refreshMarket",
  SellFish = "sellFish",
  SetLocation = "setLocation",
}

export type Action =
  | {
      actionType: ActionType.BuyGear;
      gearIdx: number;
    }
  | {
      actionType: ActionType.CatchFish;
    }
  | {
      actionType: ActionType.DonateFish;
      fishIdx: number;
    }
  | {
      actionType: ActionType.DonateGear;
      gearIdx: number;
    }
  | {
      actionType: ActionType.EndTurn;
    }
  | {
      actionType: ActionType.SellFish;
      fishIdx: number;
    }
  | {
      actionType: ActionType.SetLocation;
      location: Location;
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
  readonly playerOrder: string[];
  turnIdx: number;
  location?: Location;
  fishingAttempts: number;
  turnConfig: TurnConfig;
  gearList: Gear[];
};

export type TurnConfig = {
  allowedLocations: Location[]
  allowedFishingAttempts: number;
}

export type GamePlayer = {
  readonly playerId: string;
  fishList: Fish[];
  gearList: Gear[];
  money: number;
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
  Rockfish = "rockfish",
  Lingcod = "lingcod",
  Halibut = "halibut",
  Trash = "trash",
}

export type FishData = {
  readonly reputation: number;
  readonly money: number;
};

export const enum Location {
  Lake = "lake",
  Pier = "pier",
  DeepSea = "deepSea",
}

export type LocationData = Partial<Record<Fish, number>>;

export const enum Gear {
  OldRod = "oldRod",
  GoodRod = "goodRod",
  SuperRod = "superRod",
  FishingBoat = "fishingBoat",
}

export type GearData = {
  readonly cost: number;
  readonly reputation: number;
  readonly effect: Effect;
};

export type Effect = (turnConfig: TurnConfig) => TurnConfig;
