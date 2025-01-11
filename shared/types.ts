import type { ClientMessageEnum, RoomStatus, ServerMessageEnum } from "./enums";

export type Players = { [playerId: string]: string };

export type GameState = {
  turnPlayerIndex: number;
  scores: [string, number][];
};

export type GameTurn = {
  playerId: string;
  roll: number;
};

export type GameSummary = {
  scores: [string, number][];
  winner: string;
};

export type RoomState =
  | {
      status: RoomStatus.Open;
      players: Players;
    }
  | { status: RoomStatus.InProgress; players: Players; gameState: GameState };

export type ServerMessage =
  | {
      type: ServerMessageEnum.JoinRoomFailure;
      error: string;
    }
  | {
      type: ServerMessageEnum.StartGameFailure;
      error: string;
    }
  | { type: ServerMessageEnum.MakeTurnFailure; error: string }
  | {
      type: ServerMessageEnum.CreateRoom;
      roomState: RoomState;
    }
  | {
      type: ServerMessageEnum.UpdateRoom;
      roomState: RoomState;
    }
  | { type: ServerMessageEnum.DeleteRoom; error: string }
  | { type: ServerMessageEnum.CreateGame; gameState: GameState }
  | {
      type: ServerMessageEnum.UpdateGame;
      gameTurn: GameTurn;
      gameState: GameState;
    }
  | { type: ServerMessageEnum.DeleteGame; gameSummary: GameSummary };

export type ClientMessage =
  | {
      type: ClientMessageEnum.JoinRoomRequest;
      playerName: string;
      roomId: string;
    }
  | { type: ClientMessageEnum.StartGameRequest; roomId: string }
  | { type: ClientMessageEnum.MakeTurnRequest; roomId: string };
