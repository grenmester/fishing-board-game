import {
  ActionCard,
  Fish,
  Gear,
  Location,
  type ActionCardData,
  type BorrowGearActionCardInput,
  type BorrowMoneyActionCardInput,
  type FishData,
  type GearData,
  type LocationData,
} from "./types";

const ACTION_CARD_BORROW_MONEY_AMOUNT = 4;
const ACTION_CARD_BORROW_MONEY_FROM_ALL_AMOUNT = 2;

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

export const actionCardDataRecord: Record<ActionCard, ActionCardData> = {
  [ActionCard.BorrowGear]: {
    validator: (game, input) => {
      const { playerId, gearIdx } = input as BorrowGearActionCardInput;
      if (!(playerId in game.players)) {
        return "Invalid player selected.";
      }
      if (playerId === game.currentPlayerId) {
        return "You can't select yourself";
      }
      if (!(gearIdx in game.players[playerId]!.gearList)) {
        return "Invalid gear selected.";
      }
      return "";
    },
    effect: (game, input) => {
      const { playerId, gearIdx } = input as BorrowGearActionCardInput;
      let newGame = structuredClone(game);
      const gear = newGame.players[playerId]!.gearList.splice(gearIdx, 1)[0]!;
      newGame.players[newGame.currentPlayerId]?.gearList.push(gear);
      console.info(`Player ${newGame.currentPlayerId} borrowed ${gear} from ${playerId}`);
      return newGame;
    },
  },
  [ActionCard.BorrowMoney]: {
    validator: (game, input) => {
      const { playerId } = input as BorrowMoneyActionCardInput;
      if (!(playerId in game.players)) {
        return "Invalid player selected.";
      }
      if (playerId === game.currentPlayerId) {
        return "You can't select yourself";
      }
      return "";
    },
    effect: (game, input) => {
      const { playerId } = input as BorrowMoneyActionCardInput;
      let newGame = structuredClone(game);
      const player = newGame.players[playerId]!;
      const money = Math.min(player.money, ACTION_CARD_BORROW_MONEY_AMOUNT);
      player.money -= money;
      newGame.players[newGame.currentPlayerId]!.money += money;
      console.info(`Player ${newGame.currentPlayerId} borrowed ${money} money from ${playerId}`);
      return newGame;
    },
  },
  [ActionCard.BorrowMoneyFromAll]: {
    validator: () => "",
    effect: (game) => {
      let newGame = structuredClone(game);
      let sum = 0;
      for (const player of Object.values(newGame.players)) {
        const money = Math.min(player.money, ACTION_CARD_BORROW_MONEY_FROM_ALL_AMOUNT);
        player.money -= money;
        sum += money;
      }
      newGame.players[newGame.currentPlayerId]!.money += sum;
      console.info(`Player ${newGame.currentPlayerId} borrowed ${sum} money in total from everyone`);
      return newGame;
    },
  },
};
