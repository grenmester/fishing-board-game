import { Fish, type FishData, Location, type LocationData } from "./types";

export const fishDataRecord: Record<Fish, FishData> = {
  [Fish.Trout]: {
    reputation: 1,
    money: 1,
  },
  [Fish.Bass]: {
    reputation: 2,
    money: 2,
  },
  [Fish.Catfish]: {
    reputation: 3,
    money: 3,
  },
  [Fish.Perch]: {
    reputation: 2,
    money: 1,
  },
  [Fish.Sardine]: {
    reputation: 1,
    money: 2,
  },
  [Fish.Mackerel]: {
    reputation: 3,
    money: 3,
  },
  [Fish.Trash]: {
    reputation: 0,
    money: 0,
  },
};

export const locationDataRecord: Record<Location, LocationData> = {
  [Location.Pier]: {
    [Fish.Perch]: 1,
    [Fish.Sardine]: 1,
    [Fish.Mackerel]: 2,
  },
  [Location.Lake]: {
    [Fish.Trout]: 1,
    [Fish.Bass]: 1,
    [Fish.Catfish]: 2,
  },
};
