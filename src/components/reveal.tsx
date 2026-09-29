'use client';
import React from 'react';

interface RevealProps {
  children?: React.ReactNode;
  delay?: number;
  className?: string;
}

export const Reveal: React.FC<RevealProps> = ({ children, className }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};
