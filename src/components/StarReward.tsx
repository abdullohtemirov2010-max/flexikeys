import React from 'react';

interface StarRewardProps {
  count: number; // 1-3
  show: boolean;
}

const StarReward: React.FC<StarRewardProps> = ({ count, show }) => {
  if (!show) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {[1, 2, 3].map(i => (
        <span
          key={i}
          className={`text-4xl ${i <= count ? 'animate-star-pop' : 'opacity-20'}`}
          style={{ animationDelay: `${(i - 1) * 0.15}s` }}
        >
          ⭐
        </span>
      ))}
    </div>
  );
};

export default StarReward;
