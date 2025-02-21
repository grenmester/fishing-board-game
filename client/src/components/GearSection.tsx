import { useState } from "react";
import { FaStar } from "react-icons/fa6";
import { GiFishingPole } from "react-icons/gi";

import { gearDataRecord } from "../../../shared/data";
import { type Action, ActionType, Gear } from "../../../shared/types";
import { camelToTitleCase } from "../utils";

interface GearSectionProps {
  gearList: Gear[];
  makeTurn: (action: Action) => void;
}

const GearSection = ({ gearList, makeTurn }: GearSectionProps) => {
  const [gearIdx, setGearIdx] = useState<number>();

  const clickGearHandler = (idx: number) => () => {
    setGearIdx(idx);
  };

  const donateGearHandler = () => {
    if (gearIdx !== undefined) {
      makeTurn({
        actionType: ActionType.DonateGear,
        gearIdx,
      });
      setGearIdx(undefined);
    }
  };

  return (
    <section className="flex flex-col gap-2 p-4 bg-gray-300 rounded-xl shadow">
      <div className="flex gap-2 items-center text-gray-900">
        <h3 className="text-lg font-bold">Gear</h3>
        <GiFishingPole size={20} />
      </div>
      <div className="flex gap-2 justify-between mx-auto">
        {gearList.map((gear, idx) => (
          <GearCard
            active={idx === gearIdx}
            clickHandler={clickGearHandler(idx)}
            gear={gear}
            key={`${gear}${idx.toString()}`}
          />
        ))}
      </div>
      <div className="flex gap-4 justify-between">
        <button className="py-1 px-4 text-white bg-gray-500 rounded-xl hover:bg-gray-600" onClick={donateGearHandler}>
          Donate Gear
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
      className={`flex flex-col gap-1 justify-between items-center p-2 w-32 h-40 text-white bg-gray-500 rounded-lg hover:bg-gray-600 ${active ? "ring-2 ring-gray-700" : ""}`}
      onClick={clickHandler}
    >
      <div className="flex gap-1 items-center">
        <FaStar />
        <span>{gearDataRecord[gear].reputation}</span>
      </div>
      <img className="size-16" src="favicon.png" />
      <p className="overflow-hidden font-bold text-center text-nowrap overflow-ellipsis">{camelToTitleCase(gear)}</p>
    </div>
  );
};

export default GearSection;
