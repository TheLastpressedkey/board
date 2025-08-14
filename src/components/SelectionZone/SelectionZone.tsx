import React from 'react';

interface SelectionZoneProps {
  zone: {
    startX: number;
    startY: number;
    width: number;
    height: number;
  };
}

export function SelectionZone({ zone }: SelectionZoneProps) {
  return (
    <div
      className="absolute border-2 border-pink-500 bg-pink-500/10 rounded-lg pointer-events-none"
      style={{
        left: zone.startX,
        top: zone.startY,
        width: zone.width,
        height: zone.height
      }}
    />
  );
}