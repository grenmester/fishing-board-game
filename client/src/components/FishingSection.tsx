import { useState } from "react";
import { TbFishHook } from "react-icons/tb";

import { type Action, ActionType, Location } from "../../../shared/types";
import { camelToTitleCase } from "../utils";

interface FishingSectionProps {
  allowedLocations: Location[];
  fishingAttempts: number;
  location: Location | undefined;
  makeTurn: (action: Action) => void;
}

const FishingSection = ({ allowedLocations, fishingAttempts, location, makeTurn }: FishingSectionProps) => {
  const [locationIdx, setLocationIdx] = useState<number>();

  const clickLocationHandler = (idx: number) => () => {
    setLocationIdx(idx);
  };

  const setLocationHandler = () => {
    if (locationIdx !== undefined && allowedLocations[locationIdx]) {
      makeTurn({
        actionType: ActionType.SetLocation,
        location: allowedLocations[locationIdx],
      });
      setLocationIdx(undefined);
    }
  };

  const catchFishHandler = () => {
    makeTurn({ actionType: ActionType.CatchFish });
  };

  return (
    <section className="flex flex-col gap-2 p-4 rounded-xl shadow bg-sky-300">
      <div className="flex gap-2 items-center text-sky-900">
        <h3 className="text-lg font-bold">Fishing</h3>
        <TbFishHook size={20} />
      </div>
      <div>
        <p>
          <span className="font-bold">Location:</span> {location}
        </p>
        <p>
          <span className="font-bold">Catches Made:</span> {fishingAttempts}
        </p>
      </div>
      <div className="flex gap-2 justify-between mx-auto">
        {allowedLocations.map((location, idx) => (
          <LocationCard
            active={idx === locationIdx}
            clickHandler={clickLocationHandler(idx)}
            location={location}
            key={`${location}${idx.toString()}`}
          />
        ))}
      </div>
      <div className="flex gap-4 justify-between">
        <button className="py-1 px-4 text-white rounded-xl bg-sky-500 hover:bg-sky-600" onClick={setLocationHandler}>
          Set Location
        </button>
        <button className="py-1 px-4 text-white rounded-xl bg-sky-500 hover:bg-sky-600" onClick={catchFishHandler}>
          Catch Fish
        </button>
      </div>
    </section>
  );
};

interface LocationCardProps {
  active: boolean;
  clickHandler: () => void;
  location: string;
}

const LocationCard = ({ active, clickHandler, location }: LocationCardProps) => {
  return (
    <div
      className={`flex flex-col gap-1 justify-between text-white items-center p-2 w-24 h-28 bg-sky-500 rounded-lg hover:bg-sky-600 ${active ? "ring-2 ring-sky-700" : ""}`}
      onClick={clickHandler}
    >
      <img className="size-16" src="favicon.png" />
      <p className="overflow-hidden font-bold text-center text-nowrap overflow-ellipsis">{camelToTitleCase(location)}</p>
    </div>
  );
};

export default FishingSection;
