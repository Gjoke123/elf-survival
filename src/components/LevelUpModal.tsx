import type { Upgrade } from "../game/types/Upgrade";

type Props = {
  upgrades: Upgrade[];
  onSelect: (upgrade: Upgrade) => void;
};

export function LevelUpModal({
  upgrades,
  onSelect,
}: Props) {
  return (
    <div className="level-up-overlay">
      <div className="level-up-modal">
        <h1>LEVEL UP!</h1>

        <p>Choose your upgrade</p>

        <div className="upgrade-list">
          {upgrades.map((upgrade) => (
            <button
              key={upgrade.type}
              className="upgrade-card"
              onClick={() => onSelect(upgrade)}
            >
              <strong>{upgrade.title}</strong>

              <span>
                {upgrade.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}