import { useState } from "react";
import { FaFish } from "react-icons/fa6";

import { type Action, ActionType, Fish } from "../../../shared/types";

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
  fish: string;
}

const FishCard = ({ active, clickHandler, fish }: FishCardProps) => {
  return (
    <div
      className={`flex flex-col gap-1 justify-between items-center p-2 w-24 h-32 bg-blue-500 rounded-lg hover:bg-blue-600 ${active ? "ring-2 ring-blue-700" : ""}`}
      onClick={clickHandler}
    >
      <img className="size-16" src="favicon.png" />
      <p className="overflow-hidden text-center text-white text-nowrap overflow-ellipsis">{fish}</p>
    </div>
  );
};

export default FishSection;
