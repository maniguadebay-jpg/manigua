'use client';
import React from 'react';

interface TickerProps {
  items: React.ReactNode[];
  className?: string;
}

export const Ticker: React.FC<TickerProps> = ({ items, className }) => {
  return (
    <div className={`flex items-center gap-0 overflow-hidden ${className ?? ''}`}>
      <div className="flex animate-none items-center">
        {items}
      </div>
    </div>
  );
};
