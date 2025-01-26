import type { ClientMessageEnum, RoomStatus, ServerMessageEnum } from "./enums";

export type ClientMessage =
  | {
      type: ClientMessageEnum.JoinRoomRequest;
      playerName: string;
      roomId: string;
    }
  | {
      type: ClientMessageEnum.StartGameRequest;
      roomId: string;
    }
  | {
      type: ClientMessageEnum.MakeTurnRequest;
      roomId: string;
    };

export type ServerMessage =
  | {
      type: ServerMessageEnum.Fail;
      error: string;
    }
  | {
      type: ServerMessageEnum.CreateRoom;
      room: Room;
    }
  | {
      type: ServerMessageEnum.UpdateRoom;
      room: Room;
    }
  | {
      type: ServerMessageEnum.DeleteRoom;
      error: string;
    }
  | {
      type: ServerMessageEnum.CreateGame;
      game: Game;
    }
  | {
      type: ServerMessageEnum.UpdateGame;
      game: Game;
    }
  | {
      type: ServerMessageEnum.DeleteGame;
      gameSummary: GameSummary;
    };

export type Room = {
  roomId: string;
  status: RoomStatus;
  players: Player[];
  game?: Game;
};

export type Game = {
  turnCount: number;
  actionsLeft: number;
};

export type GameSummary = {
  winner: string;
  players: Player[];
};

export type Player = {
  playerId: string;
  playerName: string;
  reputation: number;
};
