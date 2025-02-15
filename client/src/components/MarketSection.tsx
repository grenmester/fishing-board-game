import { useState } from "react";
import { FaMoneyBill, FaShop } from "react-icons/fa6";

import { gearDataRecord } from "../../../shared/data";
import { ActionType, Gear, type Action } from "../../../shared/types";
import { camelToTitleCase } from "../utils";

interface MarketSectionProps {
  makeTurn: (action: Action) => void;
  market: Gear[];
}

const MarketSection = ({ makeTurn, market }: MarketSectionProps) => {
  const [marketIdx, setMarketIdx] = useState<number>();

  const clickGearHandler = (idx: number) => () => {
    setMarketIdx(idx);
  };

  const buyGearHandler = () => {
    if (marketIdx !== undefined) {
      makeTurn({
        actionType: ActionType.BuyGear,
        gearIdx: marketIdx,
      });
      setMarketIdx(undefined);
    }
  };

  const refreshMarketHandler = () => {
    makeTurn({ actionType: ActionType.RefreshMarket });
    setMarketIdx(undefined);
  };

  return (
    <section className="flex flex-col gap-2 p-4 bg-red-300 rounded-xl shadow">
      <div className="flex gap-2 items-center text-red-900">
        <h3 className="text-lg font-bold">Market</h3>
        <FaShop size={20} />
      </div>
      <div className="flex gap-2 justify-between mx-auto">
        {market.map((gear, idx) => (
          <GearCard
            active={idx === marketIdx}
            clickHandler={clickGearHandler(idx)}
            gear={gear}
            key={`${gear}${idx.toString()}`}
          />
        ))}
      </div>
      <div className="flex gap-4 justify-between">
        <button className="py-1 px-4 text-white bg-red-500 rounded-xl hover:bg-red-600" onClick={buyGearHandler}>
          Buy Gear
        </button>
        <button className="py-1 px-4 text-white bg-red-500 rounded-xl hover:bg-red-600" onClick={refreshMarketHandler}>
          Refresh Market
        </button>
      </div>
    </section>
  );
};

interface GearCardProps {
  active: boolean;
  clickHandler: () => void;
  gear: Gear;
}

const GearCard = ({ active, clickHandler, gear }: GearCardProps) => {
  return (
    <div
      className={`flex flex-col gap-1 justify-between items-center p-2 w-32 h-40 text-white bg-red-500 rounded-lg hover:bg-red-600 ${active ? "ring-2 ring-red-700" : ""}`}
      onClick={clickHandler}
    >
      <div className="flex gap-1 items-center">
        <FaMoneyBill />
        <span>{gearDataRecord[gear].cost}</span>
      </div>
      <img className="size-16" src="favicon.png" />
      <p className="overflow-hidden font-bold text-center text-nowrap overflow-ellipsis">{camelToTitleCase(gear)}</p>
    </div>
  );
};

export default MarketSection;
