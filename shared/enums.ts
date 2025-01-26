export const enum RoomStatus {
  Open,
  InProgress,
}

export const enum ClientMessageEnum {
  JoinRoomRequest,
  StartGameRequest,
  MakeTurnRequest,
}

export const enum ServerMessageEnum {
  Fail,
  CreateRoom,
  UpdateRoom,
  DeleteRoom,
  CreateGame,
  UpdateGame,
  DeleteGame,
}
