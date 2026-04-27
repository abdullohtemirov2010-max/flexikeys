import React from 'react';
import mascotNeutral from '@/assets/mascot-neutral.png';
import mascotHappy from '@/assets/mascot-happy.png';
import mascotEncouraging from '@/assets/mascot-encouraging.png';

type MascotMood = 'happy' | 'neutral' | 'encouraging';

interface CloudMascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
}

const moodImages: Record<MascotMood, string> = {
  neutral: mascotNeutral,
  happy: mascotHappy,
  encouraging: mascotEncouraging,
};

const CloudMascot: React.FC<CloudMascotProps> = ({ mood = 'neutral', size = 160, className = '' }) => {
  return (
    <div className={`animate-float ${className}`} style={{ width: size, height: size }}>
      <img
        src={moodImages[mood]}
        alt="Cloud mascot"
        width={size}
        height={size}
        className="w-full h-full object-contain drop-shadow-lg"
      />
    </div>
  );
};

export default CloudMascot;
