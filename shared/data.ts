import { Fish, type FishData, Gear, type GearData, Location, type LocationData } from "./types";

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
  [Fish.Rockfish]: {
    reputation: 2,
    money: 2,
  },
  [Fish.Lingcod]: {
    reputation: 2,
    money: 2,
  },
  [Fish.Halibut]: {
    reputation: 4,
    money: 4,
  },
  [Fish.Trash]: {
    reputation: 0,
    money: 0,
  },
};

export const locationDataRecord: Record<Location, LocationData> = {
  [Location.Pier]: {
    [Fish.Perch]: 2,
    [Fish.Sardine]: 2,
    [Fish.Mackerel]: 1,
  },
  [Location.Lake]: {
    [Fish.Trout]: 2,
    [Fish.Bass]: 2,
    [Fish.Catfish]: 1,
  },
  [Location.DeepSea]: {
    [Fish.Rockfish]: 3,
    [Fish.Lingcod]: 3,
    [Fish.Halibut]: 2,
  },
};

export const gearDataRecord: Record<Gear, GearData> = {
  [Gear.OldRod]: {
    cost: 1,
    reputation: 1,
    effect: (turnConfig) => ({
      ...turnConfig,
      allowedFishingAttempts: turnConfig.allowedFishingAttempts + 1,
    }),
  },
  [Gear.GoodRod]: {
    cost: 2,
    reputation: 2,
    effect: (turnConfig) => ({
      ...turnConfig,
      allowedFishingAttempts: turnConfig.allowedFishingAttempts + 2,
    }),
  },
  [Gear.SuperRod]: {
    cost: 3,
    reputation: 3,
    effect: (turnConfig) => ({
      ...turnConfig,
      allowedFishingAttempts: turnConfig.allowedFishingAttempts + 3,
    }),
  },
  [Gear.FishingBoat]: {
    cost: 3,
    reputation: 3,
    effect: (turnConfig) => ({
      ...turnConfig,
      allowedLocations: turnConfig.allowedLocations.concat([Location.DeepSea]),
    }),
  },
};
