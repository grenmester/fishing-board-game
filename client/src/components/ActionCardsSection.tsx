import { type ChangeEvent, type Dispatch, useState } from "react";
import { TbPlayCardAFilled } from "react-icons/tb";

import {
  type Action,
  ActionCard,
  type ActionCardInput,
  ActionType,
  type BorrowGearActionCardInput,
  type BorrowMoneyActionCardInput,
  type Game,
} from "../../../shared/types";
import { camelToTitleCase } from "../utils";

interface ActionCardsSectionProps {
  actionCards: ActionCard[];
  game: Game;
  makeTurn: (action: Action) => void;
}

const ActionCardsSection = ({ actionCards, game, makeTurn }: ActionCardsSectionProps) => {
  const [actionCardIdx, setActionCardIdx] = useState<number>();
  const [actionCardInput, setActionCardInput] = useState<Partial<ActionCardInput>>();

  const actionCard = actionCards[actionCardIdx ?? -1];

  const clickActionCardHandler = (idx: number) => () => {
    if (actionCards[idx]) {
      setActionCardIdx(idx);
      setActionCardInput({ actionCard: actionCards[idx] });
    }
  };

  const playActionCardHandler = () => {
    if (actionCardIdx !== undefined) {
      makeTurn({
        actionType: ActionType.PlayActionCard,
        actionCardIdx,
        actionCardInput: actionCardInput as ActionCardInput,
      });
    }
  };

  return (
    <section className="flex flex-col gap-2 p-4 bg-purple-300 rounded-xl shadow">
      <div className="flex gap-2 items-center text-purple-900">
        <h3 className="text-lg font-bold">Action Cards</h3>
        <TbPlayCardAFilled size={20} />
      </div>
      <div className="flex gap-2 justify-between mx-auto">
        {actionCards.map((actionCard, idx) => (
          <ActionCardCard
            actionCard={actionCard}
            active={idx === actionCardIdx}
            clickHandler={clickActionCardHandler(idx)}
            key={`${actionCard}${idx.toString()}`}
          />
        ))}
      </div>
      {actionCard === ActionCard.BorrowGear && (
        <BorrowGearSelection actionCardInput={actionCardInput} game={game} setActionCardInput={setActionCardInput} />
      )}
      {actionCard === ActionCard.BorrowMoney && (
        <BorrowMoneySelection actionCardInput={actionCardInput} game={game} setActionCardInput={setActionCardInput} />
      )}
      <div className="flex gap-4 justify-between">
        {actionCardIdx !== undefined && (
          <button
            className="py-1 px-4 text-white bg-purple-500 rounded-xl hover:bg-purple-600"
            onClick={playActionCardHandler}
          >
            Play Action Card
          </button>
        )}
      </div>
    </section>
  );
};

interface ActionCardCardProps {
  actionCard: string;
  active: boolean;
  clickHandler: () => void;
}

const ActionCardCard = ({ actionCard, active, clickHandler }: ActionCardCardProps) => {
  return (
    <div
      className={`flex flex-col gap-1 justify-between items-center p-2 w-32 h-40 text-white bg-purple-500 rounded-lg hover:bg-purple-600 ${active ? "ring-2 ring-purple-700" : ""}`}
      onClick={clickHandler}
    >
      <img className="size-16" src="favicon.png" />
      <p className="overflow-hidden font-bold text-center overflow-ellipsis line-clamp-2">{camelToTitleCase(actionCard)}</p>
    </div>
  );
};

interface BorrowGearSelectionProps {
  actionCardInput: Partial<ActionCardInput> | undefined;
  game: Game;
  setActionCardInput: Dispatch<Partial<ActionCardInput>>;
}

const BorrowGearSelection = ({ actionCardInput, game, setActionCardInput }: BorrowGearSelectionProps) => {
  const clickPlayerHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setActionCardInput({
      actionCard: ActionCard.BorrowGear,
      playerId: e.target.value,
    });
  };

  const clickGearHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setActionCardInput({
      ...(actionCardInput as BorrowGearActionCardInput),
      gearIdx: parseInt(e.target.value),
    });
  };

  return (
    <div>
      {Object.keys(game.players).map((playerId) => (
        <label key={playerId}>
          <input
            type="radio"
            value={playerId}
            checked={(actionCardInput as BorrowGearActionCardInput).playerId === playerId}
            onChange={clickPlayerHandler}
          />
          {playerId}
        </label>
      ))}
      <br />
      {actionCardInput &&
        "playerId" in actionCardInput &&
        game.players[actionCardInput.playerId]?.gearList.map((gear, idx) => (
          <label key={idx}>
            <input
              type="radio"
              value={idx}
              checked={(actionCardInput as BorrowGearActionCardInput).gearIdx === idx}
              onChange={clickGearHandler}
            />
            {gear}
          </label>
        ))}
    </div>
  );
};

interface BorrowMoneySelectionProps {
  actionCardInput: Partial<ActionCardInput> | undefined;
  game: Game;
  setActionCardInput: Dispatch<Partial<ActionCardInput>>;
}

const BorrowMoneySelection = ({ actionCardInput, game, setActionCardInput }: BorrowMoneySelectionProps) => {
  const clickPlayerHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setActionCardInput({
      ...(actionCardInput as BorrowMoneyActionCardInput),
      playerId: e.target.value,
    });
  };

  return (
    <div>
      {Object.keys(game.players).map((playerId) => (
        <label key={playerId}>
          <input
            type="radio"
            value={playerId}
            checked={(actionCardInput as BorrowMoneyActionCardInput).playerId === playerId}
            onChange={clickPlayerHandler}
          />
          {playerId}
        </label>
      ))}
    </div>
  );
};

export default ActionCardsSection;
