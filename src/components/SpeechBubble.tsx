import React from 'react';

interface SpeechBubbleProps {
  text: string;
  className?: string;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, className = '' }) => (
  <div className={`relative bg-card rounded-3xl px-6 py-3 shadow-sm border border-border max-w-xs ${className}`}>
    <p className="text-center text-foreground font-medium text-lg">{text}</p>
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-b border-r border-border rotate-45" />
  </div>
);

export default SpeechBubble;
