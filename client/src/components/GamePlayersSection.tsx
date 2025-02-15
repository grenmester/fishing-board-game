import { FaFish, FaMoneyBill, FaShop, FaStar } from "react-icons/fa6";
import { TbPlayCardAFilled } from "react-icons/tb";

import type { GamePlayer, PlayerProfile } from "shared/types";

interface GamePlayersSectionProps {
  currentPlayerId: string;
  playerProfiles: Record<string, PlayerProfile>;
  players: Record<string, GamePlayer>;
}

const GamePlayersSection = ({ currentPlayerId, playerProfiles, players }: GamePlayersSectionProps) => {
  return (
    <section className="flex flex-wrap gap-10 justify-center max-w-4xl">
      {Object.entries(playerProfiles).map(([key, { playerId }]) => {
        const playerName = playerProfiles[playerId]?.playerName;
        const player = players[playerId];
        if (!playerName || !player) return <></>;
        return (
          <GamePlayerCard active={playerId === currentPlayerId} key={key} player={player} playerName={playerName} />
        );
      })}
    </section>
  );
};

interface GamePlayerCardProps {
  active: boolean;
  player: GamePlayer;
  playerName: string;
}

const GamePlayerCard = ({ active, player, playerName }: GamePlayerCardProps) => {
  return (
    <article
      className={`flex gap-2 items-center p-2 bg-amber-300 rounded-xl shadow ${active ? "ring-2 ring-amber-500" : ""}`}
    >
      <div className="flex flex-col gap-1 items-center">
        <img className="size-10" src="favicon.png" />
        <p className="overflow-hidden w-16 text-xs text-center text-nowrap overflow-ellipsis">{playerName}</p>
      </div>
      <div className="flex flex-col justify-between p-1 w-36 h-full bg-amber-200 rounded-lg">
        <div className="flex gap-4 self-center">
          <div className="flex gap-1 items-center">
            <FaStar className="text-yellow-500" />
            <span>{player.reputation}</span>
          </div>
          <div className="flex gap-1 items-center">
            <FaMoneyBill className="text-green-500" />
            <span>{player.money}</span>
          </div>
        </div>
        <div className="flex gap-4 self-center">
          <div className="flex gap-1 items-center">
            <FaFish className="text-blue-500" />
            <span>{player.fishList.length}</span>
          </div>
          <div className="flex gap-1 items-center">
            <TbPlayCardAFilled className="text-purple-500" />
            <span>{player.actionCards.length}</span>
          </div>
          <div className="flex gap-1 items-center">
            <FaShop className="text-red-500" />
            <span>{player.gearList.length}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default GamePlayersSection;
