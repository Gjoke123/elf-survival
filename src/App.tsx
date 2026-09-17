import { useEffect, useRef, useState } from "react";
import { Game } from "./game/Game";
import type { Upgrade } from "./game/types/Upgrade";
import { LevelUpModal } from "./components/LevelUpModal";
import { GameOverModal } from "./components/GameOverModal";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);

  const [gameOver, setGameOver] = useState(false);
  const [upgrades, setUpgrades] = useState<Upgrade[] | null>(null);

  const [levelComplete, setLevelComplete] = useState<{
    currentLevel: number;
    nextLevel: number;
  } | null>(null);

  const [victory, setVictory] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const game = new Game(
      canvasRef.current,

      // Level Up
      (availableUpgrades) => {
        setUpgrades(availableUpgrades);
      },

      // Game Over
      () => {
        setGameOver(true);
      },

      // Level Complete
      (currentLevel, nextLevel) => {
        setLevelComplete({
          currentLevel,
          nextLevel,
        });
      },

      // Victory
      () => {
        setVictory(true);
      }
    );

    gameRef.current = game;

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  const handleUpgrade = (upgrade: Upgrade) => {
    gameRef.current?.applyUpgrade(upgrade);

    setUpgrades(null);
  };

  const handleContinueLevel = () => {
    gameRef.current?.continueToNextLevel();

    setLevelComplete(null);
  };

  const handleRestart = () => {
    gameRef.current?.restart();

    setGameOver(false);
    setUpgrades(null);
    setLevelComplete(null);
    setVictory(false);
  };

  return (
    <>
      <canvas ref={canvasRef} />

      {upgrades && (
        <LevelUpModal
          upgrades={upgrades}
          onSelect={handleUpgrade}
        />
      )}

      {gameOver && (
        <GameOverModal
          onRestart={handleRestart}
        />
      )}

      {levelComplete && (
        <div className="level-complete-overlay">
          <div className="level-complete-modal">
            <h1>LEVEL COMPLETE</h1>

            <p>
              Level {levelComplete.currentLevel} completed!
            </p>

            <p>
              Next level: {levelComplete.nextLevel}
            </p>

            <button onClick={handleContinueLevel}>
              CONTINUE
            </button>
          </div>
        </div>
      )}

      {victory && (
        <div className="victory-overlay">
          <div className="victory-modal">
            <h1>VICTORY!</h1>

            <p>
              You defeated the demons!
            </p>

            <button onClick={handleRestart}>
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
