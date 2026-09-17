type Props = {
  onRestart: () => void;
};

export function GameOverModal({ onRestart }: Props) {
  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <h1>GAME OVER</h1>

        <p>Your journey has ended.</p>

        <button onClick={onRestart}>
          RESTART
        </button>
      </div>
    </div>
  );
}