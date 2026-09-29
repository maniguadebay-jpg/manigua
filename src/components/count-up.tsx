'use client';
import React from 'react';

interface CountUpProps {
  value: number;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({ value }) => {
  return <span>{value}</span>;
};
