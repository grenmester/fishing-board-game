export interface Room {
  status: string;
  players: { [playerId: string]: string };
  gameState: {};
}

export type ServerMessage =
  | {
      type: "joinGameFailure" | "disconnect";
      error: string;
    }
  | {
      type: "joinGameSuccess";
    }
  | {
      type: "updateRoom";
      roomState: Room;
    };

export type ClientMessage =
  | { type: "joinGame"; playerName: string; roomId: string }
  | { type: "startGame"; roomId: string };
