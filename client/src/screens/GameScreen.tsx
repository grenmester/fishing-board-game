import { ActionType, ClientMessageType, type Action, type Game, type PlayerProfile } from "../../../shared/types";
import ActionCardsSection from "../components/ActionCardsSection";
import FishSection from "../components/FishSection";
import FishingSection from "../components/FishingSection";
import GamePlayersSection from "../components/GamePlayersSection";
import MarketSection from "../components/MarketSection";
import GearSection from "../components/GearSection";

interface GameScreenProps {
  roomId: string;
  playerProfiles: Record<string, PlayerProfile>;
  playerId: string;
  game: Game;
  sendMessage: (message: string) => void;
}

const GameScreen = ({ roomId, playerProfiles, playerId, game, sendMessage }: GameScreenProps) => {
  const makeTurn = (action: Action) => {
    sendMessage(
      JSON.stringify({
        type: ClientMessageType.MakeTurn,
        action,
      }),
    );
  };

  const endTurnHandler = () => {
    makeTurn({ actionType: ActionType.EndTurn });
  };

  const player = game.players[playerId];
  if (!player) {
    throw Error();
  }

  return (
    <main className="flex flex-col gap-10 items-center">
      <div className="text-center">
        <p>
          <span className="font-bold">Player Name:</span> {playerProfiles[playerId]?.playerName}
        </p>
        <p>
          <span className="font-bold">Room ID:</span> {roomId}
        </p>
      </div>
      <GamePlayersSection
        currentPlayerId={game.currentPlayerId}
        playerProfiles={playerProfiles}
        players={game.players}
      />
      <p>
        Turn {game.turnIdx + 1}: <span className="font-bold">{playerProfiles[game.currentPlayerId]?.playerName}</span>{" "}
        is currently taking their turn
      </p>
      <MarketSection makeTurn={makeTurn} market={game.market} />
      <FishingSection
        allowedLocations={game.turnConfig.allowedLocations}
        fishingAttempts={game.fishingAttempts}
        location={game.location}
        makeTurn={makeTurn}
      />
      <GearSection gearList={player.gearList} makeTurn={makeTurn} />
      <FishSection fishList={player.fishList} makeTurn={makeTurn} />
      <ActionCardsSection actionCards={player.actionCards} game={game} makeTurn={makeTurn} />
      {playerId === game.currentPlayerId && (
        <button
          className="py-1 px-4 mx-auto text-white bg-amber-500 rounded-xl hover:bg-amber-600 w-fit"
          onClick={endTurnHandler}
        >
          End Turn
        </button>
      )}
      <div className="p-4 w-full max-w-4xl bg-cyan-100 rounded-xl">
        <h2 className="font-bold text-center">Game State</h2>
        <pre>{JSON.stringify(game, null, 2)}</pre>
      </div>
    </main>
  );
};

export default GameScreen;
