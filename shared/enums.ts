export const enum RoomStatus {
  Open,
  InProgress,
}

export const enum ServerMessageEnum {
  JoinRoomFailure,
  StartGameFailure,
  MakeTurnFailure,
  CreateRoom,
  UpdateRoom,
  DeleteRoom,
  CreateGame,
  UpdateGame,
  DeleteGame,
}

export const enum ClientMessageEnum {
  JoinRoomRequest,
  StartGameRequest,
  MakeTurnRequest,
}
