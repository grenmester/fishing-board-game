import { useState } from "react";
import { FaFish, FaMoneyBill, FaStar } from "react-icons/fa6";

import { fishDataRecord } from "../../../shared/data";
import { type Action, ActionType, Fish } from "../../../shared/types";
import { camelToTitleCase } from "../utils";

interface FishSectionProps {
  fishList: Fish[];
  makeTurn: (action: Action) => void;
}

const FishSection = ({ fishList, makeTurn }: FishSectionProps) => {
  const [fishIdx, setFishIdx] = useState<number>();

  const clickFishHandler = (idx: number) => () => {
    setFishIdx(idx);
  };

  const donateFishHandler = () => {
    if (fishIdx !== undefined) {
      makeTurn({
        actionType: ActionType.DonateFish,
        fishIdx,
      });
      setFishIdx(undefined);
    }
  };

  const sellFishHandler = () => {
    if (fishIdx !== undefined) {
      makeTurn({
        actionType: ActionType.SellFish,
        fishIdx,
      });
      setFishIdx(undefined);
    }
  };

  return (
    <section className="flex flex-col gap-2 p-4 bg-blue-300 rounded-xl shadow">
      <div className="flex gap-2 items-center text-blue-900">
        <h3 className="text-lg font-bold">Fish</h3>
        <FaFish size={20} />
      </div>
      <div className="flex gap-2 justify-between mx-auto">
        {fishList.map((fish, idx) => (
          <FishCard
            active={idx === fishIdx}
            clickHandler={clickFishHandler(idx)}
            fish={fish}
            key={`${fish}${idx.toString()}`}
          />
        ))}
      </div>
      <div className="flex gap-4 justify-between">
        <button className="py-1 px-4 text-white bg-blue-500 rounded-xl hover:bg-blue-600" onClick={donateFishHandler}>
          Donate Fish
        </button>
        <button className="py-1 px-4 text-white bg-blue-500 rounded-xl hover:bg-blue-600" onClick={sellFishHandler}>
          Sell Fish
        </button>
      </div>
    </section>
  );
};

interface FishCardProps {
  active: boolean;
  clickHandler: () => void;
  fish: Fish;
}

const FishCard = ({ active, clickHandler, fish }: FishCardProps) => {
  return (
    <div
      className={`flex flex-col gap-1 justify-between items-center p-2 w-32 h-40 text-white bg-blue-500 rounded-lg hover:bg-blue-600 ${active ? "ring-2 ring-blue-700" : ""}`}
      onClick={clickHandler}
    >
      <div className="flex gap-4 self-center">
        <div className="flex gap-1 items-center">
          <FaStar />
          <span>{fishDataRecord[fish].reputation}</span>
        </div>
        <div className="flex gap-1 items-center">
          <FaMoneyBill />
          <span>{fishDataRecord[fish].money}</span>
        </div>
      </div>
      <img className="size-16" src="favicon.png" />
      <p className="overflow-hidden font-bold text-center text-nowrap overflow-ellipsis">{camelToTitleCase(fish)}</p>
    </div>
  );
};

export default FishSection;
